# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import TYPE_CHECKING, List
from uuid import UUID, uuid4
from sqlalchemy import ForeignKey, Index, String, UniqueConstraint, text
from src.models.base import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from src.models.intent import Intent

class Card(Base):
    __tablename__ = 'CARDS'
    
    id: Mapped[UUID] = mapped_column(primary_key=True, insert_default=uuid4)
    last_4: Mapped[str] = mapped_column(String(4))
    type: Mapped[str] = mapped_column(String(10))
    exp_month: Mapped[int]
    exp_year: Mapped[int]
    status: Mapped[str] = mapped_column(String(20))
    pan_enrollment_id: Mapped[str] = mapped_column(String(50), unique=True)
    token_id: Mapped[str | None] = mapped_column(String(50), unique=True)

    def __init__(
        self,
        last_4: str,
        type: str,
        exp_month: int,
        exp_year: int,
        status: str,
        pan_enrollment_id: str,
        token_id: str | None = None,
        id: UUID | None = None
    ):
        """Initialize the Card model with required fields."""
        self.last_4 = last_4
        self.type = type
        self.exp_month = exp_month
        self.exp_year = exp_year
        self.status = status
        self.pan_enrollment_id = pan_enrollment_id
        self.token_id = token_id
        if id is not None:
            self.id = id
