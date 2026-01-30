/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { PasskeyState } from '@/types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const PASSKEY_FLOW_TYPES = {
  REGISTER: 'register',
  AUTHENTICATE: 'authenticate'
};

export const REGISTER_FLOW_STEPS = {
  REQUEST_DEVICE_BINDING: 'request_device_binding',
  SHOW_STEP_UP_OPTIONS: 'show_step_up_options',
  CREATE_CHALLENGE: 'create_challenge',
  CHALLENGE_CREATED: 'challenge_created',
  SOLVE_CHALLENGE: 'solve_challenge',
  REGISTER: 'register',
  CREATE_PASSKEY: 'create_passkey'
};

// Commands are outbound messages to the iframe or popup
export const COMMANDS = {
  CREATE_AUTH_SESSION: 'CREATE_AUTH_SESSION',
  AUTHENTICATE: 'AUTHENTICATE',
  CLOSE_AUTH_SESSION: 'CLOSE_AUTH_SESSION'
}

// Events are inbound messages from the iframe or popup
export const EVENTS = {
  // Success messages
  AUTH_READY: 'AUTH_READY',
  AUTH_SESSION_CREATED: 'AUTH_SESSION_CREATED',
  AUTH_COMPLETE: 'AUTH_COMPLETE',
  AUTH_SESSION_CLOSED: 'AUTH_SESSION_CLOSED',
  // Failure messages
  AUTH_NOT_SUPPORTED: 'AUTH_NOT_SUPPORTED',
  AUTH_NOT_PERFORMED: 'AUTH_NOT_PERFORMED',
  AUTH_CANCELLED: 'AUTH_CANCELLED',
  AUTH_FAILED: 'AUTH_FAILED'
};

const initialState: PasskeyState = {
  // Top-level state (outside PasskeyManager)
  showPasskeyManager: false,
  passkeyError: null,
  
  // Provided parameters
  clientReferenceId: null,
  provisionedTokenId: null,
  expYear: null,
  expMonth: null,
  amount: 0.0,
  currencyCode: "840",
  prompt: null,

  // Initialization data
  sessionContext: null,
  browserData: null,
  
  // Flow tracking
  authSessionCreated: false,
  flowType: null,
  registerFlowStep: null,

  // Register flow state
  stepUpOptions: [],
  selectedOption: null,
  code: null,
  registerModalError: null,
  
  // Authentication context
  authContext: null,

  // Popup state
  popupTrigger: 0,

  // Success result
  assuranceData: null
};

const passkeySlice = createSlice({
  name: 'passkey',
  initialState,
  reducers: {
    initializePasskeyManager: (state, action: PayloadAction<{
      clientReferenceId: string | null;
      provisionedTokenId: string | null;
      expMonth: string | null;
      expYear: string | null;
      amount: number;
      currencyCode: string;
      prompt: string | null;
    }>) => {
      console.log("Initializing Passkey Manager with payload:", action.payload);
      const { clientReferenceId, provisionedTokenId, expMonth, expYear, amount, currencyCode, prompt } = action.payload;
      return {
        ...initialState,
        clientReferenceId: clientReferenceId,
        provisionedTokenId: provisionedTokenId,
        expMonth: expMonth,
        expYear: expYear,
        amount: amount,
        currencyCode: currencyCode,
        prompt: prompt,
        showPasskeyManager: true
      };
    },

    completeWithError: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        passkeyError: action.payload,
        showPasskeyManager: false
      };
    },

    setAuthSessionData: (state, action: PayloadAction<{
      sessionContext: any | null;
      browserData: any | null;
    }>) => {
      const { sessionContext, browserData } = action.payload;
      return {
        ...state, 
        sessionContext,
        browserData
      }
    },

    setAuthSessionCreated: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        authSessionCreated: action.payload
      };
    },

    setFlowType: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        flowType: action.payload
      };
    },

    setRegisterFlowStep: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        registerFlowStep: action.payload
      };
    },

    setStepUpOptions: (state, action: PayloadAction<any[]>) => {
      return {
        ...state,
        stepUpOptions: action.payload
      }
    },

    setSelectedOption: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        selectedOption: action.payload
      }
    },

    setCode: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        code: action.payload
      }
    },

    setRegisterModalError: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        registerModalError: action.payload
      }
    },

    setAuthContext: (state, action: PayloadAction<any | null>) => {
      return {
        ...state,
        authContext: action.payload
      }
    },

    triggerPopup: (state, action: PayloadAction<void>) => {
      return {
        ...state,
        popupTrigger: state.popupTrigger + 1
      };
    },

    completeWithSuccess: (state, action: PayloadAction<any | null>) => {
      return {
        ...state,
        assuranceData: action.payload,
        showPasskeyManager: false
      };
    },

    resetAndCompleteWithSuccess: (state, action: PayloadAction<any | null>) => {
      return {
        ...initialState,
        assuranceData: action.payload,
        showPasskeyManager: false
      };
    },

    clearTerminalData: (state, action: PayloadAction<void>) => {
      return {
        ...state,
        passkeyError: null,
        assuranceData: null
      };
    }
  }
});

export const {
  initializePasskeyManager,
  completeWithError,
  setAuthSessionData,
  setAuthSessionCreated,
  setFlowType,
  setRegisterFlowStep,
  setStepUpOptions,
  setSelectedOption,
  setCode,
  setRegisterModalError,
  setAuthContext,
  triggerPopup,
  completeWithSuccess,
  resetAndCompleteWithSuccess,
  clearTerminalData
} = passkeySlice.actions;

export default passkeySlice.reducer;
/* END GENAI */
