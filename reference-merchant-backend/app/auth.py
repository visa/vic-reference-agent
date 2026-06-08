# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""API-key authentication for the reference merchant backend.

The merchant API exposes order/customer data and order-state mutations. All
routes require a shared-secret API key supplied in the `X-Api-Key` header and
compared in constant time. Access is deny-by-default: if the server has no
`MERCHANT_API_KEY` configured, every request is rejected (HTTP 500) rather than
silently allowed.

See web-application-dsr 4.3/4.8 (REST APIs must use a secure authentication
mechanism) and customer-identity-access-dsr 4.4 (default deny-all).
"""

import os
import secrets

from fastapi import Header, HTTPException, status


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """FastAPI dependency enforcing a valid `X-Api-Key` header.

    Raises:
        HTTPException 500: if the server is misconfigured (no key set).
        HTTPException 401: if the header is missing or does not match.
    """
    expected = os.environ.get("MERCHANT_API_KEY")
    if not expected:
        # Deny-by-default: never serve protected data without a configured key.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration: MERCHANT_API_KEY is not set.",
        )

    if not x_api_key or not secrets.compare_digest(x_api_key, expected):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
