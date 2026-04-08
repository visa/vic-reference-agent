/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Chat-specific types (non-API)
// These types define the structure of chat messages, products, and UI state
// API-related types are in api.ts
//CHAT API

import { PasskeyResult } from "./api";
import { VICDeviceData } from "@/utils/deviceUtils";

export interface BaseChatRequest { 
    last_4: string | null;
    message: string;
    products: any[] | null;
}

export interface ChatMessageData { 
    responseMessage: string;
    products: ResponseProduct[] | []
    orderSummary: any | null;
}

export interface PurchaseSummary { 
    merchant: string;           // Merchant name
    overallAmount: string;      // Total amount paid  
    orderId: string | null;     // Order ID from the merchant
    trackingCode: string | null; // Shipping tracking code
}

export type ResponseProduct = {
    name: string;
    price: string;
    image: string;
    sku: string;
    description: string;
}

export interface ProductMessageData {
    responseMessage: string;
    products: ResponseProduct[] | null;
    orderSummary: null;
}

export interface OrderSummaryMessageData { 
    responseMessage: string;
    products: any[] | null;
    orderSummary: {
        merchant_name: string;
        checkout_url: string;
        overall_amount: string;
    }
}

export interface CreateAgenticIntentRequest extends PasskeyResult {
    amount: string;                       // "14.71"
    currencyCode: string;                 // "USD"
    expirationTimestamp: string;          // ISO timestamp
    intentId: string;                     // Different from 'id'
    products: Product[];                  // Array of products
    prompt: string;                       // "Party Depot Store"
    verificationTimestamp: string;        // ISO timestamp
    deviceInfo?: VICDeviceData;
}

export type MessageSender = 'user' | 'ai';

export type MessageType = 'paymentMethod' | 'productSummary' | 'authorizePurchase' | 'purchaseConfirmation';

export type ConversationFlow = 'idle' | 'orderFlow' | 'paymentFlow' | 'authFlow' | 'completed';

// Base message interface
export interface BaseMessage {
  sender: MessageSender;
  text?: string;
  type?: MessageType;
}

// User message
export interface UserMessage extends BaseMessage {
  sender: 'user';
  text: string;
  timestamp: string;
}

// AI text message
export interface AITextMessage extends BaseMessage {
  sender: 'ai';
  text: string;
  timestamp: string;
}

// Payment method selection message
export interface PaymentMethodMessage extends BaseMessage {
  sender: 'ai';
  type: 'paymentMethod';
  isCompleted: boolean;
  timestamp: string;
}

export interface OrderSummary{
    merchantName: string;
    overallAmount: string;
    currencyCode?: string;
}

export interface orderItem { 
    id?: string;
    productId?: string;
    name: string;
    price: string;
    quantity: number;
    image?: string;
}

export interface AuthorizePurchaseMessage extends BaseMessage {
    sender: 'ai';
    type: 'authorizePurchase';
    isCompleted: boolean;
    orderSummary: OrderSummary;
    timestamp: string;
}

export interface PurchaseConfirmationMessage extends BaseMessage {
    sender: 'ai';
    type: 'purchaseConfirmation';
    orderItems: orderItem[];
    purchaseSummary: PurchaseSummary | null;
    timestamp: string;
}

// Product summary message
export interface ProductSummaryMessage extends BaseMessage {
  sender: 'ai';
  type: 'productSummary';
  products: ResponseProduct[];
  showCartCard?: boolean;
}

// Union type for all possible messages
export type ChatMessage = UserMessage | AITextMessage | PaymentMethodMessage | ProductSummaryMessage | AuthorizePurchaseMessage | PurchaseConfirmationMessage;

// Product interfaces
export interface Product {
  name: string;
  price: string;
  productId: string;
  quantity: number;
}

// Product selection/acceptance state
export interface ProductData {
  accepted: boolean;
  quantity: number;
  price: string;
}

// Accepted products structure (messageIndex -> productName -> ProductData)
export interface AcceptedProducts {
  [messageIndex: number]: {
    [productName: string]: ProductData;
  };
}

// All products structure (messageIndex -> Product[])
export interface AllProducts {
  [messageIndex: number]: ResponseProduct[];
}

export interface MessageProducts {
  [productName: string]: ProductData;
}

// Chat state interfaces
export interface ChatState {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  isTyping: boolean;
  conversationFlow: ConversationFlow;
}

export interface ProductSelectionState {
  allProducts: AllProducts;
  acceptedProducts: AcceptedProducts;
}

// Thunk payload types
export interface SendChatMessageResult {
  response: ChatMessageData; // API response from chat endpoint
}

export interface ProcessChatResponseResult {
  messageType?: string;
  products?: Product[];
}

//Initial Redux States

export interface InitialChatState { 
    messages: ChatMessage[];
    input: string;
    loading: boolean;
    isTyping: boolean;
    conversationFlow: ConversationFlow;
}

export interface InitialOrderSummaryState { 
    orderSummary: OrderSummary | null;
}

export interface InitialPaymentMethodState {
    selectedCard: string | null;
}

export interface InitialProductSelectionState {
    allProducts: AllProducts;
    acceptedProducts: AcceptedProducts;
}

export interface InitialPurchaseConfirmationState {
    purchaseConfirmation: {
        [messageIndex: number]: {
            orderItems: orderItem[];
            purchaseSummary: PurchaseSummary | null;
            timestamp: string; // ISO 8601 format
        };
    };
}

export interface CreateAgenticIntentData { 
    status: string;
    message: string;
    purchaseSummary: {
        merchant: string;
        overallAmount: string;
        orderId: string | null;
        trackingCode: string | null;
        orderCount: number;
        allOrderNumbers: any[] | null;
        orderDetails: any[] | null;
    },
    statusCode: number | undefined;
}

export interface PaymentCompletionResult {
  success: boolean;
  message: AITextMessage;
  response: CreateAgenticIntentData | null;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  purchaseSummary: PurchaseSummary | null;
}

export interface CreateIntentResult {
  success: boolean;
  response: CreateAgenticIntentData;
  statusCode: number | undefined;
}
