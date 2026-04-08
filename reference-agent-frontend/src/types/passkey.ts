/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { VDPLog } from "@/types";
export interface PasskeyState {
    // Top-level state (outside PasskeyManager)
    showPasskeyManager: boolean;
    passkeyError: string | null;
    
    // Provided parameters
    clientReferenceId: string | null;
    provisionedTokenId: string | null;
    expYear: string | null;
    expMonth: string | null;
    amount: number | null;
    currencyCode: string | null;
    prompt: string | null;

    // Initialization data
    sessionContext: any | null;
    browserData: any | null;
    
    // Flow tracking
    authSessionCreated: boolean;
    flowType: string | null;
    registerFlowStep: string | null;

    // Register flow state
    stepUpOptions: any[];
    selectedOption: any | null;
    code: string | null;
    registerModalError: string | null;
    
    // Authentication context
    authContext: any | null;

    // Popup state
    popupTrigger: number;

    // Success result
    assuranceData: any | null;
}

//PASSKEY
export interface AuthenticationContext {
    action: "REGISTER" | "AUTHENTICATE";
    identifier: string;
    platformType: string;
    authenticationPreferencesEnabled: {
        responseMode: string;
        responseType: string;
    };
}

export interface RegisterAuthenticationContext extends AuthenticationContext {
    endpoint: string;
    payload: string;
}

export interface PasskeyAuthenticatePayload {
    clientReferenceId: string;
    amount: string | null;
    currencyCode: string;
    prompt: string | null;
    provisionedTokenId: string;
    browserData: { [key: string]: any };
    sessionContext: { secureToken: string };
}

export interface PasskeyRegisterPayload {
    clientReferenceId: string;
    provisionedTokenId: string;
    browserData: { [key: string]: any };
    sessionContext: { secureToken: string };
}

export interface PasskeyDeviceBindingPayload {
    clientReferenceId: string;
    provisionedTokenId: string;
    expMonth: number;
    expYear: number;
    browserData: { [key: string]: any };
    sessionContext: { secureToken: string };
}

export interface PasskeyChallengePayload {
    clientReferenceId: string;
    identifier: string;
    provisionedTokenId: string;
}

export interface PasskeyChallengeSolutionPayload {
    clientReferenceId: string;
    code: string;
    provisionedTokenId: string;
}

export interface PasskeyChallengeSolutionData {
    logs: VDPLog[];
}

export interface PasskeyConfigData { 
    passkeyWaiverEnabled: boolean;
}

export interface StepUpMethod {
    method: "OTPSMS" | "OTPEMAIL" | "CUSTOMERSERVICE" | "APP-TO-APP" | string;
    value: string;
    identifier: string;
    source?: string;
    requestPayload?: string;
    platformType?: string;
    subMethod?: string;
}

export interface PasskeyDeviceBindingData {
    stepUpRequest: StepUpMethod[];
    status: "CHALLENGE" | string;
    logs: VDPLog[];
}

export interface PasskeyAuthenticateData {
    authenticationContext: AuthenticationContext;
    logs: VDPLog[];
}

export interface PasskeyRegisterData {
    authenticationContext: RegisterAuthenticationContext;
    logs: VDPLog[];
}

export interface AuthSessionMessage { 
    type: string;
    requestID: string;
    version: string;
    client: {
        id: string;
    };  
}

export interface AuthenticateMessage {
    type: string;
    requestID: string;
    version: string;
    authenticationContext: AuthenticationContext;
}

export type ReferenceMap = Record<string, string>;


// Session info from iframe messages
export interface SessionInfo {
    browserData: any;
    sessionContext: any;
    dfpSessionID: string;
    requestID: string;
    authenticationPreferencesSupported?: any;
}

// Response from attestation API calls
export interface AttestationResponse {
    action: "REGISTER" | "AUTHENTICATE";
    authenticationContext?: AuthenticationContext;
}

// Device binding API response
export interface DeviceBindingResponse {
    data?: {
        status: "CHALLENGE" | string;
        stepUpRequest?: StepUpMethod[];
    };
}

// Messages sent to parent window/opener
export interface ParentMessage {
    type: "PASSKEY_AUTH_COMPLETE" | "PASSKEY_AUTH_ERROR" | "PASSKEY_APP_READY";
    status: "success" | "error" | "ready";
    assuranceData?: any;
    consumerId?: string;
    tokenId?: string;
    timestamp: string;
    error?: {
        message: string;
        code: string;
        details?: any;
    };
    message?: string;
}

// Messages received from VPP iframe
export interface IframeMessage {
    type: "AUTH_READY" | "AUTH_SESSION_CREATED" | "AUTH_COMPLETE" | "AUTH_FAILED" | "AUTH_NOT_PERFORMED" | "AUTH_CANCELLED";
    requestID?: string;
    browserData?: any;
    sessionContext?: any;
    dfpSessionID?: string;
    authenticationPreferencesSupported?: any;
    assuranceData?: any;
    error?: {
        message: string;
    };
}

// Union type for auth context messages
export type AuthContextMessage = AuthSessionMessage | AuthenticateMessage;
