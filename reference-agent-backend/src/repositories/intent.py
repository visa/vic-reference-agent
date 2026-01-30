# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import Sequence
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.repositories.base import BaseRepository
from src.models.intent import Intent
class IntentRepository(BaseRepository[Intent]):
    """Repository for Intent model operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Intent)
    
    async def get_all_by_card_id(self, card_id: UUID) -> Sequence[Intent]:
        """Get all intents associated with a specific card ID."""
        return (await self.session.execute(
            select(Intent).where(Intent.card_id == card_id)
        )).scalars().all()
    
    async def get_by_instruction_id(self, instruction_id: str) -> Intent | None:
        """Get an intent by its transaction ID."""
        result = await self.session.execute(
            select(Intent).where(Intent.instruction_id == instruction_id)
        )
        return result.scalar_one_or_none()