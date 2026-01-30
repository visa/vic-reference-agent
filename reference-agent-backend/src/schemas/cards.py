# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import Annotated, Dict, Any
from uuid import UUID

from pydantic import Field
from src.schemas.base import BaseSchema

class AddCardRequest(BaseSchema):
    card_number: Annotated[str, Field(min_length=16, max_length=16)]
    exp_month: Annotated[int, Field(ge=1, le=12)]
    exp_year: int
    cvv: Annotated[str, Field(min_length=3, max_length=3, pattern=r'^\d{3}$')]
    name_on_card: Annotated[str, Field(min_length=3, max_length=100)]

class EncryptedAddCardRequest(BaseSchema):
    enc_payment_instrument: str
    
class AddCardResponse(BaseSchema):
    card_id: UUID

class ProvisionTokenRequest(BaseSchema):
    card_id: UUID

class CardResponse(BaseSchema):
    card_id: UUID
    exp_month: int
    exp_year: int
    last_4: str
    status: str
    token_id: str | None
