# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column
from src.enums import TransactionStatus
from src.models.base import Base


# START GENAI@GHCOPILOT
class Transaction(Base):
    __tablename__ = 'TRANSACTIONS'

    id: Mapped[UUID] = mapped_column(primary_key=True, insert_default=uuid4)
    mandate_id: Mapped[UUID] = mapped_column(ForeignKey('MANDATES.id', ondelete='CASCADE'))
    amount: Mapped[str] = mapped_column(String(20))
    currency_code: Mapped[str] = mapped_column(String(3))
    merchant_name: Mapped[str] = mapped_column(String(255))
    merchant_country_code: Mapped[str] = mapped_column(String(2))
    merchant_url: Mapped[str] = mapped_column(String(2048))
    status: Mapped[TransactionStatus] = mapped_column(SQLAlchemyEnum(TransactionStatus))

    def __init__(
        self,
        mandate_id: UUID,
        amount: str,
        currency_code: str,
        merchant_name: str,
        merchant_country_code: str,
        merchant_url: str,
        status: TransactionStatus = TransactionStatus.ACTIVE,
        id: UUID | None = None
    ):
        """Initialize the Transaction model with required fields."""
        super().__init__(id=id)
        self.mandate_id = mandate_id
        self.amount = amount
        self.currency_code = currency_code
        self.merchant_name = merchant_name
        self.merchant_country_code = merchant_country_code
        self.merchant_url = merchant_url
        self.status = status
        if id is not None:
            self.id = id
# END GENAI@GHCOPILOT