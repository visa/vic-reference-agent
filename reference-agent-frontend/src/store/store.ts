/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './rootReducer'
import { chatMiddleware } from '@/middleware/chatMiddleware'

/**
 * Configure and create the Redux store
 * - Includes custom middleware (chatMiddleware)
 * - Configures serializableCheck to ignore specific actions/paths
 * - Enables Redux DevTools in non-production environments
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'paymentAuthorization/startAuthorization'
        ],
        // Ignore promise handlers in paymentAuthorization state
        ignoredPaths: ['paymentAuthorization.authPromiseHandlers'],
      },
    }).concat(chatMiddleware),
  devTools: import.meta.env.MODE !== 'production',
})

export type AppDispatch = typeof store.dispatch
