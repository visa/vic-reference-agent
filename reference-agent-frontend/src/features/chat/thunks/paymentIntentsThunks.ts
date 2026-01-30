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
    CreateAgenticIntentRequest,
    CreateIntentResult
} from '@/types';
import { RootState } from '@/store';
import ApiService from '../../../lib/api';

// RETURNS: Intent creation result with success/error state
export const createIntent = createAsyncThunk<CreateIntentResult, CreateAgenticIntentRequest, {state: RootState}>(
    'paymentIntents/createIntent',
    async (intentPayload, { dispatch, rejectWithValue }) => {
        try {
            console.log('Creating intent with payload:', intentPayload);
            
            const intentResponse = await ApiService.createIntent(intentPayload);
            console.log("Create intent API response:", intentResponse);
            
            const result = {
                success: intentResponse.status === "success",
                response: intentResponse,
                statusCode: intentResponse.statusCode
            };
            
            return result;
            
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An error occurred while creating intent.';
            console.error("Create intent API error:", error);
            
            const errorResult = {
                success: false,
                error: message,
                statusCode: null
            };
            
            return rejectWithValue(errorResult);
        }
    }
);
/* END GENAI */
