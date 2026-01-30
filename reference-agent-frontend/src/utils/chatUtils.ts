/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
// === PAYMENT INTENTS THUNKS ===

import {CreateAgenticIntentRequest, PasskeyResult, OrderSummary, Product } from "@/types";
import { VICDeviceData } from "./deviceUtils";

// RETURNS: Formatted intent payload
export const buildIntentPayload = (payload: PasskeyResult, orderSummary: OrderSummary, acceptedProducts: Product[], deviceData: VICDeviceData): CreateAgenticIntentRequest => {
    const now = new Date();
    const verificationTimestamp = now.toISOString();
    const expirationTimestamp = new Date(now.getTime() + 10 * 60000).toISOString();
    
    const intentPayload = {
        id: payload.id,
        provisioned_token_id: payload.provisioned_token_id,
        intentId: crypto.randomUUID(),
        amount: orderSummary.overallAmount,
        currencyCode: "USD",
        products: acceptedProducts,
        assurance_data: {
            identifier: payload.assurance_data.identifier,
            fido_assertion_data: payload.assurance_data.fido_assertion_data
        },
        verificationTimestamp,
        expirationTimestamp,
        prompt:  orderSummary.merchantName || 'Party Depot Store',
        client_device_id: payload.client_device_id,
        ip: payload.ip,
        user_agent: payload.user_agent,
        deviceInfo: deviceData
    };
    return intentPayload;
};
/* END GENAI */