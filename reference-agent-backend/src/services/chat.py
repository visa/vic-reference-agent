# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import asyncio
import logging
from typing import List
from langchain_core.messages import HumanMessage, SystemMessage
from src.repositories.card import CardRepository
from src.schemas.chat import ChatResponse, ProductInput
from src.schemas.commerce import AgenticCheckoutResponse, Credentials
from src.services.agent import (
    send_message,
    store_credentials,
    clear_credentials,
    _checkout_lock,
    _LOCK_ACQUIRE_TIMEOUT_SECONDS,
)

class ChatService:
    def __init__(self, card_repo: CardRepository):
        self.card_repo = card_repo

    async def process_message(self, message: str, session_id: str, products: List[ProductInput] | None = None) -> ChatResponse:
        try:
            formatted_message = f"""
            User Message: {message}
            Selected Products: {products}
            """
            # Hold _checkout_lock across send_message so an injection-triggered
            # checkout_cart on /chat can't run concurrently with a real checkout.
            # Only the acquire is bounded (a queued caller fails fast); the holder
            # runs untimed so a multi-step turn isn't cut off.
            try:
                await asyncio.wait_for(_checkout_lock.acquire(), timeout=_LOCK_ACQUIRE_TIMEOUT_SECONDS)
            except asyncio.TimeoutError:
                logging.error("Error processing message: %s", "LockAcquireTimeout")
                return ChatResponse(response_message="An error occurred while processing your message. Please try again later.")
            try:
                response_json = await send_message(HumanMessage(content=formatted_message), session_id)
            finally:
                _checkout_lock.release()
            order_summary = response_json.get("order_summary")
            if order_summary:
                active_cards = await self.card_repo.get_all_active()
                if not active_cards:
                    return ChatResponse(response_message="You have no active cards to complete the purchase. Please add a card and try again.")
            return ChatResponse(
                response_message=response_json["message"],
                products=response_json.get("products", []),
                order_summary=order_summary
            )
        except Exception as e:
            # Log only the exception type; a traceback can embed raw model output
            # containing card data.
            logging.error("Error processing message: %s", type(e).__name__)
            return ChatResponse(response_message="An error occurred while processing your message. Please try again later.")

    async def complete_checkout(self, credentials: Credentials, session_id: str) -> AgenticCheckoutResponse:
        # Serialize store -> ainvoke -> clear so concurrent checkouts can't leak
        # one caller's card data into another's elicitation; bounded acquire.
        try:
            await asyncio.wait_for(_checkout_lock.acquire(), timeout=_LOCK_ACQUIRE_TIMEOUT_SECONDS)
        except asyncio.TimeoutError:
            logging.error("Error completing checkout: %s", "LockAcquireTimeout")
            raise RuntimeError("An error occurred while completing the checkout. Please try again later.")
        token = None
        try:
            token = store_credentials(credentials)
            response_json = await send_message(SystemMessage(content="COMPLETE CHECKOUT"), session_id)
            checkout_response = AgenticCheckoutResponse(**response_json)
            return checkout_response
        except Exception as e:
            # Log only the exception type; a traceback can embed response bodies
            # or credentials.
            logging.error("Error completing checkout: %s", type(e).__name__)
            raise RuntimeError("An error occurred while completing the checkout. Please try again later.")
        finally:
            # Disarm the slot (token-scoped) before releasing the lock so the slot
            # is never readable by another path while unowned.
            clear_credentials(token)
            _checkout_lock.release()
