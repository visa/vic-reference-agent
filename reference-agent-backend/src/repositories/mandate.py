# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import Sequence
from uuid import UUID
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from src.enums import MandateStatus
from src.models.mandate import Mandate
from src.repositories.base import BaseRepository

class MandateRepository(BaseRepository[Mandate]):
    """Repository for Mandate model operations."""
    def __init__(self, session: AsyncSession):
        super().__init__(session, Mandate)

    async def add_all(self, mandates: Sequence[Mandate]) -> None:
        """Add multiple mandates to the database."""
        self.session.add_all(mandates)

    async def get_all_by_intent_id(self, intent_id: UUID) -> Sequence[Mandate]:
        """Retrieve all mandates associated with a specific intent ID."""
        return (await self.session.execute(
            select(Mandate).where(Mandate.intent_id == intent_id)
        )).scalars().all()
    
    async def get_all_active(self, intent_id: UUID, expiry_threshold: int | None = None) -> Sequence[Mandate]:
        """Retrieve all active mandates for a specific intent ID, optionally filtering by expiration threshold."""
        if expiry_threshold is not None:
            return (await self.session.execute(
                select(Mandate).where(
                    Mandate.intent_id == intent_id,
                    Mandate.status == MandateStatus.ACTIVE,
                    Mandate.effective_until_time > expiry_threshold
                )
            )).scalars().all()
        return (await self.session.execute(
            select(Mandate).where(
                Mandate.intent_id == intent_id,
                Mandate.status == MandateStatus.ACTIVE
            )
        )).scalars().all()
    
    async def set_all_deleted_by_intent_id(self, intent_id: UUID) -> None:
        """Set all mandates associated with a specific intent ID as deleted."""
        await self.session.execute(
            update(Mandate).where(Mandate.intent_id == intent_id).values(status=MandateStatus.DELETED)
        )