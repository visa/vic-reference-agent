# © 2026 Visa.
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import base64
from datetime import datetime, timezone
import hashlib
import hmac
import json
import time
from typing import Sequence
from uuid import uuid4
from calendar import timegm
from fastapi import Request
from authlib.jose import JsonWebEncryption, JsonWebKey, OctKey
from jose import jwt
import requests

from src.config import settings
from src.schemas.commerce import AssuranceData, TransactionData
from src.utils.encoder import base64url_encode
from src.schemas.commerce import AssuranceData
from src.utils.constants import (
    USER_EMAIL, USER_ID, AGENT_ID, AGENT_NAME, AGENT_URL, HASH_KEY,
    DEFAULT_LOCALE, DEFAULT_COUNTRY_CODE, DEFAULT_LANGUAGE_CODE,
    PAN_SOURCE_MANUAL, CONSUMER_ENTRY_MODE_KEY, PRESENTATION_TYPE_AI_AGENT,
    PROTECTION_TYPE_CLOUD, ACCOUNT_TYPE_WALLET, INTENT_FIDO, PLATFORM_TYPE_WEB,
    ATTESTATION_TYPE_REGISTER, ATTESTATION_TYPE_AUTHENTICATE,
    REASON_CODE_DEVICE_BINDING, REASON_CODE_PAYMENT,
    ENROLLMENT_REFERENCE_TYPE_TOKEN, ENROLLMENT_REFERENCE_PROVIDER_VTS,
    REQUEST_TIMEOUT_SECONDS, UPDATE_REASON_CUSTOMER_CONFIRMED,
    VERIFICATION_TYPE_DEVICE, VERIFICATION_ENTITY_ID, VERIFICATION_EVENT_CODES,
    VERIFICATION_METHOD_CODE, VERIFICATION_RESULT_SUCCESS,
    TRANSACTION_TYPE_PURCHASE, TRANSACTION_STATUS_APPROVED, TRANSACTION_STATUS_DECLINED,
    DEVICE_TYPE_DESKTOP, DEVICE_BRAND_UNKNOWN
)

# Substrings (case-insensitive) of JSON keys whose values are sensitive and must
# not appear in the request/response logs surfaced to the browser. Covers PAN,
# CVV/SAD, expiry, tokens, encrypted blobs, and secrets.
_SENSITIVE_KEY_PARTS = (
    "pan", "card_number", "cardnumber", "accountnumber", "cvv", "cvc",
    "securitycode", "security_code", "expiry", "expirationdate", "expiration_date",
    "paymenttoken", "dynamicdatavalue", "encpaymentinstrument", "encdata",
    "enc_payment_instrument", "secret", "password", "sharedsecret", "authorization",
)
_REDACTED = "[REDACTED]"

def _redact_log_payload(value):
    """Recursively redact sensitive values in a request/response log payload."""
    if isinstance(value, dict):
        out = {}
        for k, v in value.items():
            key = str(k).lower().replace("-", "").replace("_", "")
            if any(part.replace("_", "") in key for part in _SENSITIVE_KEY_PARTS):
                out[k] = _REDACTED
            else:
                out[k] = _redact_log_payload(v)
        return out
    if isinstance(value, list):
        return [_redact_log_payload(v) for v in value]
    return value

class VDPClient:
    def __init__(self, request: Request):
        self.vts_base_url = settings.vts_base_url
        self.vts_api_key = settings.vts_api_key
        self.vts_shared_secret = settings.vts_shared_secret

        self.vic_base_url = settings.vic_base_url
        self.vic_api_key = settings.vic_api_key
        self.vic_shared_secret = settings.vic_shared_secret

        self.tr_id = settings.tr_id
        self.tr_client_id = settings.tr_client_id
        self.tr_app_id = settings.tr_app_id
        self.tr_enc_api_key = settings.tr_enc_api_key
        self.tr_enc_shared_secret = settings.tr_enc_shared_secret

        self.mle_enc_cert = JsonWebKey.import_key(settings.mle_enc_cert)
        self.mle_key_id = settings.mle_key_id
        self.mle_dec_key = JsonWebKey.import_key(settings.mle_dec_key)

        self.request = request
        self.request.state.logs = []
    
    def _make_request(self, method, path, body = None, message_encrypted = False):
        # Get config for service (VIC or VTS)
        if path.startswith("/vacp/"):
            base_url = self.vic_base_url
            api_key = self.vic_api_key
            shared_secret = self.vic_shared_secret
        else:
            base_url = self.vts_base_url
            api_key = self.vts_api_key
            shared_secret = self.vts_shared_secret
        
        # Construct full URL with query string
        query_string = "apikey=" + api_key
        full_url = base_url + path + '?' + query_string

        # Prepare final request body (serialize, encrypt if needed)
        final_body = ""
        if body is not None:
            if message_encrypted:
                encrypted_body = {
                    "encData": self._encrypt_with_cert(self.mle_enc_cert, self.mle_key_id, body)
                }
                final_body = json.dumps(encrypted_body)
            else:
                final_body = json.dumps(body)
        
        # Generate authentication token and headers
        resource_path = self._get_resource_path(path)
        timestamp = str(timegm(datetime.now(timezone.utc).timetuple()))
        pre_hash_string = timestamp + resource_path + query_string + final_body
        hash_string = self._get_hash(shared_secret, pre_hash_string)
        x_pay_token = 'xv2:' + timestamp + ':' + hash_string
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-pay-token': x_pay_token,
            'x-request-id': str(uuid4())
        }

        # For encrypted messages, include the MLE key ID header
        if message_encrypted and self.mle_key_id != None:
            headers['keyId'] = self.mle_key_id

        # Create the request log to return to the frontend (sensitive values
        # such as PAN/CVV/tokens are redacted before leaving the server).
        request_log = {
            "method": method,
            "path": path,
            "body": _redact_log_payload(body)
        }
        
        # Make the HTTP request
        session = requests.Session()
        request = requests.Request(method=method, url=full_url, headers=headers, data=final_body).prepare()
        try:
            response = session.send(request, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.RequestException as e:
            raise

        # Handle response decryption if needed
        if response.text:
            response_json = response.json()
            if message_encrypted and response_json.get('encData', None):
                response_json = self._decrypt_with_key(self.mle_dec_key, response_json.get('encData'))
        else:
            response_json = None

        # Create the full request-response log to return to the frontend
        response_log = {
            "statusCode": response.status_code,
            "body": _redact_log_payload(response_json),
            "correlationId": response.headers.get('X-CORRELATION-ID', 'unknown')
        }
        request_response_log = {
            "request": request_log,
            "response": response_log,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.request.state.logs.append(request_response_log)

        # Raise exception for error responses
        if response.status_code >= 400:
            error_message = f"VDP API request failed with status {response.status_code}"
            # Log detailed error internally but don't expose in exception message
            raise ValueError(error_message)

        return response_json
    
    def _get_resource_path(self, url):
        # For VIC endpoints, strip the /vacp/ prefix when determining the resource path
        if url.startswith("/vacp/"):
            return "/".join(url.strip("/").split("/")[1:])
        return url.strip("/")

    # For field-level encryption
    def _encrypt_with_secret(self, secret, kid, payload):
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
        return jwe_instance.serialize_compact(protected_header, json.dumps(payload).encode('utf-8'), key).decode('utf-8')

    # For MLE encryption
    def _encrypt_with_cert(self, cert, kid, payload):
        protected_header = {
            "alg": "RSA-OAEP-256",
            "enc": "A256GCM",
            "kid": kid,
            "iat": int(round(time.time() * 1000))
        }
        jwe_instance = JsonWebEncryption()
        return jwe_instance.serialize_compact(protected_header, json.dumps(payload).encode('utf-8'), cert).decode('utf-8')

    # For MLE decryption
    def _decrypt_with_key(self, key, encrypted_payload):
        jwe_instance = JsonWebEncryption()
        result = jwe_instance.deserialize_compact(encrypted_payload, key)
        return json.loads(result["payload"].decode("utf-8"))

    def _get_hash(self, secret, payload, base64_encoded = False):
        hash = hmac.new(
            bytes(secret, 'utf-8'),
            bytes(payload, 'utf-8'),
            digestmod=hashlib.sha256
        )
        if base64_encoded:
            return base64.urlsafe_b64encode(hash.digest()).rstrip(b'=').decode('utf-8')
        return hash.hexdigest()
    
    def _process_browser_data(self, browser_data):
        return {
            "browserJavaEnabled": str(browser_data.get('browserJavaEnabled')),
            "browserJavascriptEnabled": str(browser_data.get('browserJavascriptEnabled')),
            "browserHeader": base64url_encode(browser_data.get('browserHeader')),
            "browserLanguage": browser_data.get('browserLanguage'),
            "browserColorDepth": str(browser_data.get('browserColorDepth')),
            "browserScreenHeight": str(browser_data.get('browserScreenHeight')),
            "browserScreenWidth": str(browser_data.get('browserScreenWidth')),
            "browserTimeZone": str(browser_data.get('browserTimeZone')),
            "userAgent": base64url_encode(browser_data.get('userAgent')),
            "ipAddress": browser_data.get('ipAddress')
        }
    
    def enroll_pan(self, card_number: str, name: str, exp_month: int, exp_year: int, cvv: str):
        """
        Enroll a PAN (Primary Account Number) with VTS.

        Args:
            card_number: Card number to enroll
            name: Cardholder name
            exp_month: Expiration month (1-12)
            exp_year: Expiration year (YYYY)
            cvv: Card CVV

        Returns:
            Enrollment response with vPanEnrollmentID

        Raises:
            ValueError: If enrollment fails or returns empty response
        """
        resp = self._make_request("POST", "/vts/panEnrollments", {
            "locale": DEFAULT_LOCALE,
            "clientAppID": self.tr_app_id,
            "clientWalletAccountID": self.tr_id,
            "panSource": PAN_SOURCE_MANUAL,
            "consumerEntryMode": CONSUMER_ENTRY_MODE_KEY,
            "encPaymentInstrument": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, {
                "accountNumber": card_number,
                "name": name,
                "expirationDate": {
                    "month": exp_month,
                    "year": exp_year,
                },
                "cvv2": cvv
            })
        })
        if resp is None:
            raise ValueError("Empty response from Enroll PAN endpoint")
        return resp
    
    def provision_token_given_pan_enrollment_id(self, pan_enrollment_id: str, exp_month: int, exp_year: int):
        resp = self._make_request("POST", f"/vts/panEnrollments/{pan_enrollment_id}/provisionedTokens", {
            "clientAppID": self.tr_app_id,
            "clientWalletAccountID": self.tr_id,
            "clientWalletAccountEmailAddress": "test@example.com",
            "clientWalletAccountEmailAddressHash": self._get_hash(HASH_KEY, "test@example.com", True),
            "presentationType": [
                PRESENTATION_TYPE_AI_AGENT
            ],
            "protectionType": PROTECTION_TYPE_CLOUD,
            "accountType": ACCOUNT_TYPE_WALLET,
            "encRiskDataInfo": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, [
                {
                    "name": "paymentInstrument.expirationDate.month",
                    "value": exp_month
                },
                {
                    "name": "paymentInstrument.expirationDate.year",
                    "value": exp_year
                }
            ]),
        })
        if resp is None:
            raise ValueError("Empty response from Provision Token endpoint")
        token = resp["tokenInfo"]
        token['vProvisionedTokenID'] = resp["vProvisionedTokenID"]
        return token

    def deprovision(self, provisioned_token_id: str):
        _ = self._make_request("PUT", f"/vts/provisionedTokens/{provisioned_token_id}/delete", {
            "updateReason": {
                "reasonCode": UPDATE_REASON_CUSTOMER_CONFIRMED,
            }
        })

    def get_card_metadata(self, pan_enrollment_id: str):
        resp = self._make_request("GET", f"/vts/panEnrollments/{pan_enrollment_id}")
        if resp is None:
            raise ValueError("Empty response from Get Card Metadata endpoint")
        return resp.get('cardMetaData')

    def get_card_art(self, card_art_id: str):
        resp = self._make_request("GET", f"/vts/cps/getContent/{card_art_id}")
        if resp is None:
            raise ValueError("Empty response from Get Card Art endpoint")
        return resp.get('content')[0]

    def device_binding(self, id, provisioned_token_id, exp_month, exp_year, session_context, browser_data):
        resp = self._make_request("POST", f"/vts/provisionedTokens/{provisioned_token_id}/deviceBinding", {
            "clientReferenceID": id,
            "clientAppID": self.tr_app_id,
            "clientWalletAccountEmailAddressHash": self._get_hash(HASH_KEY, USER_EMAIL, True),
            "intent": INTENT_FIDO,
            "platformType": PLATFORM_TYPE_WEB,
            "encBillingInfo": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, {
               "email": USER_EMAIL
            }),
            "encDeviceRiskDataInfo": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, [
                {
                    "name": "paymentInstrument.expirationDate.month",
                    "value": exp_month
                },
                {
                    "name": "paymentInstrument.expirationDate.year",
                    "value": exp_year
                }
            ]),
            "sessionContext": session_context,
            "browserData": self._process_browser_data(browser_data),
        })
        if resp is None:
            raise ValueError("Empty response from Request Device Binding endpoint")
        return resp

    def create_challenge(self, id, provisioned_token_id, identifier):
        resp = self._make_request("PUT", f"/vts/provisionedTokens/{provisioned_token_id}/stepUpOptions/method", {
            "clientReferenceId": id,
            "stepUpRequestID": identifier,
            "date": int(time.time())
        })
        if resp is None:
            raise ValueError("Empty response from Submit Step Up Method endpoint")
        return resp

    def solve_challenge(self, id, provisioned_token_id, code):
        resp = self._make_request("POST", f"/vts/provisionedTokens/{provisioned_token_id}/stepUpOptions/validateOTP", {
            "clientReferenceId": id,
            "otpValue": code,
            "date": int(time.time())
        })
        if resp is None:
            raise ValueError("Empty response from Validate Step Up OTP endpoint")
        return resp
    
    def attestation_options_register(self, id, provisioned_token_id, session_context, browser_data, amount = 0, currency_code = 840):
        resp = self._make_request("POST", f"/vts/provisionedTokens/{provisioned_token_id}/attestation/options", {
            "clientReferenceID": id,
            "type": ATTESTATION_TYPE_REGISTER,
            "reasonCode": REASON_CODE_DEVICE_BINDING,
            "sessionContext": session_context,
            "browserData": self._process_browser_data(browser_data),
            "dynamicData":  {
                "authenticationAmount": str(amount),
                "currencyCode": str(currency_code),
                "merchantIdentifier": {
                    "externalClientId": base64.urlsafe_b64encode(bytes(AGENT_ID, 'utf-8')).rstrip(b'=').decode('utf-8'),
                    "applicationUrl": base64.urlsafe_b64encode(bytes(AGENT_URL, 'utf-8')).rstrip(b'=').decode('utf-8'),
                    "merchantName": base64.urlsafe_b64encode(bytes(AGENT_NAME, 'utf-8')).rstrip(b'=').decode('utf-8'),
                }
            },
            "encAuthenticationData": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, {
                "consumerInfo": {
                    "emailAddress": USER_EMAIL
                }
            }),
            "authenticationPreferencesRequested": {
                "selectedPopupForRegister": True
            }
        })
        if resp is None:
            raise ValueError("Empty response from Get Device Attestation Options endpoint")
        auth_context = resp["authenticationContext"]
        return auth_context
    
    def attestation_options_authenticate(self, id, provisioned_token_id, session_context, browser_data, amount, currency_code, merchants = None):
        resp = self._make_request("POST", f"/vts/provisionedTokens/{provisioned_token_id}/attestation/options", {
            "clientReferenceID": id,
            "type": ATTESTATION_TYPE_AUTHENTICATE,
            "reasonCode": REASON_CODE_PAYMENT,
            "sessionContext": session_context,
            "browserData": self._process_browser_data(browser_data),
            "dynamicData":  {
                "authenticationAmount": amount,
                "currencyCode": currency_code,
                "merchantIdentifier": {
                    "externalClientId": base64.urlsafe_b64encode(bytes(AGENT_ID, 'utf-8')).rstrip(b'=').decode('utf-8'),
                    "applicationUrl": base64.urlsafe_b64encode(bytes(AGENT_URL, 'utf-8')).rstrip(b'=').decode('utf-8'),
                    "merchantName": base64.urlsafe_b64encode(bytes(merchants if merchants else AGENT_NAME, 'utf-8')).rstrip(b'=').decode('utf-8'),
                }
            },
            "encAuthenticationData": self._encrypt_with_secret(self.tr_enc_shared_secret, self.tr_enc_api_key, {
                "consumerInfo": {
                    "emailAddress": USER_EMAIL
                }
            }),
            "authenticationPreferencesRequested": {
                "selectedPopupForAuthenticate": True
            }
        })
        if resp is None:
            raise ValueError("Empty response from Get Device Attestation Options endpoint")
        auth_context = resp["authenticationContext"]
        return auth_context
    
    def enroll_card(self, provisioned_token_id, client_device_id = None, ip = None, user_agent = None, device_info = None):
        if device_info:
            device_data = device_info.model_dump() if hasattr(device_info, 'model_dump') else device_info
        else:
            device_data = {"type": DEVICE_TYPE_DESKTOP, "brand": DEVICE_BRAND_UNKNOWN}
        resp = self._make_request("POST", "/vacp/v1/cards", {
            "clientReferenceId": USER_ID,
            "client": {
                "externalClientId": self.tr_client_id,
                "externalAppId": self.tr_app_id
            },
            "appInstance": {
                "userAgent": user_agent,
                "ipAddress": ip,
                "clientDeviceId": client_device_id,
                "applicationName": AGENT_NAME,
                "countryCode": DEFAULT_COUNTRY_CODE,
                "deviceData": device_data
            },
            "enrollmentReferenceData": {
                "enrollmentReferenceId": provisioned_token_id,
                "enrollmentReferenceType": ENROLLMENT_REFERENCE_TYPE_TOKEN,
                "enrollmentReferenceProvider": ENROLLMENT_REFERENCE_PROVIDER_VTS,
            },
            "consumer": {
                "consumerId": USER_ID,
                "countryCode": DEFAULT_COUNTRY_CODE,
                "languageCode": DEFAULT_LANGUAGE_CODE,
                "consumerIdentity": {
                    "identityType": "EMAIL_ADDRESS",
                    "identityValue": USER_EMAIL
                }
            }
        }, message_encrypted=True)
        if resp is None:
            raise ValueError("Empty response from Enroll Card endpoint")
        return resp
    
    def create_intent(self, provisioned_token_id, mandate_id, amount, currency_code, assurance_data: AssuranceData, verification_timestamp, expiration_timestamp, prompt = None, client_device_id=None, ip = None, user_agent = None, device_info = None):
        if device_info:
            device_data = device_info.model_dump() if hasattr(device_info, 'model_dump') else device_info
        else:
            device_data = {"type": DEVICE_TYPE_DESKTOP, "brand": DEVICE_BRAND_UNKNOWN}
        resp = self._make_request("POST", "/vacp/v1/instructions", {
            "clientReferenceId": USER_ID,
            "client": {
                "externalClientId": self.tr_client_id,
                "externalAppId": self.tr_app_id
            },
            "appInstance": {
                "userAgent": user_agent,
                "ipAddress": ip,
                "clientDeviceId": client_device_id,
                "applicationName": AGENT_NAME,
                "countryCode": DEFAULT_COUNTRY_CODE,
                "deviceData": device_data
            },
            "consumerId": USER_ID,
            "tokenId": provisioned_token_id,
            "assuranceData": [
                {
                    "verificationType": VERIFICATION_TYPE_DEVICE,
                    "verificationEntity": VERIFICATION_ENTITY_ID,
                    "verificationEvents": VERIFICATION_EVENT_CODES,
                    "verificationMethod": VERIFICATION_METHOD_CODE,
                    "verificationResults": VERIFICATION_RESULT_SUCCESS,
                    "verificationTimestamp": str(verification_timestamp),
                    "methodResults": {
                        "dfpSessionId": "ALLOW_ME",
                        "identifier": assurance_data.identifier,
                        "fidoAssertionData": assurance_data.fido_assertion_data.model_dump(by_alias=True)
                    },
                    "additionalData": "str",
                }
            ],
            "mandates": [
                {
                    "mandateId": mandate_id,
                    "description": prompt,
                    "declineThreshold": {
                        "amount": amount,
                        "currencyCode": currency_code,
                    },
                    "effectiveUntilTime": str(expiration_timestamp),
                },
            ],
            "compressedPrompt": prompt,
        }, message_encrypted=True)
        if resp is None:
            raise ValueError("Empty response from Create Instruction endpoint")
        return resp
    
    def retrieve_credentials(self, provisioned_token_id: str, instruction_id: str, transaction_data: Sequence[TransactionData]):
        resp = self._make_request("POST", f"/vacp/v1/instructions/{instruction_id}/credentials", {
            "clientReferenceId": USER_ID,
            "client": {
                "externalClientId": self.tr_client_id,
                "externalAppId": self.tr_app_id
            },
            "tokenId": provisioned_token_id,
            "transactionData": [
                {
                    "transactionReferenceId": str(transaction_data_item.transaction_reference_id),
                    "transactionAmount": transaction_data_item.transaction_amount.model_dump(by_alias=True),
                    "merchantName": transaction_data_item.merchant_name,
                    "merchantCountryCode": transaction_data_item.merchant_country_code,
                    "merchantUrl": transaction_data_item.merchant_url,
                    "mandateReferenceData": [str(transaction_data_item.mandate_id)]
                }
                for transaction_data_item in transaction_data
            ]
        }, message_encrypted=True)
        if resp is None:
            raise ValueError("Empty response from Retrieve Credentials endpoint")
        purchase = jwt.get_unverified_claims(resp["signedPayload"])
        purchase["status"] = resp["status"]
        return purchase
    
    def confirm_transaction(self, instruction_id: str, transaction_reference_id: str, dynamic_data_id: str, amount: str, currency_code: str, transaction_status: str, order_id: str | None = None):
        resp = self._make_request("POST", f"/vacp/v1/instructions/{instruction_id}/confirmations", {
            "clientReferenceId": USER_ID,
            "confirmationData": [
                {
                    "transactionReferenceId": transaction_reference_id,
                    **({"orderData": {"orderId": order_id}} if order_id is not None else {}),
                    "paymentConfirmationData": {
                        "dynamicDataId": dynamic_data_id,
                        "transactionType": TRANSACTION_TYPE_PURCHASE,
                        "transactionStatus": transaction_status,
                        "transactionTimestamp": str(int(time.time())),
                        "transactionAmount": {
                            "transactionAmount": amount,
                            "transactionCurrencyCode": currency_code
                        }
                    }
                }
            ]
        }, message_encrypted=True)
        if resp is None:
            raise ValueError("Empty response from Confirm Transaction endpoint")
        return resp