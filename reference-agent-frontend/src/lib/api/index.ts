/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Backward compatibility index - Re-exports all API functions
// This maintains the original ApiService interface while using the new modular structure
// Eventually, imports should be updated to use feature-specific APIs directly

import BaseApiService from './base';

// Feature-specific API imports
import ChatApi from '@/features/chat/api/chatApi';
import TokensApi from '@/features/cards/api/tokensApi';
import CardsApi from '@/features/cards/api/cardsApi';
import PasskeyApi from '@/features/passkey/api/passkeyApi';

class ApiService {
  // === Core Infrastructure (from BaseApiService) ===
  static makeRequest = BaseApiService.makeRequest;
  static storeVDPLogs = BaseApiService.storeVDPLogs;

  // === Card Management APIs (migrated to CardsApi) ===
  static getPublicKey = CardsApi.getPublicKey;
  static addCard = CardsApi.addCard;
  static deleteCard = CardsApi.deleteCard;
  static getCard = CardsApi.getCard;
  static getCards = CardsApi.getCards;
  static getCardArt = CardsApi.getCardArt;

  // === Chat APIs (migrated to ChatApi) ===
  static chat = ChatApi.chat;
  static createIntent = ChatApi.createIntent;
  static resetChat = ChatApi.resetChat;

  // === Token Management APIs (migrated to TokensApi) ===
  static provisionToken = TokensApi.provisionToken;
  static enrollToken = TokensApi.enrollToken;

  // === Passkey APIs (migrated to PasskeyApi) ===
  static attestationOptionsAuthenticate = PasskeyApi.attestationOptionsAuthenticate;
  static attestationOptionsRegister = PasskeyApi.attestationOptionsRegister;
  static deviceBinding = PasskeyApi.deviceBinding;
  static createChallenge = PasskeyApi.createChallenge;
  static solveChallenge = PasskeyApi.solveChallenge;
}

export default ApiService;
export { BaseApiService };
