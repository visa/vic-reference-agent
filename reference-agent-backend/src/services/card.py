# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


import base64
import json
import logging
import os
import time
import uuid
from uuid import UUID

from fastapi import HTTPException, Response, status
from sqlalchemy.exc import IntegrityError

from src.enums import IntentStatus, MandateStatus
from src.models.card import Card
from src.models.card_art import CardArt
from src.models.card_art_map import CardArtMap
from src.models.intent import Intent
from src.repositories.card import CardRepository
from src.repositories.intent import IntentRepository
from src.repositories.mandate import MandateRepository
from src.schemas.cards import AddCardRequest, AddCardResponse, CardResponse, ProvisionTokenRequest
from src.services.vdp_client import VDPClient
from src.utils.constants import CACHE_CONTROL_MAX_AGE

class CardService:
    def __init__(self, vdp_client: VDPClient, card_repo: CardRepository, intent_repo: IntentRepository, mandate_repo: MandateRepository):
        self.vdp_client = vdp_client
        self.card_repo = card_repo
        self.intent_repo = intent_repo
        self.mandate_repo = mandate_repo
    
    async def add_card(self, request: AddCardRequest) -> AddCardResponse:
        """
        Adds a card for the user and provisions a token.

        Args:
            request (AddCardRequest): The card details to be added.
            current_user (CurrentUser): The current user making the request.

        Returns:
            AddCardResponse: A response containing the provisioned token ID and passkey URL.
        """
        # Enroll PAN (fatal)
        try:
            card_id = uuid.uuid4()
            pan_enrollment_response = self.vdp_client.enroll_pan(
                card_number=request.card_number,
                exp_month=request.exp_month,
                exp_year=request.exp_year,
                cvv=request.cvv,
                name=request.name_on_card
            )
            pan_enrollment_id = pan_enrollment_response.get("vPanEnrollmentID")
            if not pan_enrollment_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="PAN enrollment failed")
        except Exception as e:
            logging.error("PAN enrollment failed", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="PAN enrollment failed")
        # Add card to database (fatal)
        try:
            card = Card(
                id=card_id,
                last_4=request.card_number[-4:],
                type='V',
                exp_month=request.exp_month,
                exp_year=request.exp_year,
                status='PENDING',
                pan_enrollment_id=pan_enrollment_id
            )
            await self.card_repo.add(card)
            await self.card_repo.commit()
        except IntegrityError as e:
            logging.error("IntegrityError while adding card", exc_info=True)
            await self.card_repo.rollback()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Card already exists or invalid data")
        # Provision token (non-fatal)
        try:
            await self.provision_token(ProvisionTokenRequest(card_id=card_id))
        except Exception as e:
            logging.error("Token provisioning failed", exc_info=True)
            await self.card_repo.rollback()
        # Add card art for the card (non-fatal)
        try:
            card_metadata = pan_enrollment_response.get("cardMetaData", {})
            card_art_data = next((data for data in card_metadata.get("cardData", []) if data.get("contentType") == "digitalCardArt"), None)
            card_art_id = card_art_data.get("guid") if card_art_data else None
            await self.put_card_art(pan_enrollment_id, card_art_id)
        except Exception as e:
            logging.error("Failed to put card art", exc_info=True)
            await self.card_repo.rollback()
        return AddCardResponse(card_id=card_id)

    async def provision_token(self, provision_request: ProvisionTokenRequest) -> CardResponse:
        """ Provisions a token for the given card ID.

        Args:
            provision_request (ProvisionTokenRequest): The request containing card ID and IP address.

        Returns:
            ProvisionTokenResponse: A response containing the provisioned token ID.
        """
        try:
            card = await self.card_repo.get(provision_request.card_id)
            if not card:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")
            if card.token_id is not None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token already provisioned for this card.")
            token = self.vdp_client.provision_token_given_pan_enrollment_id(
                pan_enrollment_id=card.pan_enrollment_id,
                exp_month=card.exp_month,
                exp_year=card.exp_year
            )
            token_id = token.get("vProvisionedTokenID", None)
            if not token_id:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token provisioning failed")
        except Exception as e:
            logging.error("Token provisioning failed", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token provisioning failed")
        try:
            card.token_id = token_id
            await self.card_repo.update(card)
            await self.card_repo.commit()
        except Exception as e:
            logging.error("Error updating card with token ID", exc_info=True)
            await self.card_repo.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to update card with token ID")
        return CardResponse(
            card_id=card.id,
            exp_month=card.exp_month,
            exp_year=card.exp_year,
            last_4=card.last_4,
            status=card.status,
            token_id=card.token_id
        )
        
    async def get_card(self, card_id: UUID) -> CardResponse:
        card = await self.card_repo.get(card_id)
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")
        
        return CardResponse(
            card_id=card.id,
            exp_month=card.exp_month,
            exp_year=card.exp_year,
            last_4=card.last_4,
            status=card.status,
            token_id=card.token_id
        )

    async def get_cards(self) -> list[CardResponse]:
        """
        Fetches all cards.

        Returns:
            List[CardResponse]: A list of card responses containing card details.
        """
        cards = await self.card_repo.get_all()
        return [
            CardResponse(
                card_id=card.id,
                exp_month=card.exp_month,
                exp_year=card.exp_year,
                last_4=card.last_4,
                status=card.status,
                token_id=card.token_id
            )
            for card in cards
        ]

    async def get_card_art(self, card_id: UUID) -> Response:
        """
        Fetches the card art for a given card ID.
        
        Args:
            card_id (UUID): The ID of the card to fetch art for.
        
        Returns:
            Response: The card art as a response.
        """
        card = await self.card_repo.get(card_id)
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")
        
        # Get the card art map entry for the PAN enrollment ID
        card_art_map = await self.card_repo.get_card_art_map(card.pan_enrollment_id)
        if not card_art_map:
            card_art_id = await self.put_card_art(card.pan_enrollment_id, None)
        else:
            card_art_id = card_art_map.card_art_id
        
        # Get the card art by its ID
        card_art = await self.card_repo.get_card_art(card_art_id)
        if not card_art:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card art not found.")

        return Response(content=card_art.data, media_type=card_art.mime_type, headers={"Cache-Control": f"public, max-age={CACHE_CONTROL_MAX_AGE}"})
    
    async def put_card_art(self, pan_enrollment_id: str, card_art_id: str | None) -> str:
        # Fetch the latest card art GUID for the PAN enrollment ID if not provided
        if not card_art_id:
            card_metadata = self.vdp_client.get_card_metadata(pan_enrollment_id)
            card_art_data = next((data for data in card_metadata.get("cardData", []) if data.get("contentType") == "digitalCardArt"), None)
            card_art_id = card_art_data.get("guid") if card_art_data else None
            if not card_art_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card art GUID not found for PAN.")
        
        # Add the card art image if it does not already exist
        card_art = await self.card_repo.get_card_art(card_art_id)
        if not card_art:
            card_art_response = self.vdp_client.get_card_art(card_art_id)
            if not card_art_response:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card art image not found.")
            card_art = CardArt(
                id=card_art_id,
                mime_type=card_art_response.get("mimeType"),
                data=base64.b64decode(card_art_response.get("encodedData"))
            )
            await self.card_repo.add_card_art(card_art)
            await self.card_repo.commit()

        # Update the card art GUID for the PAN enrollment ID if it does not already exist/match
        card_art_map = await self.card_repo.get_card_art_map(pan_enrollment_id)
        if not card_art_map:
            card_art_map = CardArtMap(pan_enrollment_id=pan_enrollment_id, card_art_id=card_art_id)
            await self.card_repo.add_card_art_map(card_art_map)
            await self.card_repo.commit()
        elif card_art_map.card_art_id != card_art_id:
            card_art_map.card_art_id = card_art_id
            await self.card_repo.update_card_art_map(card_art_map)
            await self.card_repo.commit()

        return card_art_id
    
    async def delete_card(self, card_id: UUID) -> None:
        """
        Deletes a card by its ID for the authenticated user.

        Args:
            card_id (str): The ID of the card to delete.

        Returns:
            None
        """
        card = await self.card_repo.get(card_id)
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")
        pan_enrollment_id = card.pan_enrollment_id
        # Deprovision the token if it exists (non-fatal)
        try:
            if card.token_id:
                self.vdp_client.deprovision(
                    provisioned_token_id=card.token_id
                )
        except Exception as e:
            logging.error("Deprovisioning failed", exc_info=True)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Token deprovisioning failed")
        # Delete the card from the database (fatal)
        try:
            await self.card_repo.delete(card)
            await self.card_repo.commit()
        except IntegrityError as e:
            logging.error("IntegrityError while deleting card", exc_info=True)
            await self.card_repo.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to delete card")
        # If there are no more cards with this PAN enrollment ID, delete the card art mapping (non-fatal)
        try:
            if not await self.card_repo.get_by_pan_enrollment_id(pan_enrollment_id):
                await self.card_repo.delete_card_art_map(pan_enrollment_id)
                await self.card_repo.commit()
        except Exception as e:
            logging.error("Failed to delete card art mapping", exc_info=True)
            await self.card_repo.rollback()