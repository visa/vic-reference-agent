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
from src.models.card_art import CardArt
from src.models.card_art_map import CardArtMap
from src.repositories.base import BaseRepository
from src.models.card import Card
class CardRepository(BaseRepository[Card]):
    """Repository for Card model operations."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, Card)
    
    async def get_by_token_id(self, token_id: str) -> Card | None:
        """Get a card by its token ID."""
        return (await self.session.execute(
            select(Card).where(
                Card.token_id == token_id
            )
        )).scalar_one_or_none()

    async def get_by_pan_enrollment_id(self, pan_enrollment_id: str) -> Card | None:
        """Get a card by its PAN enrollment ID."""
        return (await self.session.execute(
            select(Card).where(Card.pan_enrollment_id == pan_enrollment_id)
        )).scalar_one_or_none()
    
    async def get_all_active(self) -> Sequence[Card]:
        """Get all active cards."""
        result = await self.session.execute(
            select(Card).where(Card.status == "ACTIVE")
        )
        return result.scalars().all()

    async def get_card_art_map(self, pan_enrollment_id: str) -> CardArtMap | None:
        """Get the card art map entry for a specific PAN enrollment ID."""
        return (await self.session.execute(
            select(CardArtMap).where(CardArtMap.pan_enrollment_id == pan_enrollment_id)
        )).scalar_one_or_none()
    
    async def get_card_art(self, card_art_id: str) -> CardArt | None:
        """Get card art by its ID."""
        return (await self.session.execute(
            select(CardArt).where(CardArt.id == card_art_id)
        )).scalar_one_or_none()
    
    async def add_card_art_map(self, card_art_map: CardArtMap) -> CardArtMap:
        """Add a new card art map entry."""
        self.session.add(card_art_map)
        return card_art_map
    
    async def update_card_art_map(self, card_art_map: CardArtMap) -> CardArtMap:
        """Update an existing card art map entry."""
        await self.session.merge(card_art_map)
        return card_art_map
    
    async def delete_card_art_map(self, pan_enrollment_id: str) -> None:
        """Delete the card art map entry for a specific PAN enrollment ID."""
        card_art_map = await self.get_card_art_map(pan_enrollment_id)
        if card_art_map:
            await self.session.delete(card_art_map)
    
    async def add_card_art(self, card_art: CardArt) -> CardArt:
        """Add new card art to the repository."""
        self.session.add(card_art)
        return card_art
