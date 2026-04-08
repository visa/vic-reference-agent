/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../../lib/api';
import { openModal, closeModal } from '../../layout/slices/modalSlice';
import { setEnrollingCardId, clearEnrollingCardId } from '@/features/cards/slices/cardsSlice';
import { fetchCards } from '@/features/cards/thunks/cardsThunks';
import { EnrollTokenData, EnrollTokenRequest, Card, PasskeyResult } from '@/types';
import { RootState } from '@/store';
import { getDeviceInfo, mapDeviceInfoForVIC } from '@/utils';

export const enrollToken = createAsyncThunk<EnrollTokenData, EnrollTokenRequest, {state: RootState}>(
    'enrollment/enrollToken',
    async (enrollPayload, { dispatch, rejectWithValue }) => {
        try {
            const response = await ApiService.enrollToken(enrollPayload);

            await dispatch(fetchCards());

            dispatch(clearEnrollingCardId());
            return response;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An error occurred during token enrollment.';
            console.error("Enroll token API error:", message);
            dispatch(clearEnrollingCardId());
            return rejectWithValue(message);
        }
    }
);


export const handleSetUpPasskey = createAsyncThunk<void, Card, {state: RootState}>(
    'enrollment/handleSetUpPasskey',
    async (card, { dispatch }) => {
        dispatch(setEnrollingCardId(card.cardId));
        try {
            dispatch(openModal({
                modalType: 'passkeyModal',
                props: {
                    origin: 'enrollToken',
                    cardId: card.cardId,
                    provisionedTokenId: card.tokenId,
                    expMonth: card.expMonth,
                    expYear: card.expYear,
                    amount: '0',
                    currencyCode: 'USD'
                }
            }));
        } catch (error) {
            console.error("Error opening passkey modal:", error);
            dispatch(clearEnrollingCardId());
        }
    }
);

export const handlePasskeyProcessComplete = createAsyncThunk<void, PasskeyResult, {state: RootState}>(
    'enrollment/handlePasskeyProcessComplete',
    async (payload, { dispatch, rejectWithValue }) => {
        const deviceInfo = getDeviceInfo();
        const deviceData = mapDeviceInfoForVIC(deviceInfo);

        const enrollPayload: EnrollTokenRequest = {
            id: payload.id,
            provisionedTokenId: payload.provisioned_token_id,
            assuranceData: {
                fidoAssertionData: payload.assurance_data.fido_assertion_data,
                identifier: payload.assurance_data.identifier
            },
            clientDeviceId: payload.client_device_id,
            ip: payload.ip,
            userAgent: payload.user_agent,
            deviceInfo: deviceData
        };

        try {
            await dispatch(enrollToken(enrollPayload));
        } catch (error) {
            console.error("Error setting up passkey:", error);
        }
        window.dispatchEvent(new CustomEvent('cardsUpdated'));
    }
);
