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
from src.models.transaction import Transaction
from src.repositories.base import BaseRepository


class TransactionRepository(BaseRepository[Transaction]):
    """Repository for Transaction model operations."""
    def __init__(self, session: AsyncSession):
        super().__init__(session, Transaction)

    async def add_all(self, transactions: Sequence[Transaction]) -> None:
        """Add multiple transactions to the database."""
        self.session.add_all(transactions)

    async def get_all_by_mandate_id(self, mandate_id: UUID) -> Sequence[Transaction]:
        """Retrieve all transactions associated with a specific mandate ID."""
        return (await self.session.execute(
            select(Transaction).where(Transaction.mandate_id == mandate_id)
        )).scalars().all()