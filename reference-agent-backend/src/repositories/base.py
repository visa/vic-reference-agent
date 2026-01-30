# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from uuid import UUID
from sqlalchemy import delete, inspect, select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Sequence, Type, TypeVar, Generic

from src.models.base import Base

T = TypeVar('T', bound=Base)
class BaseRepository(Generic[T]):
    """Base repository class for common database operations."""
    
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def add(self, instance: T) -> T:
        """Add a new instance to the database."""
        self.session.add(instance)
        return instance
        
    async def get(self, instance_id: UUID) -> T | None:
        """Get an instance by its ID."""
        return await self.session.get(self.model, instance_id)
    
    async def get_all(self) -> Sequence[T]:
        """Get all instances of the model."""
        return (await self.session.execute(select(self.model))).scalars().all()
        
    async def update(self, instance: T) -> T:
        """Update an existing instance in the database."""
        await self.session.merge(instance)
        return instance
        
    async def delete(self, instance: T) -> None:
        """Delete an instance from the database."""
        await self.session.delete(instance)

    async def delete_by_id(self, instance_id: UUID) -> None:
        """Delete an instance by its ID."""
        primary_key = inspect(self.model).primary_key[0].name
        await self.session.execute(
            delete(self.model).where(getattr(self.model, primary_key) == instance_id)
        )

    async def flush(self) -> None:
        """Flush the current session."""
        await self.session.flush()

    async def commit(self) -> None:
        """Commit the current transaction."""
        await self.session.commit()

    async def rollback(self) -> None:
        """Rollback the current transaction."""
        await self.session.rollback()

    async def refresh(self, instance: T) -> None:
        """Refresh an instance from the database."""
        await self.session.refresh(instance)