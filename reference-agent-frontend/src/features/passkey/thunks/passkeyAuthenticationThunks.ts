/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    PASSKEY_FLOW_TYPES,
    setFlowType,
    setAuthContext,
    completeWithError
} from '@/features/passkey/slices/passkeySlice';
import ApiService from '@/lib/api';
import { 
    RootState
} from '@/store';

export const attestationOptionsAuthenticate = createAsyncThunk<void, void, {state: RootState}>(
    'passkey/attestationOptionsAuthenticate',
    async(_, { dispatch, getState }) => {
        try {
            const { clientReferenceId, sessionContext, browserData, provisionedTokenId, amount, currencyCode, prompt } = getState().passkey;
            
            //TYPE GUARDING
            if (!clientReferenceId) { 
                throw new Error("Missing clientReferenceId for passkey authentication.");
            }
            if (!provisionedTokenId) {
                throw new Error("Missing provisionedTokenId for passkey authentication.");
            }
            if (!sessionContext) {
                throw new Error("Missing sessionContext for passkey authentication.");
            }
            if (!browserData) {
                throw new Error("Missing browserData for passkey authentication.");
            }
            if (amount != null && isNaN(Number(amount))) {
                console.error("Invalid amount value:", amount);
                throw new Error("Amount must be a valid number or null.");
            }
            if (currencyCode != null && typeof currencyCode !== 'string') {
                console.error("Invalid currencyCode value:", currencyCode);
                throw new Error("currencyCode must be a string or null.");
            }
            if (prompt != null && typeof prompt !== 'string') {
                console.error("Invalid prompt value:", prompt);
                throw new Error("prompt must be a string or null.");
            }

            const payload = {
                clientReferenceId,
                sessionContext,
                browserData,
                provisionedTokenId,
                amount: String(amount),
                currencyCode: String(currencyCode),
                prompt
            }

            const response = await ApiService.attestationOptionsAuthenticate(payload);
            const action = response.authenticationContext.action; 
            switch (action) {
                case "AUTHENTICATE":
                    dispatch(setAuthContext(response.authenticationContext));
                    dispatch(setFlowType(PASSKEY_FLOW_TYPES.AUTHENTICATE));
                    break;
                case "REGISTER":
                    dispatch(setFlowType(PASSKEY_FLOW_TYPES.REGISTER));
                    break;
                default:
                    throw new Error(`Unsupported action type: ${action}`);
            }
        } catch (error) {
            console.error("Error getting attestation options for authentication:", error);
            dispatch(completeWithError("Failed to get attestation options."));
        }
    }
)
/* END GENAI */