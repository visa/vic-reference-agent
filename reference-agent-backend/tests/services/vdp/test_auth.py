# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""Tests for VDP authentication module."""

import re
import pytest
from src.services.vdp import auth


class TestGetHash:
    """Tests for get_hash function."""

    def test_get_hash_hex_format(self):
        """Test hash in hexadecimal format."""
        result = auth.get_hash("secret", "payload", base64_encoded=False)
        assert isinstance(result, str)
        assert len(result) == 64  # SHA256 hex is 64 characters
        assert all(c in '0123456789abcdef' for c in result)

    def test_get_hash_base64_format(self):
        """Test hash in base64url format."""
        result = auth.get_hash("secret", "payload", base64_encoded=True)
        assert isinstance(result, str)
        assert len(result) > 0
        # Base64url should not contain padding
        assert '=' not in result

    def test_get_hash_consistency(self):
        """Test that same inputs produce same hash."""
        hash1 = auth.get_hash("secret", "payload", base64_encoded=False)
        hash2 = auth.get_hash("secret", "payload", base64_encoded=False)
        assert hash1 == hash2

    def test_get_hash_different_secrets_produce_different_hashes(self):
        """Test that different secrets produce different hashes."""
        hash1 = auth.get_hash("secret1", "payload", base64_encoded=False)
        hash2 = auth.get_hash("secret2", "payload", base64_encoded=False)
        assert hash1 != hash2

    def test_get_hash_different_payloads_produce_different_hashes(self):
        """Test that different payloads produce different hashes."""
        hash1 = auth.get_hash("secret", "payload1", base64_encoded=False)
        hash2 = auth.get_hash("secret", "payload2", base64_encoded=False)
        assert hash1 != hash2

    def test_get_hash_empty_payload(self):
        """Test hash with empty payload."""
        result = auth.get_hash("secret", "", base64_encoded=False)
        assert isinstance(result, str)
        assert len(result) == 64

    def test_get_hash_special_characters(self):
        """Test hash with special characters in payload."""
        payload = "test@#$%^&*(){}[]|\\:;<>?,./~`"
        result = auth.get_hash("secret", payload, base64_encoded=False)
        assert isinstance(result, str)
        assert len(result) == 64


class TestGenerateXPayToken:
    """Tests for generate_x_pay_token function."""

    def test_generate_x_pay_token_format(self):
        """Test that token follows xv2:timestamp:hash format."""
        token = auth.generate_x_pay_token(
            "shared_secret",
            "vts/panEnrollments",
            "apikey=test123",
            '{"test": "body"}'
        )
        assert isinstance(token, str)
        parts = token.split(':')
        assert len(parts) == 3
        assert parts[0] == 'xv2'
        assert parts[1].isdigit()  # timestamp
        assert len(parts[2]) == 64  # hex hash

    def test_generate_x_pay_token_timestamp_is_numeric(self):
        """Test that timestamp part is numeric."""
        token = auth.generate_x_pay_token("secret", "path", "query", "body")
        parts = token.split(':')
        timestamp = parts[1]
        assert timestamp.isdigit()
        assert int(timestamp) > 0

    def test_generate_x_pay_token_consistency(self):
        """Test that same inputs at same time produce consistent token (except timestamp)."""
        token1 = auth.generate_x_pay_token("secret", "path", "query", "body")
        token2 = auth.generate_x_pay_token("secret", "path", "query", "body")

        # Timestamps might differ by a second, but structure should be same
        parts1 = token1.split(':')
        parts2 = token2.split(':')
        assert parts1[0] == parts2[0]  # Both should be 'xv2'

    def test_generate_x_pay_token_different_secrets(self):
        """Test that different secrets produce different tokens."""
        token1 = auth.generate_x_pay_token("secret1", "path", "query", "body")
        token2 = auth.generate_x_pay_token("secret2", "path", "query", "body")

        # Extract hashes (3rd part)
        hash1 = token1.split(':')[2]
        hash2 = token2.split(':')[2]
        assert hash1 != hash2

    def test_generate_x_pay_token_different_paths(self):
        """Test that different paths produce different tokens."""
        token1 = auth.generate_x_pay_token("secret", "path1", "query", "body")
        token2 = auth.generate_x_pay_token("secret", "path2", "query", "body")

        hash1 = token1.split(':')[2]
        hash2 = token2.split(':')[2]
        assert hash1 != hash2

    def test_generate_x_pay_token_empty_body(self):
        """Test token generation with empty body."""
        token = auth.generate_x_pay_token("secret", "path", "query", "")
        assert isinstance(token, str)
        assert token.startswith('xv2:')

    def test_generate_x_pay_token_complex_body(self):
        """Test token generation with complex JSON body."""
        body = '{"nested": {"key": "value"}, "array": [1, 2, 3]}'
        token = auth.generate_x_pay_token("secret", "path", "query", body)
        assert isinstance(token, str)
        parts = token.split(':')
        assert len(parts) == 3


class TestGetResourcePath:
    """Tests for get_resource_path function."""

    def test_get_resource_path_strips_leading_trailing_slashes(self):
        """Test that leading and trailing slashes are removed."""
        assert auth.get_resource_path("/test/path/") == "test/path"
        assert auth.get_resource_path("/test/") == "test"
        assert auth.get_resource_path("/test") == "test"
        assert auth.get_resource_path("test/") == "test"

    def test_get_resource_path_handles_vacp_prefix(self):
        """Test that /vacp/ prefix is stripped correctly."""
        assert auth.get_resource_path("/vacp/v1/cards") == "v1/cards"
        assert auth.get_resource_path("/vacp/v1/instructions") == "v1/instructions"
        assert auth.get_resource_path("/vacp/test/path/") == "test/path"

    def test_get_resource_path_preserves_non_vacp_paths(self):
        """Test that non-VACP paths are handled correctly."""
        assert auth.get_resource_path("/vts/panEnrollments") == "vts/panEnrollments"
        assert auth.get_resource_path("/vts/provisionedTokens") == "vts/provisionedTokens"

    def test_get_resource_path_handles_single_segment(self):
        """Test single segment paths."""
        assert auth.get_resource_path("/test/") == "test"
        assert auth.get_resource_path("test") == "test"

    def test_get_resource_path_handles_multiple_segments(self):
        """Test multi-segment paths."""
        assert auth.get_resource_path("/a/b/c/d/e") == "a/b/c/d/e"

    def test_get_resource_path_handles_empty_after_vacp(self):
        """Test edge case with just /vacp/."""
        result = auth.get_resource_path("/vacp/")
        # After stripping and splitting, should be empty or minimal
        assert isinstance(result, str)


class TestAuthIntegration:
    """Integration tests for auth module."""

    def test_full_authentication_flow(self):
        """Test complete authentication flow."""
        shared_secret = "test_shared_secret"
        resource_path = auth.get_resource_path("/vts/panEnrollments")
        query_string = "apikey=test_api_key"
        body = '{"locale": "en_US", "clientAppID": "test_app"}'

        # Generate token
        token = auth.generate_x_pay_token(shared_secret, resource_path, query_string, body)

        # Verify token format
        assert token.startswith('xv2:')
        parts = token.split(':')
        assert len(parts) == 3
        assert parts[1].isdigit()
        assert len(parts[2]) == 64

    def test_hash_methods_are_consistent(self):
        """Test that hash method used in token generation is consistent."""
        secret = "test_secret"
        payload = "test_payload"

        # Get hash directly
        direct_hash = auth.get_hash(secret, payload, base64_encoded=False)

        # The same hash should be reproducible
        second_hash = auth.get_hash(secret, payload, base64_encoded=False)

        assert direct_hash == second_hash
