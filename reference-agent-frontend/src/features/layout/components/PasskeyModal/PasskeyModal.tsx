/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { getClientDeviceId } from "@/utils/deviceUtils";
import { getClientReferenceId, clearClientReferenceId } from "@/utils/passkeyUtils";
import { usePasskeyModalCallbacks } from "./usePasskeyModalCallbacks";
import { convertToNumericCurrencyCode } from "@/utils/currencyUtils";
import { clearTerminalData, completeWithError, initializePasskeyManager, PASSKEY_FLOW_TYPES, resetAndCompleteWithSuccess } from "@/features/passkey/slices/passkeySlice";
import type { AppDispatch, RootState } from "@/store";
import type { PasskeyResult } from "@/types";

interface ModalProps {
  origin: string;
  cardId: string;
  provisionedTokenId: string;
  expMonth: number;
  expYear: number;
  amount: string;
  currencyCode: string;
  prompt?: string;
  clientDeviceId?: string;
  ip?: string;
  userAgent?: string;
}

const PasskeyModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const modalProps = useSelector((state: RootState) => state.modal.modalProps) as ModalProps;
  const {
    cardId,
    provisionedTokenId,
    expMonth,
    expYear,
    amount,
    currencyCode,
    prompt,
    clientDeviceId = getClientDeviceId(),
    ip = '10.128.1.2',
    userAgent = navigator.userAgent,
  } = modalProps;

  const clientReferenceId = getClientReferenceId(cardId);
  const { onClose, onProcessComplete } = usePasskeyModalCallbacks();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Convert currency code from alphabetic to numeric format
        const numericCurrencyCode = convertToNumericCurrencyCode(currencyCode);

        dispatch(initializePasskeyManager({
          clientReferenceId: clientReferenceId,
          provisionedTokenId: provisionedTokenId,
          expMonth: expMonth.toString(),
          expYear: expYear.toString(),
          amount: Number(amount) || 0,
          currencyCode: numericCurrencyCode,
          prompt: prompt || null
        }));
      } catch (error) {
        console.error("Error initializing PasskeyModal:", error);
        dispatch(completeWithError("Failed to initialize passkey process."));
      }
    };
    initialize();
  }, []);

  const { passkeyError, assuranceData, flowType } = useSelector((state: RootState) => state.passkey);
  useEffect(() => {
    if (passkeyError) {
      // Only clear the clientReferenceId on errors in AUTHENTICATE flow
      if (flowType === PASSKEY_FLOW_TYPES.AUTHENTICATE) {
        clearClientReferenceId(cardId);
      }
      onClose();
      dispatch(clearTerminalData());
    }
  }, [passkeyError]);

  useEffect(() => {
    if (assuranceData) {
      clearClientReferenceId(cardId);
      const payload: PasskeyResult = {
        id: clientReferenceId,
        provisioned_token_id: provisionedTokenId,
        assurance_data: {
          identifier: assuranceData.identifier,
          fido_assertion_data: {
            code: assuranceData.fidoBlob
          }
        },
        client_device_id: clientDeviceId,
        ip: ip,
        user_agent: userAgent,
      };
      if (onProcessComplete) { 
        onProcessComplete(payload);
      } else { 
        console.error("onProcessComplete callback is not provided.");
        throw new Error("onProcessComplete callback is missing.");
      }
      dispatch(clearTerminalData());
    }
  }, [assuranceData]);
  
  return (
    // Just render a hidden div
    <div style={{ display: "none" }} />
  );
};

export default PasskeyModal;
/* END GENAI */
