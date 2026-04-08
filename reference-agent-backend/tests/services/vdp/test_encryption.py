# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""Tests for VDP encryption module."""

import json
import pytest
from authlib.jose import JsonWebKey
from src.services.vdp import encryption


class TestEncryptWithSecret:
    """Tests for encrypt_with_secret function."""

    def test_encrypt_with_secret_returns_string(self):
        """Test that encryption returns a string."""
        result = encryption.encrypt_with_secret("test_secret", "test_kid", {"key": "value"})
        assert isinstance(result, str)
        assert len(result) > 0

    def test_encrypt_with_secret_produces_jwe_format(self):
        """Test that encryption produces JWE format (5 parts separated by dots)."""
        result = encryption.encrypt_with_secret("test_secret", "test_kid", {"key": "value"})
        parts = result.split('.')
        assert len(parts) == 5  # JWE compact format has 5 parts

    def test_encrypt_with_secret_handles_empty_payload(self):
        """Test encryption with empty payload."""
        result = encryption.encrypt_with_secret("test_secret", "test_kid", {})
        assert isinstance(result, str)
        assert len(result) > 0

    def test_encrypt_with_secret_handles_complex_payload(self):
        """Test encryption with complex nested payload."""
        payload = {
            "accountNumber": "4111111111111111",
            "expirationDate": {"month": 12, "year": 2025},
            "nested": {"deep": {"value": "test"}}
        }
        result = encryption.encrypt_with_secret("test_secret", "test_kid", payload)
        assert isinstance(result, str)

    def test_encrypt_with_secret_different_secrets_produce_different_results(self):
        """Test that different secrets produce different encrypted results."""
        payload = {"key": "value"}
        result1 = encryption.encrypt_with_secret("secret1", "kid1", payload)
        result2 = encryption.encrypt_with_secret("secret2", "kid2", payload)
        assert result1 != result2


class TestEncryptWithCert:
    """Tests for encrypt_with_cert function."""

    def test_encrypt_with_cert_returns_string(self):
        """Test that encryption returns a string."""
        # Generate a test RSA key pair
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        payload = {"key": "value"}
        result = encryption.encrypt_with_cert(key, "test_kid", payload)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_encrypt_with_cert_produces_jwe_format(self):
        """Test that encryption produces JWE format."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        result = encryption.encrypt_with_cert(key, "test_kid", {"key": "value"})
        parts = result.split('.')
        assert len(parts) == 5

    def test_encrypt_with_cert_handles_complex_payload(self):
        """Test encryption with complex payload."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        payload = {
            "tokenId": "token123",
            "consumerId": "user456",
            "nested": {"array": [1, 2, 3]}
        }
        result = encryption.encrypt_with_cert(key, "test_kid", payload)
        assert isinstance(result, str)


class TestDecryptWithKey:
    """Tests for decrypt_with_key function."""

    def test_decrypt_with_key_recovers_original_payload(self):
        """Test that decryption recovers the original payload."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        original_payload = {"key": "value", "number": 42}

        # Encrypt with the public key
        encrypted = encryption.encrypt_with_cert(key, "test_kid", original_payload)

        # Decrypt with the private key
        decrypted = encryption.decrypt_with_key(key, encrypted)

        assert decrypted == original_payload

    def test_decrypt_with_key_handles_complex_payload(self):
        """Test decryption of complex nested structures."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        original_payload = {
            "accountNumber": "4111111111111111",
            "expirationDate": {"month": 12, "year": 2025},
            "cvv": "123",
            "nested": {"deep": {"value": "test"}, "array": [1, 2, 3]}
        }

        encrypted = encryption.encrypt_with_cert(key, "test_kid", original_payload)
        decrypted = encryption.decrypt_with_key(key, encrypted)

        assert decrypted == original_payload

    def test_decrypt_with_key_handles_empty_dict(self):
        """Test decryption of empty dictionary."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        original_payload = {}

        encrypted = encryption.encrypt_with_cert(key, "test_kid", original_payload)
        decrypted = encryption.decrypt_with_key(key, encrypted)

        assert decrypted == original_payload


class TestEncryptionRoundTrip:
    """Integration tests for encryption/decryption round trips."""

    def test_secret_based_encryption_round_trip(self):
        """Test that secret-based encryption can be decrypted with the same secret."""
        from authlib.jose import JsonWebEncryption, OctKey
        import hashlib

        secret = "test_secret"
        kid = "test_kid"
        payload = {"data": "sensitive"}

        # Encrypt
        encrypted = encryption.encrypt_with_secret(secret, kid, payload)

        # Decrypt using the same secret
        key = OctKey.import_key(
            hashlib.sha256(secret.encode('utf-8')).digest(),
            options={"kid": kid, "alg": "A256GCMKW"}
        )
        jwe = JsonWebEncryption()
        result = jwe.deserialize_compact(encrypted, key)
        decrypted = json.loads(result["payload"].decode("utf-8"))

        assert decrypted == payload

    def test_cert_based_encryption_preserves_data_types(self):
        """Test that encryption preserves various data types."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        payload = {
            "string": "text",
            "integer": 123,
            "float": 45.67,
            "boolean": True,
            "null": None,
            "array": [1, 2, 3],
            "object": {"nested": "value"}
        }

        encrypted = encryption.encrypt_with_cert(key, "test_kid", payload)
        decrypted = encryption.decrypt_with_key(key, encrypted)

        assert decrypted == payload
        assert isinstance(decrypted["string"], str)
        assert isinstance(decrypted["integer"], int)
        assert isinstance(decrypted["boolean"], bool)
        assert isinstance(decrypted["array"], list)
        assert isinstance(decrypted["object"], dict)
