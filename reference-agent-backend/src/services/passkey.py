# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging
from fastapi import HTTPException, status
import json
import re
from src.services.vdp_client import VDPClient
from src.repositories.card import CardRepository
from src.schemas.passkey import AttestationOptionsAuthenticateRequest, DeviceBindingRequest, CreateChallengeRequest, SolveChallengeRequest, AttestationOptionsRegisterRequest

class PasskeyService:
    def __init__(self, vdp_client: VDPClient, card_repo: CardRepository):
        self.vdp_client = vdp_client
        self.card_repo = card_repo

    async def _verify_token_owned(self, provisioned_token_id: str) -> None:
        """Ensure the provisioned token belongs to this wallet before any passkey
        flow acts on it. Returns an identical 404 for missing vs not-owned, so it
        is not an existence oracle."""
        card = await self.card_repo.get_by_token_id(provisioned_token_id)
        if card is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Token not found."
            )

    async def attestation_options_authenticate(self, request: AttestationOptionsAuthenticateRequest) -> dict:
        await self._verify_token_owned(request.provisioned_token_id)
        auth_context = self.vdp_client.attestation_options_authenticate(
            id=str(request.client_reference_id),
            provisioned_token_id=request.provisioned_token_id,
            session_context=request.session_context.model_dump(by_alias=True),
            browser_data=request.browser_data.model_dump(by_alias=True),
            amount=request.amount if request.amount else "0",
            currency_code=request.currency_code if request.currency_code else "840",
            merchants=request.prompt
        )
        return auth_context

    async def device_binding(self, request: DeviceBindingRequest) -> dict:
        await self._verify_token_owned(request.provisioned_token_id)
        device_binding_response = self.vdp_client.device_binding(
            id=str(request.client_reference_id),
            provisioned_token_id=request.provisioned_token_id,
            exp_month=request.exp_month,
            exp_year=request.exp_year,
            session_context=request.session_context.model_dump(by_alias=True),
            browser_data=request.browser_data.model_dump(by_alias=True)
        )
        return device_binding_response

    async def create_challenge(self, request: CreateChallengeRequest) -> dict:
        await self._verify_token_owned(request.provisioned_token_id)
        create_challenge_response = self.vdp_client.create_challenge(
            id=str(request.client_reference_id),
            provisioned_token_id=request.provisioned_token_id,
            identifier=request.identifier
        )
        return create_challenge_response

    async def solve_challenge(self, request: SolveChallengeRequest) -> dict:
        await self._verify_token_owned(request.provisioned_token_id)
        solve_challenge_response = self.vdp_client.solve_challenge(
            id=str(request.client_reference_id),
            provisioned_token_id=request.provisioned_token_id,
            code=request.code
        )
        return solve_challenge_response

    async def attestation_options_register(self, request: AttestationOptionsRegisterRequest) -> dict:
        await self._verify_token_owned(request.provisioned_token_id)
        auth_context = self.vdp_client.attestation_options_register(
            id=str(request.client_reference_id),
            provisioned_token_id=request.provisioned_token_id,
            session_context=request.session_context.model_dump(by_alias=True),
            browser_data=request.browser_data.model_dump(by_alias=True)
        )
        return auth_context