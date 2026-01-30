# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from fastapi import APIRouter
from src.dependencies import CardServiceDep, CommerceServiceDep
from src.schemas.cards import CardResponse, ProvisionTokenRequest
from src.schemas.commerce import EnrollRequest
from src.utils.encoder import base64url_encode

router = APIRouter()

@router.post("")
async def provision_token(
    provision_request: ProvisionTokenRequest,
    card_service: CardServiceDep
) -> CardResponse:
    """Provisions a token for the given card ID."""
    return await card_service.provision_token(provision_request)

@router.post("/enroll")
async def enroll_token(
    enroll_request: EnrollRequest,
    commerce_service: CommerceServiceDep
) -> None:
    """Enrolls a token in VIC."""
    if enroll_request.user_agent:
        enroll_request.user_agent = base64url_encode(enroll_request.user_agent)
    await commerce_service.enroll_token(enroll_request)