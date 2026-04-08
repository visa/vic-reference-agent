# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import logging
from typing import List
from langchain_core.messages import HumanMessage, SystemMessage
from src.repositories.card import CardRepository
from src.schemas.chat import ChatResponse, ProductInput
from src.schemas.commerce import AgenticCheckoutResponse, Credentials
from src.services.agent import (
    send_message,
    store_credentials,
    clear_credentials
)

class ChatService:
    def __init__(self, card_repo: CardRepository):
        self.card_repo = card_repo

    async def process_message(self, message: str, products: List[ProductInput] | None = None) -> ChatResponse:
        try:
            formatted_message = f"""
            User Message: {message}
            Selected Products: {products}
            """
            response_json = await send_message(HumanMessage(content=formatted_message))
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
            logging.error("Error processing message", exc_info=True)
            return ChatResponse(response_message="An error occurred while processing your message. Please try again later.")

    async def complete_checkout(self, credentials: Credentials) -> AgenticCheckoutResponse:
        try:
            store_credentials(credentials)
            response_json = await send_message(SystemMessage(content="COMPLETE CHECKOUT"))
            checkout_response = AgenticCheckoutResponse(**response_json)
            return checkout_response
        except Exception as e:
            logging.error("Error completing checkout", exc_info=True)
            raise RuntimeError("An error occurred while completing the checkout. Please try again later.")
        finally:
            clear_credentials()
