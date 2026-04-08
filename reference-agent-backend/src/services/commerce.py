# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import time
from uuid import uuid4

from fastapi import HTTPException, status
from src.enums import IntentStatus, TransactionStatus
from src.utils.constants import (
    THREE_DAYS_SECONDS, DEFAULT_MERCHANT_URL, DEFAULT_COUNTRY_CODE,
    DEFAULT_INTENT_DESCRIPTION, TRANSACTION_STATUS_APPROVED, TRANSACTION_STATUS_DECLINED
)
from src.models.intent import Intent
from src.models.mandate import Mandate
from src.models.transaction import Transaction
from src.repositories.card import CardRepository
from src.repositories.intent import IntentRepository
from src.repositories.mandate import MandateRepository
from src.repositories.transaction import TransactionRepository
from src.schemas.commerce import AgenticCheckoutRequest, AgenticCheckoutResponse, Credentials, EnrollRequest, TransactionAmount, TransactionData
from src.services.chat import ChatService
from src.services.vdp_client import VDPClient

class CommerceService:
    def __init__(self, vdp_client: VDPClient, intent_repo: IntentRepository, mandate_repo: MandateRepository, transaction_repo: TransactionRepository, card_repo: CardRepository, chat_service: ChatService):
        self.vdp_client = vdp_client
        self.intent_repo = intent_repo
        self.mandate_repo = mandate_repo
        self.transaction_repo = transaction_repo
        self.card_repo = card_repo
        self.chat_service = chat_service

    async def enroll_token(self, enroll_request: EnrollRequest):
        card = await self.card_repo.get_by_token_id(enroll_request.provisioned_token_id)
        if not card:
            return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found for the provided token ID.")
        
        enroll_response = self.vdp_client.enroll_card(
            provisioned_token_id=enroll_request.provisioned_token_id,
            client_device_id=enroll_request.client_device_id,
            ip=enroll_request.ip,
            user_agent=enroll_request.user_agent,
            device_info=enroll_request.device_info
        )

        # If enrollment is successful, activate the card in the database
        if enroll_response and enroll_response.get("status") == "ACTIVE":
            card.status = 'ACTIVE'
            await self.card_repo.update(card)
            await self.card_repo.commit()
        return enroll_response
    
    async def handle_agentic_checkout(self, agentic_checkout_request: AgenticCheckoutRequest) -> AgenticCheckoutResponse:
        # Validate card
        card = await self.card_repo.get_by_token_id(agentic_checkout_request.provisioned_token_id)
        if not card:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found for the provided token ID.")
        
        # Create intent in VIC
        mandate_id = uuid4()
        effective_until_time = int(time.time()) + THREE_DAYS_SECONDS
        intent_response = self.vdp_client.create_intent(
            provisioned_token_id=agentic_checkout_request.provisioned_token_id,
            mandate_id=str(mandate_id),
            amount=agentic_checkout_request.amount,
            currency_code=agentic_checkout_request.currency_code,
            assurance_data=agentic_checkout_request.assurance_data,
            verification_timestamp=int(time.time()),
            expiration_timestamp=effective_until_time,
            prompt=agentic_checkout_request.prompt,
            client_device_id=agentic_checkout_request.client_device_id,
            ip=agentic_checkout_request.ip,
            user_agent=agentic_checkout_request.user_agent,
            device_info=agentic_checkout_request.device_info
        )
        if not intent_response or intent_response.get('status') == 'PENDING':
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create intent.")
        
        # Persist the intent and mandate records
        intent = await self.intent_repo.add(
            Intent(
                instruction_id=intent_response["instructionId"],
                card_id=card.id,
                last_4=card.last_4,
                status=IntentStatus.ACTIVE
            )
        )
        await self.intent_repo.flush()
        mandate = Mandate(
            id=mandate_id,
            intent_id=intent.id,
            amount=str(agentic_checkout_request.amount),
            currency_code=agentic_checkout_request.currency_code,
            effective_until_time=effective_until_time,
            description=agentic_checkout_request.prompt or DEFAULT_INTENT_DESCRIPTION
        )
        await self.mandate_repo.add(mandate)
        await self.intent_repo.commit()

        # Retrieve credentials from VIC
        transaction_data = TransactionData(
            transaction_amount=TransactionAmount(
                transaction_amount=str(agentic_checkout_request.amount),
                transaction_currency_code=agentic_checkout_request.currency_code
            ),
            merchant_name=agentic_checkout_request.prompt or "",
            merchant_country_code=DEFAULT_COUNTRY_CODE,
            merchant_url=DEFAULT_MERCHANT_URL,
            mandate_id=mandate.id
        )
        credentials_response = self.vdp_client.retrieve_credentials(
            provisioned_token_id=agentic_checkout_request.provisioned_token_id,
            instruction_id=intent.instruction_id,
            transaction_data=[transaction_data]
        )
        if not credentials_response or credentials_response.get("status") != "COMPLETED":
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve credentials.")
        payment_credentials = credentials_response.get("dynamicData")
        if not payment_credentials:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No payment credentials found in the response.")
        token = payment_credentials[0].get("token")
        credentials = Credentials(
            card_number=token.get("paymentToken"),
            exp_month=token.get("tokenExpirationMonth"),
            exp_year=token.get("tokenExpirationYear"),
            cvv=payment_credentials[0].get("dynamicDataValue")
        )

        # Persist the transaction record
        transaction = await self.transaction_repo.add(
            Transaction(
                id=transaction_data.transaction_reference_id,
                mandate_id=mandate.id,
                amount=str(agentic_checkout_request.amount),
                currency_code=agentic_checkout_request.currency_code,
                merchant_name=agentic_checkout_request.prompt or "",
                merchant_url=DEFAULT_MERCHANT_URL,
                merchant_country_code=DEFAULT_COUNTRY_CODE
            )
        )
        await self.transaction_repo.commit()

        # Complete checkout via ChatService
        checkout_response = await self.chat_service.complete_checkout(credentials)

        # Confirm the transaction in VIC
        self.vdp_client.confirm_transaction(
            instruction_id=intent.instruction_id,
            transaction_reference_id=str(transaction.id),
            dynamic_data_id=payment_credentials[0].get("dynamicDataId"),
            amount=str(agentic_checkout_request.amount),
            currency_code=agentic_checkout_request.currency_code,
            transaction_status=TRANSACTION_STATUS_APPROVED if checkout_response.purchase_summary else TRANSACTION_STATUS_DECLINED,
            order_id=checkout_response.purchase_summary.order_id if checkout_response.purchase_summary else None
        )

        # Update the transaction status
        transaction.status = TransactionStatus.SUCCESS if checkout_response.purchase_summary else TransactionStatus.FAILURE
        await self.transaction_repo.update(transaction)
        await self.transaction_repo.commit()

        return checkout_response