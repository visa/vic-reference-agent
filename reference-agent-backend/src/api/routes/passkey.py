# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from fastapi import APIRouter

from src.config import settings
from src.dependencies import PasskeyServiceDep
from src.schemas.passkey import AttestationOptionsAuthenticateRequest, AuthentationContext, DeviceBindingRequest, CreateChallengeRequest, PasskeyConfigResponse, SolveChallengeRequest, AttestationOptionsRegisterRequest

router = APIRouter()

@router.post("/attestation-options/authenticate")
async def attestation_options_authenticate(
    request: AttestationOptionsAuthenticateRequest,
    passkey_service: PasskeyServiceDep
) -> AuthentationContext:
    auth_context = await passkey_service.attestation_options_authenticate(request)
    return AuthentationContext(authentication_context=auth_context)

@router.post("/device-binding")
async def device_binding(
    request: DeviceBindingRequest,
    passkey_service: PasskeyServiceDep
) -> dict:
    return await passkey_service.device_binding(request)

@router.post("/create-challenge")
async def create_challenge(
    request: CreateChallengeRequest,
    passkey_service: PasskeyServiceDep
) -> dict:
    return await passkey_service.create_challenge(request)

@router.post("/solve-challenge")
async def solve_challenge(
    request: SolveChallengeRequest,
    passkey_service: PasskeyServiceDep
) -> dict:
    return await passkey_service.solve_challenge(request)

@router.post("/attestation-options/register")
async def attestation_options_register(
    request: AttestationOptionsRegisterRequest,
    passkey_service: PasskeyServiceDep
) -> AuthentationContext:
    auth_context = await passkey_service.attestation_options_register(request)
    return AuthentationContext(authentication_context=auth_context)
