/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PaymentAuthorizationState, AuthPromiseHandlers } from '@/types';

const initialState: PaymentAuthorizationState = {
    authPromiseHandlers: null,
};

export const paymentAuthorizationSlice = createSlice({
    name: 'paymentAuthorization',
    initialState,
    reducers: {

        setAuthPromiseHandlers: (state, action: PayloadAction<AuthPromiseHandlers | null>) => {
            state.authPromiseHandlers = action.payload;
        },

        resolveAuthorization: (state, action: PayloadAction<any>) => {
            state.authPromiseHandlers = null;
        },

        rejectAuthorization: (state, action: PayloadAction<any>) => {
            state.authPromiseHandlers = null;
        },

        clearAuthPromiseHandlers: (state) => {
            state.authPromiseHandlers = null;
        },

        startAuthorization: (state, action: PayloadAction<{ promiseHandlers: AuthPromiseHandlers }>) => {
            const { promiseHandlers } = action.payload;
            state.authPromiseHandlers = promiseHandlers;
        },

        closeAuthorization: (state, action: PayloadAction<{ wasSuccessful?: boolean; errorMessage?: string } | undefined>) => {
            const { wasSuccessful = false, errorMessage = "User canceled authorization" } = action.payload || {};

            if (!wasSuccessful && state.authPromiseHandlers) {
                state.authPromiseHandlers = {
                    ...state.authPromiseHandlers,
                    shouldReject: true,
                    errorMessage
                };
            } else {
                state.authPromiseHandlers = null;
            }
        },
    }
});

export const {
    setAuthPromiseHandlers,
    resolveAuthorization,
    rejectAuthorization,
    clearAuthPromiseHandlers,
    startAuthorization,
    closeAuthorization,
} = paymentAuthorizationSlice.actions;

export default paymentAuthorizationSlice.reducer;
/* END GENAI */
