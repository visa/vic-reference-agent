# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""API-key authentication for the reference agent backend.

Every route requires a shared-secret API key in the `X-Api-Key` header, compared
in constant time. Deny-by-default: if `AGENT_API_KEY` is not configured, requests
are rejected rather than served.
"""

import secrets

from fastapi import Header, HTTPException, status

from src.config import settings


def require_api_key(x_api_key: str | None = Header(default=None)) -> None:
    """FastAPI dependency enforcing a valid `X-Api-Key` header.

    Raises:
        HTTPException 500: if the server is misconfigured (no key set).
        HTTPException 401: if the header is missing or does not match.
    """
    expected = settings.agent_api_key
    if not expected:
        # Deny-by-default: never serve protected operations without a key.
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server misconfiguration: AGENT_API_KEY is not set.",
        )

    # Compare as bytes; compare_digest raises on non-ASCII str (a 500, not a 401).
    if not x_api_key or not secrets.compare_digest(x_api_key.encode("utf-8"), expected.encode("utf-8")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
            headers={"WWW-Authenticate": "ApiKey"},
        )
