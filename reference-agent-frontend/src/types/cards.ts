/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { VDPLog } from "@/types";
import { VICDeviceData } from "@/utils/deviceUtils";
//CARDS
export interface Card {
    cardId: string;
    expMonth: number;
    expYear: number;
    last4: string;
    status: string;
    tokenId: string;
}

export interface CardWithArt extends Card {
    cardArtUrl?: string | null;
}

export interface AddCardFormData { 
    cardNumber: string; // Full card number, e.g. "4111111111111111"
    expMonth: string; // MM format, e.g. "12"
    expYear: string; // YYYY format, e.g. "2025"
    cvv: string; // 3 or 4 digit CVV code
    nameOnCard: string; // Name as it appears on the card
}

export interface AddCardRequest { 
    encPaymentInstrument: string; // Encrypted payment instrument data
}

export interface EnrollTokenRequest {
    assuranceData: {
        fidoAssertionData: {
            code: string; // Base64-encoded FIDO assertion
        }
        identifier: string;
    }
    clientDeviceId: string;
    id: string;
    ip: string;
    provisionedTokenId: string;
    userAgent: string;
    deviceInfo?: VICDeviceData;
}

export interface ProvisionTokenRequest { 
    cardId: string;
}

export interface AddCardData {
    cardId: string;
    logs: VDPLog[];
}

export interface DeleteCardData { 
    logs: VDPLog[];
}

export interface EnrollTokenData { 
    logs: VDPLog[];
}

export interface ProvisionTokenData { 
    cardId: string;
    expMonth: number;
    expYear: number;
    last4: string;
    status: string;
    tokenId: string;
    passkeyUrl?: string | null;
}

export interface InitialCardState { 
    cards: Card[];
    isLoadingCards: boolean;
    cardsError: string | null;
}

export type PublicKeyResponse = string; // Raw PEM string