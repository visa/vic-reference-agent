# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from datetime import datetime
from typing import Annotated, List, Optional, Sequence
from uuid import UUID, uuid4
from src.enums import IntentStatus, MandateStatus, TransactionStatus
from src.schemas.base import BaseSchema
from pydantic import Field, PrivateAttr, computed_field

# Utility Schemas
class FidoAssertionData(BaseSchema):
    code: str

class AssuranceData(BaseSchema):
    identifier: str
    fido_assertion_data: FidoAssertionData

# VIC Device Data
class VICDeviceData(BaseSchema):
    type: str
    brand: str
    manufacturer: Optional[str] = None
    model: Optional[str] = None

class SelectedProduct(BaseSchema):
    product_id: str
    quantity: int

class Credentials(BaseSchema):
    card_number: str
    exp_month: str
    exp_year: str
    cvv: str

# VIC Token Enrollment
class EnrollRequest(BaseSchema):
    provisioned_token_id: str
    client_device_id: Optional[str] = None
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    device_info: Optional[VICDeviceData] = None

# Intent Creation
class AgenticCheckoutRequest(BaseSchema):
    provisioned_token_id: str
    amount: float
    currency_code: str
    assurance_data: AssuranceData
    prompt: Optional[str] = None
    client_device_id: Optional[str] = None
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    device_info: Optional[VICDeviceData] = None

class TransactionAmount(BaseSchema):
    transaction_amount: str
    transaction_currency_code: str

class TransactionData(BaseSchema):
    transaction_amount: TransactionAmount
    merchant_name: str
    merchant_country_code: str
    merchant_url: str
    mandate_id: UUID

    _transaction_reference_id: UUID = PrivateAttr(default_factory=lambda: uuid4())
    @computed_field
    @property
    def transaction_reference_id(self) -> UUID:
        return self._transaction_reference_id

class PurchaseSummary(BaseSchema):
    merchant: str
    overall_amount: str
    order_id: str
    tracking_code: str

class AgenticCheckoutResponse(BaseSchema):
    message: str
    purchase_summary: PurchaseSummary | None = None