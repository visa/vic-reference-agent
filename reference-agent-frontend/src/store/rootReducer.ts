/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { combineReducers } from '@reduxjs/toolkit'
import type { Action } from '@reduxjs/toolkit'
import cardsReducer from '../features/cards/slices/cardsSlice'
import chatReducer from '../features/chat/slices/chatSlice'
import paymentAuthorizationReducer from '../features/payment/slices/paymentAuthorizationSlice'
import productSelectionReducer from '../features/chat/slices/productSelectionSlice'
import orderSummaryReducer from '../features/chat/slices/orderSummarySlice'
import purchaseConfirmationReducer from '../features/chat/slices/purchaseConfirmationSlice'
import apiLogsReducer from '../features/logs/slices/apiLogsSlice'
import modalReducer from '../features/layout/slices/modalSlice'
import paymentMethodReducer from '../features/chat/slices/paymentMethodSlice'
import sidebarReducer from '../features/layout/slices/sidebarSlice'
import passkeyReducer from '@/features/passkey/slices/passkeySlice'

/**
 * Root reducer combining all feature reducers
 * Organized by feature domain for better maintainability
 */
const appReducer = combineReducers({
  // Chat domain
  chat: chatReducer,
  productSelection: productSelectionReducer,
  orderSummary: orderSummaryReducer,
  purchaseConfirmation: purchaseConfirmationReducer,
  paymentMethod: paymentMethodReducer,

  // Payment domain
  paymentAuthorization: paymentAuthorizationReducer,

  // Cards domain
  cards: cardsReducer,

  // Logs domain
  apiLogs: apiLogsReducer,

  // Layout/UI domain
  modal: modalReducer,
  sidebar: sidebarReducer,

  // Passkey domain
  passkey: passkeyReducer,
})

/**
 * Root reducer - no auth in open-source version
 */
export const rootReducer = appReducer

export type RootState = ReturnType<typeof rootReducer>
/* END GENAI */
