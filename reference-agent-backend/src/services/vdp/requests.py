# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""
HTTP request handling utilities for VDP client.

This module handles:
- HTTP request construction and execution
- Response parsing and decryption
- Request/response logging
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from uuid import uuid4

import requests

from src.utils.constants import REQUEST_TIMEOUT_SECONDS
from .auth import generate_x_pay_token, get_resource_path
from .encryption import decrypt_with_key


def prepare_request_body(body: Optional[dict], message_encrypted: bool, encrypt_func, mle_enc_cert, mle_key_id) -> str:
    """
    Prepare request body, encrypting if needed.

    Args:
        body: Dictionary request body (None for GET requests)
        message_encrypted: Whether to encrypt the entire message
        encrypt_func: Encryption function (encrypt_with_cert)
        mle_enc_cert: Certificate for MLE encryption
        mle_key_id: Key ID for encryption

    Returns:
        Serialized JSON string (encrypted or plain)
    """
    if body is None:
        return ""

    if message_encrypted:
        encrypted_body = {
            "encData": encrypt_func(mle_enc_cert, mle_key_id, body)
        }
        return json.dumps(encrypted_body)

    return json.dumps(body)


def build_headers(shared_secret: str, resource_path: str, query_string: str, body: str,
                  message_encrypted: bool, mle_key_id: Optional[str]) -> Dict[str, str]:
    """
    Build HTTP headers including authentication token.

    Args:
        shared_secret: Shared secret for signing
        resource_path: API resource path
        query_string: Query string with apikey
        body: Serialized request body
        message_encrypted: Whether message is encrypted
        mle_key_id: Key ID for encrypted messages

    Returns:
        Dictionary of HTTP headers
    """
    x_pay_token = generate_x_pay_token(shared_secret, resource_path, query_string, body)
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-pay-token': x_pay_token,
        'x-request-id': str(uuid4())
    }

    if message_encrypted and mle_key_id:
        headers['keyId'] = mle_key_id

    return headers


def execute_request(method: str, full_url: str, headers: Dict[str, str], body: str) -> requests.Response:
    """
    Execute HTTP request with timeout and error handling.

    Args:
        method: HTTP method (GET, POST, PUT, etc.)
        full_url: Complete URL with query string
        headers: HTTP headers
        body: Serialized request body

    Returns:
        Response object

    Raises:
        requests.RequestException: On request failure
    """
    session = requests.Session()
    request = requests.Request(method=method, url=full_url, headers=headers, data=body).prepare()
    return session.send(request, timeout=REQUEST_TIMEOUT_SECONDS)


def parse_response(response: requests.Response, message_encrypted: bool, mle_dec_key) -> Optional[dict]:
    """
    Parse and optionally decrypt response body.

    Args:
        response: HTTP response object
        message_encrypted: Whether response is encrypted
        mle_dec_key: Key for MLE decryption

    Returns:
        Parsed JSON response dictionary, or None if empty
    """
    if not response.text:
        return None

    response_json = response.json()

    if message_encrypted and response_json.get('encData'):
        return decrypt_with_key(mle_dec_key, response_json.get('encData'))

    return response_json


def create_request_response_log(method: str, path: str, request_body: Optional[dict],
                                 status_code: int, response_body: Optional[dict],
                                 correlation_id: str) -> Dict[str, Any]:
    """
    Create structured log entry for request/response pair.

    Args:
        method: HTTP method
        path: API path
        request_body: Original (unencrypted) request body
        status_code: HTTP status code
        response_body: Parsed (decrypted) response body
        correlation_id: X-CORRELATION-ID from response headers

    Returns:
        Structured log dictionary
    """
    return {
        "request": {
            "method": method,
            "path": path,
            "body": request_body
        },
        "response": {
            "statusCode": status_code,
            "body": response_body,
            "correlationId": correlation_id
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
