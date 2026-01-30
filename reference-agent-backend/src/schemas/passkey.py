# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

from typing import Dict, Any, Optional
from uuid import UUID
from src.schemas.base import BaseSchema

class SessionContext(BaseSchema):
    secure_token: str

class BrowserData(BaseSchema):
    browser_java_enabled: bool
    browser_javascript_enabled: bool
    browser_header: str
    browser_language: str
    browser_color_depth: str
    browser_screen_height: str
    browser_screen_width: str
    browser_time_zone: str
    user_agent: str
    ip_address: str

class AuthentationContext(BaseSchema):
    authentication_context: dict

class AttestationOptionsAuthenticateRequest(BaseSchema):
    client_reference_id: UUID
    session_context: SessionContext
    browser_data: BrowserData
    provisioned_token_id: str
    amount: str | None = "0"
    currency_code: str | None = "840"
    prompt: str | None = None

class DeviceBindingRequest(BaseSchema):
    client_reference_id: UUID
    session_context: SessionContext
    browser_data: BrowserData
    provisioned_token_id: str
    exp_month: int
    exp_year: int

class CreateChallengeRequest(BaseSchema):
    client_reference_id: UUID
    provisioned_token_id: str
    identifier: str

class SolveChallengeRequest(BaseSchema):
    client_reference_id: UUID
    provisioned_token_id: str
    code: str

class AttestationOptionsRegisterRequest(BaseSchema):
    client_reference_id: UUID
    session_context: SessionContext
    browser_data: BrowserData
    provisioned_token_id: str

class PasskeyConfigResponse(BaseSchema):
    passkey_waiver_enabled: bool