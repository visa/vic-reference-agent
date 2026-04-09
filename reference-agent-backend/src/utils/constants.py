# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

"""
Application-wide constants for VIC reference agent.

This module contains magic values, default configurations, and constants
used across the application to ensure consistency and maintainability.
"""

# User/Agent Identity Constants
USER_ID = "66d4743e-d13b-4f03-a664-6598cbbb8ee0"
USER_EMAIL = "test@visa.com"
AGENT_ID = "visaagent"
AGENT_NAME = "VisaAgent"
AGENT_URL = "https://visa.com"
HASH_KEY = "some_hash_key"

# VDP Client Request Constants
DEFAULT_LOCALE = "en_US"
DEFAULT_COUNTRY_CODE = "US"
DEFAULT_LANGUAGE_CODE = "en"
DEFAULT_CURRENCY_CODE = "840"  # USD
DEFAULT_MERCHANT_URL = "http://localhost:8000"

# VTS Token Provisioning Constants
PAN_SOURCE_MANUAL = "MANUALLYENTERED"
CONSUMER_ENTRY_MODE_KEY = "KEYENTERED"
PRESENTATION_TYPE_AI_AGENT = "AI_AGENT"
PROTECTION_TYPE_CLOUD = "CLOUD"
ACCOUNT_TYPE_WALLET = "WALLET"

# VTS Device Binding Constants
INTENT_FIDO = "FIDO"
PLATFORM_TYPE_WEB = "WEB"

# VTS Attestation Constants
ATTESTATION_TYPE_REGISTER = "REGISTER"
ATTESTATION_TYPE_AUTHENTICATE = "AUTHENTICATE"
REASON_CODE_DEVICE_BINDING = "DEVICE_BINDING"
REASON_CODE_PAYMENT = "PAYMENT"

# VIC Enrollment Constants
ENROLLMENT_REFERENCE_TYPE_TOKEN = "TOKEN_REFERENCE_ID"
ENROLLMENT_REFERENCE_PROVIDER_VTS = "VTS"

# Time Constants (in seconds)
THREE_DAYS_SECONDS = 3 * 86400  # 259200 seconds
REQUEST_TIMEOUT_SECONDS = 60
CACHE_CONTROL_MAX_AGE = 3600

# Update Reason Codes
UPDATE_REASON_CUSTOMER_CONFIRMED = "CUSTOMER_CONFIRMED"

# Assurance Data Constants
VERIFICATION_TYPE_DEVICE = "DEVICE"
VERIFICATION_ENTITY_ID = "10"
VERIFICATION_EVENT_CODES = ["01", "02"]
VERIFICATION_METHOD_CODE = "23"
VERIFICATION_RESULT_SUCCESS = "01"

# Transaction Constants
TRANSACTION_TYPE_PURCHASE = "PURCHASE"
TRANSACTION_STATUS_APPROVED = "APPROVED"
TRANSACTION_STATUS_DECLINED = "DECLINED"

# Device Types
DEVICE_TYPE_DESKTOP = "Desktop"
DEVICE_BRAND_UNKNOWN = "Unknown"

# Default Intent Description
DEFAULT_INTENT_DESCRIPTION = "Agentic Intent"
