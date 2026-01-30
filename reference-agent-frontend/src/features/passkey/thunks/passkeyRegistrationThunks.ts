/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
    REGISTER_FLOW_STEPS,
    setRegisterFlowStep,
    setStepUpOptions,
    setAuthContext,
    setRegisterModalError,
    completeWithError
} from '@/features/passkey/slices/passkeySlice';
import ApiService from '@/lib/api';
import {RootState} from '@/store';

export const deviceBinding = createAsyncThunk<void, void, {state: RootState}> (
    'passkey/deviceBinding',
    async (_, { dispatch, getState }) => {
        try {
            const state = getState();
            const { clientReferenceId, sessionContext, browserData, provisionedTokenId, expMonth, expYear } = state.passkey;
            //TYPE GUARDING
            if (!clientReferenceId || !provisionedTokenId || !sessionContext || !browserData) {
                throw new Error("Missing required fields for device binding.");
            }
            let parsedMonth = parseInt(expMonth || '');
            let parsedYear = parseInt(expYear || '');

            const payload = {
                clientReferenceId,
                sessionContext,
                browserData,
                provisionedTokenId,
                expMonth: parsedMonth,
                expYear: parsedYear
            };
            const response = await ApiService.deviceBinding(payload);
            switch (response.status) {
                case "APPROVED":
                    dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.REGISTER));
                    break;
                case "CHALLENGE":
                    dispatch(setStepUpOptions(response.stepUpRequest));
                    dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS));
                    break;
                default:
                    throw new Error(`Unsupported device binding status: ${response.status}`);
            }
        } catch (error) {
            console.error("Error in device binding:", error);
            dispatch(completeWithError("Device binding was declined."));
        }
    }
)

export const createChallenge = createAsyncThunk<void, void, {state: RootState}> (
    'passkey/createChallenge',
    async (_, { dispatch, getState }) => {
        try {
            const { clientReferenceId, provisionedTokenId, selectedOption } = getState().passkey;
            //TYPE GUARDING
            if (!clientReferenceId || !provisionedTokenId || !selectedOption) {
                throw new Error("Missing required fields for creating challenge.");
            }
            const payload = {
                clientReferenceId,
                provisionedTokenId,
                identifier: selectedOption.identifier
            };
            // NOTE: Response contains info like max attempts, expiry, etc.
            const response = await ApiService.createChallenge(payload);
            dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.CHALLENGE_CREATED));
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            const statusCode = (error as any).statusCode;
            console.error("Error creating challenge:", error);
            if (statusCode === 500) {
                dispatch(setRegisterModalError("Failed to create challenge."));
            } else {
                dispatch(setRegisterModalError(message));
            }
            dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS));
        }
    }
)

export const solveChallenge = createAsyncThunk<void, void, {state: RootState}>(
    'passkey/solveChallenge',
    async (_, { dispatch, getState }) => {
        try {
            const { clientReferenceId, provisionedTokenId, code } = getState().passkey;
            if (!clientReferenceId || !provisionedTokenId || !code) {
                throw new Error("Missing required fields for solving challenge.");
            }
            const payload = {
                clientReferenceId,
                provisionedTokenId,
                code
            };
            await ApiService.solveChallenge(payload);
            dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.REGISTER));
        } catch (error: unknown) {
            console.error("Error solving challenge:", error);
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            dispatch(setRegisterModalError(message));
            dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.CHALLENGE_CREATED));
        }
    }
)

export const attestationOptionsRegister = createAsyncThunk<void, void, { state: RootState }>(
    'passkey/attestationOptionsRegister',
    async(_, { dispatch, getState }) => {
        try {
            const { clientReferenceId, sessionContext, browserData, provisionedTokenId } = getState().passkey;
            if (!clientReferenceId || !provisionedTokenId || !sessionContext || !browserData) {
                throw new Error("Missing required fields for attestation options.");
            }
            const payload = {
                clientReferenceId,
                sessionContext,
                browserData,
                provisionedTokenId
            };
            const response = await ApiService.attestationOptionsRegister(payload);
            if (response.authenticationContext.action !== "REGISTER") {
                throw new Error(`Unsupported action type: ${response.authenticationContext.action}`);
            }
            dispatch(setAuthContext(response.authenticationContext));
            dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.CREATE_PASSKEY));
        }
        catch (error) {
            console.error("Error getting attestation options for registration:", error);
            dispatch(completeWithError("Failed to get attestation options."));
        }
    }
)
