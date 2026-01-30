/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import BaseApiService from '@/lib/api/base';
import { 
  BaseChatRequest,
  ChatMessageData,
  CreateAgenticIntentData,
  CreateAgenticIntentRequest,
} from '@/types';

/**
 * Chat API Service
 * Handles AI chat conversation API calls
 * 
 * Used by:
 * - store/thunks/chatThunks.js
 */
class ChatApi extends BaseApiService {
  /**
   * Send message to AI chat and get response
   * @param {BaseChatRequest} chatRequest - Chat request payload
   * @returns {Promise<ChatMessageData>} AI chat response
   */
  static async chat(chatRequest: BaseChatRequest): Promise<ChatMessageData> {
    try {
      const data: ChatMessageData = await this.makeRequest('/chat', 'POST', {}, chatRequest);
      return data;
    } catch (error: unknown) {
      console.error('Error in chat API:', error);
      throw error;
    }
  }

  static async createIntent(intentPayload: CreateAgenticIntentRequest): Promise<CreateAgenticIntentData> {
    try {
      console.log('Creating intent with payload:', intentPayload);
      const data: CreateAgenticIntentData = await this.makeRequest('/intents/agent', 'POST', {}, intentPayload, true);
      return data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while creating intent.';
      throw new Error(message);
    }
  }

  /**
   * Reset chat session on the backend
   * @returns {Promise<void>}
   */
  static async resetChat(): Promise<void> {
    try {
      await this.makeRequest('/chat/reset', 'POST');
    } catch (error: unknown) {
      console.error('Error resetting chat:', error);
      throw error;
    }
  }
}

export default ChatApi;
/* END GENAI */
