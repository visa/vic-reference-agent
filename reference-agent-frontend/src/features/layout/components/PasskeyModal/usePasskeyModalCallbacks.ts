/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { closeModal } from '@/features/layout/slices/modalSlice';
import { handlePasskeyClose, processPasskeyCompletion } from '@/features/chat/thunks/chatThunks';
import { useDispatch, useSelector } from 'react-redux';
import { handlePasskeyProcessComplete } from '@/features/cards/thunks/enrollmentThunks';
import { clearEnrollingCardId } from '@/features/cards/slices/cardsSlice';
import { PASSKEY_FLOW_TYPES } from '@/features/passkey/slices/passkeySlice';
import { initializePasskeyManager } from '@/features/passkey/slices/passkeySlice';
import { getClientReferenceId } from '@/utils/passkeyUtils';
import { convertToNumericCurrencyCode } from '@/utils/currencyUtils';
import type { RootState, AppDispatch } from '@/store';
import type {
    PasskeyResult
} from '@/types';

interface PasskeyModalCallbacks {
    onClose: () => void;
    onProcessComplete: (payload: PasskeyResult) => Promise<void>;
}

export const usePasskeyModalCallbacks = (): PasskeyModalCallbacks => {
    let onClose, onProcessComplete;
    const dispatch = useDispatch<AppDispatch>();
    const passkeyFlowType = useSelector((state: RootState) => state.passkey.flowType);
    const modalProps = useSelector((state: RootState) => state.modal.modalProps);
    const {
        origin,
        cardId,
        provisionedTokenId,
        expMonth,
        expYear,
        amount,
        currencyCode,
        prompt
    } = modalProps;
    
    // CASE: assertion data required & successful passkey flow & flowType = REGISTER
    // Restart the passkey flow since passkey was just created and can now generate assertion data
    const shouldRestartPasskeyFlow = (): boolean => {
        return passkeyFlowType === PASSKEY_FLOW_TYPES.REGISTER;
    };

    const restartPasskeyFlow = () => {
        // Get currency code from modal props and convert to numeric format
        const numericCurrencyCode = convertToNumericCurrencyCode(currencyCode);

        dispatch(initializePasskeyManager({
            clientReferenceId: getClientReferenceId(cardId),
            provisionedTokenId: provisionedTokenId,
            expMonth: expMonth,
            expYear: expYear,
            amount: Number(amount) || 0,
            currencyCode: numericCurrencyCode,
            prompt: prompt || "Payment Authorization"
        }));
    };

    switch (origin) {
        case 'handleVerify':
            onClose = () => {
                console.log("Closed by user.");
                dispatch(closeModal());
                dispatch(handlePasskeyClose({ wasSuccessful: false }));
            };
            onProcessComplete = async (payload: PasskeyResult) => {
                if (shouldRestartPasskeyFlow()) {
                    restartPasskeyFlow();
                    return;
                }
                dispatch(closeModal());
                await dispatch(processPasskeyCompletion({
                    payload
                }));
                console.log("Process complete:", payload);
            };
            break;
        case 'enrollToken':
            onClose = () => {
                console.log("Token enrollment closed by user.");
                dispatch(closeModal());
                dispatch(clearEnrollingCardId());
            };
            onProcessComplete = async (payload: PasskeyResult) => {
                dispatch(closeModal());
                try {
                    await dispatch(handlePasskeyProcessComplete(payload));
                    console.log("Token enrollment process complete:", payload);
                } catch (error) {
                    console.error('Failed to complete token enrollment:', error);
                    dispatch(clearEnrollingCardId());
                }
            };
            break;       
        default:
            // Handle default case
            break;
    }
    if (!onClose || !onProcessComplete) {
        console.error("onClose or onProcessComplete callback is not defined.");
        throw new Error("Callbacks are required but missing.");
    }
    return { onClose, onProcessComplete };
}
