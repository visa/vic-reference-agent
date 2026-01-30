/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import BaseApiService from '../../../lib/api/base';
import { 
  ProvisionTokenRequest, ProvisionTokenData,
  EnrollTokenRequest, EnrollTokenData
} from '@/types';
/**
 * Token Management API Service
 * Handles token provisioning and enrollment for cards
 * 
 * Used by:
 * - store/thunks/enrollmentThunks.js
 * - features/cards/hooks/useEnrollToken.js
 * - features/cards/hooks/useCardManagement.js
 * - components/PasskeyModal/PasskeyModal.js
 */
class TokensApi extends BaseApiService {
  /**
   * Provision a new token for a card
   * @param {ProvisionTokenRequest} provisionPayload - Token provisioning data
   * @returns {Promise<ProvisionTokenData>} Token provisioning response
   */
  static async provisionToken(provisionPayload: ProvisionTokenRequest) {
    try {
      console.log('Provisioning token with payload:', provisionPayload);
      const data: ProvisionTokenData = await this.makeRequest('/tokens', 'POST', {}, provisionPayload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while provisioning token.';
      throw new Error(message);
    }
  }

  /**
   * Enroll a token for passkey authentication
   * @param {EnrollTokenRequest} enrollPayload - Token enrollment data
   * @returns {Promise<EnrollTokenData>} Token enrollment response
   */
  static async enrollToken(enrollPayload: EnrollTokenRequest) {
    try {
      const data: EnrollTokenData = await this.makeRequest('/tokens/enroll', 'POST', {}, enrollPayload);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while enrolling token.';
      throw new Error(message);
    }
  }
}

export default TokensApi;
