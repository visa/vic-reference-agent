# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging
from typing import Annotated, AsyncIterator
from uuid import UUID
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from src.database import Session
from src.repositories.intent import IntentRepository
from src.repositories.mandate import MandateRepository
from src.repositories.transaction import TransactionRepository
from src.repositories.card import CardRepository
from src.services.card import CardService
from src.services.chat import ChatService
from src.services.commerce import CommerceService
from src.services.passkey import PasskeyService
from src.services.vdp_client import VDPClient

# Database session dependency
async def get_db_session() -> AsyncIterator[AsyncSession]:
    """Get a new database session."""
    async with Session() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_db_session)]

# Repository dependencies
async def get_card_repository(session: SessionDep) -> CardRepository:
    """Dependency to get a CardRepository instance."""
    return CardRepository(session)

CardRepositoryDep = Annotated[CardRepository, Depends(get_card_repository)]

async def get_transaction_repository(session: SessionDep) -> TransactionRepository:
    """Dependency to get a TransactionRepository instance."""
    return TransactionRepository(session)

TransactionRepositoryDep = Annotated[TransactionRepository, Depends(get_transaction_repository)]

async def get_mandate_repository(session: SessionDep) -> MandateRepository:
    """Dependency to get a MandateRepository instance."""
    return MandateRepository(session)

MandateRepositoryDep = Annotated[MandateRepository, Depends(get_mandate_repository)]

async def get_intent_repository(session: SessionDep) -> IntentRepository:
    """Dependency to get an IntentRepository instance."""
    return IntentRepository(session)

IntentRepositoryDep = Annotated[IntentRepository, Depends(get_intent_repository)]

# Service dependencies
async def get_vdp_client(request: Request) -> VDPClient:
    """Dependency to get a VDPClient instance."""
    return VDPClient(request)

VDPClientDep = Annotated[VDPClient, Depends(get_vdp_client)]

async def get_card_service(vdp_client: VDPClientDep, card_repo: CardRepositoryDep, intent_repo: IntentRepositoryDep, mandate_repo: MandateRepositoryDep) -> CardService:
    """Dependency to get a CardService instance."""
    return CardService(vdp_client, card_repo, intent_repo, mandate_repo)

CardServiceDep = Annotated[CardService, Depends(get_card_service)]

async def get_chat_service(card_repo: CardRepositoryDep) -> ChatService:
    """Dependency to get a ChatService instance."""
    return ChatService(card_repo)

ChatServiceDep = Annotated[ChatService, Depends(get_chat_service)]

async def get_commerce_service(vdp_client: VDPClientDep, intent_repo: IntentRepositoryDep, mandate_repo: MandateRepositoryDep, transaction_repo: TransactionRepositoryDep, card_repo: CardRepositoryDep, chat_service: ChatServiceDep) -> CommerceService:
    """Dependency to get a CommerceService instance."""
    return CommerceService(vdp_client, intent_repo, mandate_repo, transaction_repo, card_repo, chat_service)

CommerceServiceDep = Annotated[CommerceService, Depends(get_commerce_service)]

async def get_passkey_service(vdp_client: VDPClientDep, card_repo: CardRepositoryDep) -> PasskeyService:
    """Dependency to get a PasskeyService instance."""
    return PasskeyService(vdp_client, card_repo)

PasskeyServiceDep = Annotated[PasskeyService, Depends(get_passkey_service)]