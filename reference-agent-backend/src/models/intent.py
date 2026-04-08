# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from datetime import datetime
from sqlalchemy import Enum as SQLAlchemyEnum, func
from typing import TYPE_CHECKING
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.enums import IntentStatus
from src.models.base import Base

if TYPE_CHECKING:
    from src.models.card import Card

class Intent(Base):
    __tablename__ = 'INTENTS'
    
    id: Mapped[UUID] = mapped_column(primary_key=True, insert_default=uuid4)
    instruction_id: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    card_id: Mapped[UUID | None] = mapped_column(ForeignKey('CARDS.id', ondelete='SET NULL'))
    last_4: Mapped[str] = mapped_column(String(4))
    status: Mapped[IntentStatus] = mapped_column(SQLAlchemyEnum(IntentStatus))
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())

    def __init__(
        self,
        instruction_id: str,
        card_id: UUID,
        last_4: str,
        status: IntentStatus = IntentStatus.ACTIVE,
        id: UUID | None = None
    ):
        """Initialize the Intent model with required fields."""
        super().__init__(id=id)
        self.instruction_id = instruction_id
        self.card_id = card_id
        self.last_4 = last_4
        self.status = status
        if id is not None:
            self.id = id
