# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""
Authentication and signing utilities for VDP client.

This module handles:
- HMAC-based request signing
- X-Pay-Token generation
- Hash computation for authentication
"""

import base64
import hashlib
import hmac
from calendar import timegm
from datetime import datetime, timezone


def get_hash(secret: str, payload: str, base64_encoded: bool = False) -> str:
    """
    Generate HMAC-SHA256 hash for payload.

    Args:
        secret: Shared secret for HMAC
        payload: String payload to hash
        base64_encoded: If True, return base64url-encoded hash; otherwise hex digest

    Returns:
        Hashed string in requested format
    """
    hash_obj = hmac.new(
        bytes(secret, 'utf-8'),
        bytes(payload, 'utf-8'),
        digestmod=hashlib.sha256
    )
    if base64_encoded:
        return base64.urlsafe_b64encode(hash_obj.digest()).rstrip(b'=').decode('utf-8')
    return hash_obj.hexdigest()


def generate_x_pay_token(shared_secret: str, resource_path: str, query_string: str, body: str) -> str:
    """
    Generate X-Pay-Token for VDP API authentication.

    Args:
        shared_secret: Shared secret for signing
        resource_path: API resource path (without host)
        query_string: Query string including apikey
        body: JSON request body as string

    Returns:
        X-Pay-Token header value in format 'xv2:timestamp:hash'
    """
    timestamp = str(timegm(datetime.now(timezone.utc).timetuple()))
    pre_hash_string = timestamp + resource_path + query_string + body
    hash_string = get_hash(shared_secret, pre_hash_string)
    return 'xv2:' + timestamp + ':' + hash_string


def get_resource_path(url: str) -> str:
    """
    Extract resource path from URL for authentication signing.

    For VIC endpoints (/vacp/), strips the /vacp/ prefix.
    For other endpoints, returns the path with leading/trailing slashes removed.

    Args:
        url: Full URL path

    Returns:
        Resource path for authentication
    """
    if url.startswith("/vacp/"):
        return "/".join(url.strip("/").split("/")[1:])
    return url.strip("/")
