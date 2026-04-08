# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""
Encryption and decryption utilities for VDP client.

This module handles:
- Field-level encryption with shared secrets
- Message-level encryption (MLE) with certificates
- MLE decryption with private keys
"""

import hashlib
import json
import time
from authlib.jose import JsonWebEncryption, OctKey


def encrypt_with_secret(secret: str, kid: str, payload: dict) -> str:
    """
    Encrypt payload using shared secret for field-level encryption.

    Args:
        secret: Shared secret for encryption
        kid: Key identifier
        payload: Dictionary payload to encrypt

    Returns:
        Encrypted JWE string
    """
    key = OctKey.import_key(
        hashlib.sha256(secret.encode('utf-8')).digest(),
        options={"kid": kid, "alg": "A256GCMKW"}
    )
    protected_header = {
        "alg": "A256GCMKW",
        "enc": "A256GCM",
        "kid": kid
    }
    jwe_instance = JsonWebEncryption()
    return jwe_instance.serialize_compact(
        protected_header,
        json.dumps(payload).encode('utf-8'),
        key
    ).decode('utf-8')


def encrypt_with_cert(cert, kid: str, payload: dict) -> str:
    """
    Encrypt payload using certificate for message-level encryption (MLE).

    Args:
        cert: JsonWebKey certificate for encryption
        kid: Key identifier
        payload: Dictionary payload to encrypt

    Returns:
        Encrypted JWE string
    """
    protected_header = {
        "alg": "RSA-OAEP-256",
        "enc": "A256GCM",
        "kid": kid,
        "iat": int(round(time.time() * 1000))
    }
    jwe_instance = JsonWebEncryption()
    return jwe_instance.serialize_compact(
        protected_header,
        json.dumps(payload).encode('utf-8'),
        cert
    ).decode('utf-8')


def decrypt_with_key(key, encrypted_payload: str) -> dict:
    """
    Decrypt MLE encrypted payload using private key.

    Args:
        key: JsonWebKey for decryption
        encrypted_payload: Encrypted JWE string

    Returns:
        Decrypted dictionary payload
    """
    jwe_instance = JsonWebEncryption()
    result = jwe_instance.deserialize_compact(encrypted_payload, key)
    return json.loads(result["payload"].decode("utf-8"))
