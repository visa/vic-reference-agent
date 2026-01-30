/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import BaseApiService from '../../../lib/api/base';
import { 
    PasskeyAuthenticatePayload,
    PasskeyAuthenticateData,
    PasskeyRegisterPayload,
    PasskeyRegisterData,
    PasskeyDeviceBindingPayload,
    PasskeyDeviceBindingData,
    PasskeyChallengePayload,
    PasskeyChallengeSolutionPayload,
    PasskeyChallengeSolutionData,
    PasskeyConfigData
} from '@/types';

interface PasskeyError {
  statusCode: number;
  message: string;
}

/**
 * Passkey API Service
 * Handles all passkey-related API calls for WebAuthn/VPP flows
 * 
 * Used by:
 * - store/thunks/passkeyThunks/passkeyAuthenticationThunks.js
 * - store/thunks/passkeyThunks/passkeyRegistrationThunks.js
 */
class PasskeyApi extends BaseApiService {

  /**
   * Get passkey configuration
   * @returns {Promise<Object>} Passkey configuration response
   */
  static async getPasskeyConfig() {
    try {
      const data: PasskeyConfigData = await this.makeRequest('/passkey/config', 'GET');
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching passkey configuration.';
      throw new Error(message);
    }
  }

  /**
   * Get attestation options for authentication flow
   * @param {PasskeyAuthenticatePayload} payload - Authentication payload
   * @returns {Promise<PasskeyAuthenticateData>} Authentication context response
   */
  static async attestationOptionsAuthenticate(payload: PasskeyAuthenticatePayload): Promise<PasskeyAuthenticateData> {
    try {
      const data: PasskeyAuthenticateData = await this.makeRequest('/passkey/attestation-options/authenticate', 'POST', {}, payload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching attestation options for authentication.';
      throw new Error(message);
    }
  }

  /**
   * Get attestation options for registration flow
   * @param {PasskeyRegisterPayload} payload - Registration payload
   * @returns {Promise<PasskeyRegisterData>} Registration context response
   */
  static async attestationOptionsRegister(payload: PasskeyRegisterPayload): Promise<PasskeyRegisterData> {
    try {
      const data: PasskeyRegisterData = await this.makeRequest('/passkey/attestation-options/register', 'POST', {}, payload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching attestation options for registration.';
      throw new Error(message);
    }
  }

  /**
   * Device binding for passkey enrollment
   * @param {PasskeyDeviceBindingPayload} payload - Device binding payload
   * @returns {Promise<PasskeyDeviceBindingData>} Device binding response
   */
  static async deviceBinding(payload: PasskeyDeviceBindingPayload): Promise<PasskeyDeviceBindingData> {
    try {
      const data: PasskeyDeviceBindingData = await this.makeRequest('/passkey/device-binding', 'POST', {}, payload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred during device binding.';
      throw new Error(message);
    }
  }

  /**
   * Create challenge for additional authentication
   * @param {PasskeyChallengePayload} payload - Challenge creation payload
   * @returns {Promise<ChallengeResponse>} Challenge response
   */
  static async createChallenge(payload: PasskeyChallengePayload): Promise<any> {
    let data: any;
    try {
      data = await this.makeRequest('/passkey/create-challenge', 'POST', {}, payload, true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while creating challenge.';
      throw new Error(message);
    }
    if (data?.statusCode && data.statusCode >= 400) {
      const passkeyError: PasskeyError = {
        statusCode: data.statusCode,
        message: data.detail || 'Challenge creation failed'
      };
      throw passkeyError;
    }
    return data;
  }

  /**
   * Solve challenge for authentication
   * @param {PasskeyChallengeSolutionPayload} payload - Challenge solution payload
   * @returns {Promise<PasskeyChallengeSolutionData>} Challenge solution response
   */
  static async solveChallenge(payload: PasskeyChallengeSolutionPayload): Promise<PasskeyChallengeSolutionData> {
    try {
      const data: PasskeyChallengeSolutionData = await this.makeRequest('/passkey/solve-challenge', 'POST', {}, payload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while solving challenge.';
      throw new Error(message);
    }
  }
}

export default PasskeyApi;
/* END GENAI */
