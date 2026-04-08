# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""Tests for VDP requests module."""

import json
import pytest
from unittest.mock import Mock, patch
from authlib.jose import JsonWebKey
from src.services.vdp import requests as vdp_requests
from src.services.vdp import encryption


class TestPrepareRequestBody:
    """Tests for prepare_request_body function."""

    def test_prepare_request_body_none_returns_empty_string(self):
        """Test that None body returns empty string."""
        result = vdp_requests.prepare_request_body(None, False, None, None, None)
        assert result == ""

    def test_prepare_request_body_plain_json(self):
        """Test plain JSON serialization."""
        body = {"key": "value", "number": 42}
        result = vdp_requests.prepare_request_body(body, False, None, None, None)
        assert result == json.dumps(body)
        assert isinstance(result, str)

    def test_prepare_request_body_encrypted(self):
        """Test encrypted body preparation."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        body = {"key": "value"}

        result = vdp_requests.prepare_request_body(
            body,
            True,
            encryption.encrypt_with_cert,
            key,
            "test_kid"
        )

        # Should be JSON with encData key
        parsed = json.loads(result)
        assert "encData" in parsed
        assert isinstance(parsed["encData"], str)

    def test_prepare_request_body_complex_object(self):
        """Test serialization of complex objects."""
        body = {
            "nested": {"key": "value"},
            "array": [1, 2, 3],
            "boolean": True,
            "null": None
        }
        result = vdp_requests.prepare_request_body(body, False, None, None, None)
        parsed = json.loads(result)
        assert parsed == body


class TestBuildHeaders:
    """Tests for build_headers function."""

    def test_build_headers_required_fields(self):
        """Test that all required headers are present."""
        headers = vdp_requests.build_headers(
            "shared_secret",
            "resource/path",
            "apikey=test",
            '{"body": "test"}',
            False,
            None
        )

        assert "Content-Type" in headers
        assert headers["Content-Type"] == "application/json"
        assert "Accept" in headers
        assert headers["Accept"] == "application/json"
        assert "x-pay-token" in headers
        assert "x-request-id" in headers

    def test_build_headers_x_pay_token_format(self):
        """Test x-pay-token format."""
        headers = vdp_requests.build_headers(
            "secret", "path", "query", "body", False, None
        )

        token = headers["x-pay-token"]
        assert token.startswith("xv2:")
        parts = token.split(":")
        assert len(parts) == 3

    def test_build_headers_x_request_id_is_uuid(self):
        """Test that x-request-id looks like a UUID."""
        headers = vdp_requests.build_headers(
            "secret", "path", "query", "body", False, None
        )

        request_id = headers["x-request-id"]
        # UUID format: 8-4-4-4-12 hex digits
        assert len(request_id) == 36
        assert request_id.count("-") == 4

    def test_build_headers_includes_key_id_when_encrypted(self):
        """Test that keyId header is included for encrypted messages."""
        headers = vdp_requests.build_headers(
            "secret", "path", "query", "body", True, "test_key_id"
        )

        assert "keyId" in headers
        assert headers["keyId"] == "test_key_id"

    def test_build_headers_no_key_id_when_not_encrypted(self):
        """Test that keyId header is not included for plain messages."""
        headers = vdp_requests.build_headers(
            "secret", "path", "query", "body", False, "test_key_id"
        )

        assert "keyId" not in headers

    def test_build_headers_no_key_id_when_none(self):
        """Test that keyId header is not included when mle_key_id is None."""
        headers = vdp_requests.build_headers(
            "secret", "path", "query", "body", True, None
        )

        assert "keyId" not in headers


class TestParseResponse:
    """Tests for parse_response function."""

    def test_parse_response_empty_text_returns_none(self):
        """Test that empty response text returns None."""
        mock_response = Mock()
        mock_response.text = ""

        result = vdp_requests.parse_response(mock_response, False, None)
        assert result is None

    def test_parse_response_plain_json(self):
        """Test parsing plain JSON response."""
        mock_response = Mock()
        mock_response.text = '{"key": "value", "number": 42}'
        mock_response.json.return_value = {"key": "value", "number": 42}

        result = vdp_requests.parse_response(mock_response, False, None)
        assert result == {"key": "value", "number": 42}

    def test_parse_response_encrypted_without_encdata(self):
        """Test encrypted flag but no encData in response."""
        mock_response = Mock()
        mock_response.text = '{"key": "value"}'
        mock_response.json.return_value = {"key": "value"}

        result = vdp_requests.parse_response(mock_response, True, None)
        # Should return the response as-is since no encData field
        assert result == {"key": "value"}

    def test_parse_response_encrypted_with_encdata(self):
        """Test decryption of encrypted response."""
        # Create a key and encrypt some data
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        original_data = {"secret": "data"}
        encrypted = encryption.encrypt_with_cert(key, "kid", original_data)

        mock_response = Mock()
        mock_response.text = '{"encData": "' + encrypted + '"}'
        mock_response.json.return_value = {"encData": encrypted}

        result = vdp_requests.parse_response(mock_response, True, key)
        assert result == original_data


class TestCreateRequestResponseLog:
    """Tests for create_request_response_log function."""

    def test_create_request_response_log_structure(self):
        """Test that log has correct structure."""
        log = vdp_requests.create_request_response_log(
            "POST",
            "/vts/panEnrollments",
            {"test": "body"},
            200,
            {"response": "data"},
            "correlation-123"
        )

        assert "request" in log
        assert "response" in log
        assert "timestamp" in log

    def test_create_request_response_log_request_fields(self):
        """Test request section has correct fields."""
        log = vdp_requests.create_request_response_log(
            "POST", "/test", {"body": "test"}, 200, {}, "corr-123"
        )

        assert log["request"]["method"] == "POST"
        assert log["request"]["path"] == "/test"
        assert log["request"]["body"] == {"body": "test"}

    def test_create_request_response_log_response_fields(self):
        """Test response section has correct fields."""
        log = vdp_requests.create_request_response_log(
            "GET", "/test", None, 201, {"result": "success"}, "corr-456"
        )

        assert log["response"]["statusCode"] == 201
        assert log["response"]["body"] == {"result": "success"}
        assert log["response"]["correlationId"] == "corr-456"

    def test_create_request_response_log_timestamp_format(self):
        """Test that timestamp is in ISO format."""
        log = vdp_requests.create_request_response_log(
            "GET", "/test", None, 200, {}, "corr"
        )

        timestamp = log["timestamp"]
        assert isinstance(timestamp, str)
        # Should contain date and time with timezone
        assert "T" in timestamp
        assert ":" in timestamp

    def test_create_request_response_log_none_body(self):
        """Test handling of None request body."""
        log = vdp_requests.create_request_response_log(
            "GET", "/test", None, 200, {"data": "test"}, "corr"
        )

        assert log["request"]["body"] is None

    def test_create_request_response_log_none_response_body(self):
        """Test handling of None response body."""
        log = vdp_requests.create_request_response_log(
            "DELETE", "/test", {"id": "123"}, 204, None, "corr"
        )

        assert log["response"]["body"] is None


class TestRequestsIntegration:
    """Integration tests for requests module."""

    def test_prepare_and_parse_plain_workflow(self):
        """Test plain request/response workflow."""
        # Prepare request
        request_body = {"test": "data"}
        prepared = vdp_requests.prepare_request_body(request_body, False, None, None, None)

        # Simulate response
        mock_response = Mock()
        mock_response.text = '{"result": "success"}'
        mock_response.json.return_value = {"result": "success"}

        # Parse response
        parsed = vdp_requests.parse_response(mock_response, False, None)

        assert parsed == {"result": "success"}

    def test_prepare_and_parse_encrypted_workflow(self):
        """Test encrypted request/response workflow."""
        key = JsonWebKey.generate_key('RSA', 2048, is_private=True)
        request_body = {"sensitive": "data"}

        # Prepare encrypted request
        prepared = vdp_requests.prepare_request_body(
            request_body, True, encryption.encrypt_with_cert, key, "kid"
        )
        prepared_data = json.loads(prepared)
        assert "encData" in prepared_data

        # Simulate encrypted response
        response_data = {"result": "success"}
        encrypted_response = encryption.encrypt_with_cert(key, "kid", response_data)

        mock_response = Mock()
        mock_response.text = '{"encData": "..."}'
        mock_response.json.return_value = {"encData": encrypted_response}

        # Parse encrypted response
        parsed = vdp_requests.parse_response(mock_response, True, key)
        assert parsed == response_data
