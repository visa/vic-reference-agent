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
import { CompactEncrypt, importSPKI } from 'jose';
import {
  Card,
  AddCardData,
  AddCardFormData,
  DeleteCardData,
  PublicKeyResponse
} from '@/types';

class CardsApi extends BaseApiService {
  /**
   * Get public key for card encryption
   * @returns {Promise<string>} Public key in PEM format
   */
  static async getPublicKey(): Promise<string> {
    const response: PublicKeyResponse = await this.makeRequest('/cards/public-key', 'GET', {}, true);
    return response;
  }

  /**
   * Add a new card with encrypted payload
   * @param {AddCardFormData} cardDetails - Card details to encrypt and add
   * @returns {Promise<AddCardData>} Added card response
   */
  static async addCard(cardDetails: AddCardFormData): Promise<AddCardData> {
    try {
      // Get public key for encryption
      const pubKeyPem = await this.getPublicKey();
      const publicKey = await importSPKI(pubKeyPem, 'RSA-OAEP-256');

      // Encrypt card details
      const payload = new TextEncoder().encode(JSON.stringify(cardDetails));
      const jwe = await new CompactEncrypt(payload)
        .setProtectedHeader({ alg: 'RSA-OAEP-256', enc: 'A256GCM' })
        .encrypt(publicKey);

      // Send encrypted payload
      const data: AddCardData = await this.makeRequest('/cards', 'POST', {}, { encPaymentInstrument: jwe });
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while adding the card.';
      throw new Error(message);
    }
  }

  /**
   * Delete a card
   * @param {string} cardId - ID of the card to delete
   * @returns {Promise<DeleteCardData>} Deletion response
   */
  static async deleteCard(cardId: string): Promise<DeleteCardData> {
    try {
      const result: DeleteCardData = await this.makeRequest(`/cards/${cardId}`, 'DELETE');
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while deleting the card.';
      throw new Error(message);
    }
  }

  /**
   * Get details for a specific card
   * @param {string} cardId - ID of the card to fetch
   * @returns {Promise<Card>} Card details
   */
  static async getCard(cardId: string): Promise<Card> {
    try {
      const data: Card = await this.makeRequest(`/cards/${cardId}`, 'GET');
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching the card.';
      throw new Error(message);
    }
  }

  /**
   * Get all cards for the current user
   * @returns {Promise<Card[]>} List of user's cards
   */
  static async getCards(): Promise<Card[]> {
    try {
      const data: Card[] = await this.makeRequest('/cards', 'GET');
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching cards.';
      throw new Error(message);
    }
  }

  /**
   * Get card art/image for a specific card
   * @param {string} cardId - ID of the card to get art for
   * @returns {Promise<any>} Card art response with imageUrl
   */
  static async getCardArt(cardId: string): Promise<any> {
    try {
      const data: any = await this.makeRequest(`/cards/${cardId}/art`, 'GET');
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while fetching card art.';
      throw new Error(message);
    }
  }
}

export default CardsApi;
/* END GENAI */
