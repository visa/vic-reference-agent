# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import asyncio
import logging
from uuid import uuid4
from fastapi import APIRouter, Header, status
from src.dependencies import ChatServiceDep
from src.schemas.chat import ChatRequest, ChatResponse
from src.services.agent import reset_thread, _checkout_lock, _LOCK_ACQUIRE_TIMEOUT_SECONDS

router = APIRouter()

# Conversations are isolated per client-supplied session id. A missing header
# falls back to a fresh uuid so the caller stays isolated (no shared global
# thread) rather than sharing conversation state with other users.
def _session_id(x_session_id: str | None) -> str:
    return x_session_id or str(uuid4())

@router.post("")
async def chat(
    request: ChatRequest,
    chat_service: ChatServiceDep,
    x_session_id: str | None = Header(default=None),
) -> ChatResponse:
    return await chat_service.process_message(
        request.message, _session_id(x_session_id), request.products
    )

@router.post("/reset", status_code=status.HTTP_204_NO_CONTENT)
async def reset_chat(
    chat_service: ChatServiceDep,
    x_session_id: str | None = Header(default=None),
) -> None:
    # Hold _checkout_lock around reset so a concurrent /chat/reset can't disarm an
    # in-flight checkout mid-flight; bounded acquire so a hung checkout can't stall it.
    try:
        await asyncio.wait_for(_checkout_lock.acquire(), timeout=_LOCK_ACQUIRE_TIMEOUT_SECONDS)
    except asyncio.TimeoutError:
        logging.error("Error resetting chat: %s", "LockAcquireTimeout")
        return
    try:
        reset_thread(_session_id(x_session_id))
    finally:
        _checkout_lock.release()
