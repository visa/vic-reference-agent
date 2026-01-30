/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
// Comprehensive Type Reference List
// This file imports and re-exports all types for easy reference and navigation
// Use Cmd+Click on any type name to navigate to its definition

// === API TYPES ===
export type {
  // Core API
  ApiResponse,
  HttpMethod,
  RequestHeaders,
  
  // Passkey Results
  PasskeyResult

} from './api';

// === CARD TYPES ===
export type {
  // Card Models
  Card,
  CardWithArt,
  AddCardFormData,
  AddCardRequest,
  EnrollTokenRequest,
  ProvisionTokenRequest,
  
  // Card API Responses
  AddCardData,
  DeleteCardData,
  EnrollTokenData,
  ProvisionTokenData,
  PublicKeyResponse,
  
  // Card State
  InitialCardState,
} from './cards';

// === CHAT TYPES ===
export type {
  // Chat API
  BaseChatRequest,
  ChatMessageData,
  PurchaseSummary,
  ResponseProduct,
  ProductMessageData,
  OrderSummaryMessageData,
  CreateAgenticIntentRequest,
  CreateAgenticIntentData,

  //Thunk Results
  PaymentCompletionResult,
  CreateIntentResult,
  
  // Message Types
  MessageSender,
  MessageType,
  ConversationFlow,
  BaseMessage,
  UserMessage,
  AITextMessage,
  PaymentMethodMessage,
  ProductSummaryMessage,
  AuthorizePurchaseMessage,
  PurchaseConfirmationMessage,
  ChatMessage,
  
  // Product Types
  Product,
  ProductData,
  AcceptedProducts,
  AllProducts,
  MessageProducts,
  OrderSummary,
  orderItem,
  
  // Chat State
  ChatState,
  ProductSelectionState,
  SendChatMessageResult,
  ProcessChatResponseResult,
  
  // Initial States
  InitialChatState,
  InitialPurchaseConfirmationState,
  InitialOrderSummaryState,
  InitialPaymentMethodState,
  InitialProductSelectionState,
} from './chat';

// === COMMON TYPES ===
export type {
  ID,
  Timestamp,
  Currency,
  Status,
  AsyncState,
  Address,
} from './common';

// === MODAL TYPES ===
export type {
  InitialModalState,
} from './modal';

// === PASSKEY TYPES ===
export type {
  PasskeyState,
    // Passkey API
  AuthenticationContext,
  RegisterAuthenticationContext,
  PasskeyAuthenticatePayload,
  PasskeyRegisterPayload,
  PasskeyDeviceBindingPayload,
  PasskeyChallengePayload,
  PasskeyChallengeSolutionPayload,
  PasskeyChallengeSolutionData,
  PasskeyDeviceBindingData,
  PasskeyAuthenticateData,
  PasskeyRegisterData,
  StepUpMethod,
} from './passkey';

// === PAYMENT AUTHORIZATION TYPES ===
export type {
  AuthPromiseHandlers,
  PaymentAuthorizationState,
} from './paymentAuthorization';

// === SIDEBAR TYPES ===
export type {
  SidebarState,
} from './sidebar';

// === API LOGS TYPES ===
export type {
  VDPLog,
  ApiLogsState,
  ExtractedLogFields,
  ProcessedLog,
} from './apiLogs';
/* END GENAI */

