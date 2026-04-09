# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from uuid import UUID
from fastapi import APIRouter, HTTPException, Response, status
import logging
from fastapi.responses import FileResponse, PlainTextResponse
from authlib.jose import JsonWebEncryption, JsonWebKey
import json

from src.dependencies import CardServiceDep
from src.schemas.cards import AddCardResponse, CardResponse, AddCardRequest, EncryptedAddCardRequest

# Generate an ephemeral RSA key pair at startup for encrypting card data
# in transit between the frontend and backend.
_rsa_key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
CARD_DATA_PRIVATE_KEY = _rsa_key
CARD_DATA_PUBLIC_KEY_PEM = _rsa_key.as_pem(is_private=False).decode('utf-8')

router = APIRouter()

@router.get("/public-key")
async def get_public_key() -> PlainTextResponse:
    """Returns the public key for encrypting card details."""
    return PlainTextResponse(CARD_DATA_PUBLIC_KEY_PEM)

@router.post("")
async def add_card(
    add_card_request: EncryptedAddCardRequest,
    card_service: CardServiceDep
) -> AddCardResponse:
    """Adds a new card."""
    try:
        # Decrypt the encrypted payment instrument
        jwe_token = add_card_request.enc_payment_instrument
        jwe_instance = JsonWebEncryption()
        result = jwe_instance.deserialize_compact(jwe_token, CARD_DATA_PRIVATE_KEY)
        plaintext = result["payload"].decode('utf-8')
        # Convert the plaintext to an unencrypted AddCardRequest object
        card_request_data = json.loads(plaintext)
        add_card_request_obj = AddCardRequest(**card_request_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to decrypt payment instrument: {str(e)}"
        )
    return await card_service.add_card(add_card_request_obj)

@router.get("")
async def get_cards(
    card_service: CardServiceDep
) -> list[CardResponse]:
    """Retrieves all cards."""
    return await card_service.get_cards()

@router.get("/{card_id}")
async def get_card(
    card_id: UUID,
    card_service: CardServiceDep
) -> CardResponse:
    """Retrieves a specific card by its ID."""
    return await card_service.get_card(card_id)

@router.get("/{card_id}/art")
async def get_card_art(
    card_id: UUID,
    card_service: CardServiceDep
) -> Response:
    """Retrieves the card art for a specific card."""
    return await card_service.get_card_art(card_id)

@router.delete("/{card_id}")
async def delete_card(
    card_id: UUID,
    card_service: CardServiceDep
) -> None:
    """Deletes a card by its ID."""
    await card_service.delete_card(card_id)