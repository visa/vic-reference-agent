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
from src.enums import MandateStatus
from src.models.base import Base

class Mandate(Base):
    __tablename__ = 'MANDATES'
    
    id: Mapped[UUID] = mapped_column(primary_key=True, insert_default=uuid4)
    intent_id: Mapped[UUID] = mapped_column(ForeignKey('INTENTS.id', ondelete='CASCADE'))
    amount: Mapped[str] = mapped_column(String(20))
    currency_code: Mapped[str] = mapped_column(String(3))
    effective_until_time: Mapped[int]
    description: Mapped[str] = mapped_column(String(255))
    status: Mapped[MandateStatus] = mapped_column(SQLAlchemyEnum(MandateStatus))

    def __init__(
        self,
        intent_id: UUID,
        amount: str,
        currency_code: str,
        effective_until_time: int,
        description: str,
        status: MandateStatus = MandateStatus.ACTIVE,
        id: UUID | None = None
    ):
        """Initialize the Mandate model with required fields."""
        super().__init__(id=id)
        self.intent_id = intent_id
        self.amount = amount
        self.currency_code = currency_code
        self.effective_until_time = effective_until_time
        self.description = description
        self.status = status
        if id is not None:
            self.id = id
