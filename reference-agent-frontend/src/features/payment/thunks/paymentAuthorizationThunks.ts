/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import {
    startAuthorization,
    closeAuthorization,
    clearAuthPromiseHandlers,
} from '@/features/payment/slices/paymentAuthorizationSlice';
import type {
    OrderSummary,
    Card,
    PaymentCompletionResult
} from '@/types';

export const startAuthorizationFlow = createAsyncThunk<void, void, { state: RootState }>(
    'paymentAuthorization/startAuthorizationFlow',
    async (_, { dispatch }) => {
        return new Promise<void>((resolve, reject) => {
            const promiseHandlers = { resolve, reject };
            dispatch(startAuthorization({
                promiseHandlers
            }));
        });
    }
);

// TRIGGER: User closes modal or cancels authorization
export const closeAuthorizationFlow = createAsyncThunk<{ wasSuccessful: boolean; errorMessage: string | undefined}, { wasSuccessful?: boolean; errorMessage?: string }, { state: RootState }>(
    'paymentAuthorization/closeAuthorizationFlow',
    async ({ wasSuccessful = false, errorMessage = "User canceled authorization" }, { dispatch, getState }) => {
        const state = getState();
        const { authPromiseHandlers } = state.paymentAuthorization;

        dispatch(closeAuthorization({ wasSuccessful, errorMessage }));

        if (!wasSuccessful && authPromiseHandlers) {
            if (authPromiseHandlers.reject) {
                authPromiseHandlers.reject(new Error(errorMessage));
            }
        }

        dispatch(clearAuthPromiseHandlers());

        return { wasSuccessful, errorMessage };
    }
);

export const resolveAuthorizationFlow = createAsyncThunk<PaymentCompletionResult['response'], PaymentCompletionResult['response'], { state: RootState }>(
    'paymentAuthorization/resolveAuthorizationFlow',
    async (result, { dispatch, getState }) => {
        const state = getState();
        const authPromiseHandlers = state.paymentAuthorization.authPromiseHandlers;

        if (!authPromiseHandlers) {
            throw new Error('No authorization promise handlers found');
        }

        if (authPromiseHandlers.resolve) {
            authPromiseHandlers.resolve(result);
        }

        dispatch(clearAuthPromiseHandlers());

        return result;
    }
);

// TRIGGER: Authorization errors or failures
export const rejectAuthorizationFlow = createAsyncThunk<{ error: string }, Error, {state: RootState}>(
    'paymentAuthorization/rejectAuthorizationFlow',
    async (error, { dispatch, getState }) => {
        const state = getState();
        const authPromiseHandlers = state.paymentAuthorization.authPromiseHandlers;

        if (authPromiseHandlers && authPromiseHandlers.reject) {
            authPromiseHandlers.reject(error);
        }

        dispatch(clearAuthPromiseHandlers());

        return { error: error.message };
    }
);
