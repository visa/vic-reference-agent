/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PASSKEY_FLOW_TYPES, EVENTS, setRegisterModalError, completeWithError, completeWithSuccess } from '@/features/passkey/slices/passkeySlice';
import { PASSKEY_URL } from '@/config/config';
import { createAuthenticateMessage } from '@/utils/passkeyUtils';
import type { RootState, AppDispatch } from '@/store';

// Global popup reference to maintain across renders
let popupInstance: Window | null = null;

const PopupManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { flowType, popupTrigger } = useSelector((state: RootState) => state.passkey);
    const authContext = useSelector((state: RootState) => state.passkey.authContext);
    const popupCheckIntervalRef = useRef<number | null>(null);
    
    const focusOrOpenPopup = () => {
        const width = 560;
        const height = 600;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        const features = `width=${width},height=${height},top=${top},left=${left},toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=no`;
        
        // If popup exists and is not closed, focus it
        if (popupInstance && !popupInstance.closed) {
            popupInstance.focus();
            return;
        }
        
        // Try to open a new popup
        popupInstance = window.open(PASSKEY_URL, "VPP_POPUP", features);
        
        // Check if popup was blocked
        if (!popupInstance || popupInstance.closed || typeof popupInstance.closed === 'undefined') {
            const errorMessage = "The passkey popup failed to open. Please make sure that popups are enabled.";
            switch (flowType) {
                // This error is fatal for authentication flows
                case PASSKEY_FLOW_TYPES.AUTHENTICATE:
                    dispatch(completeWithError(errorMessage));
                    break;
                // For registration flows, show the error in register modal
                // User can then retry opening the popup
                case PASSKEY_FLOW_TYPES.REGISTER:
                    dispatch(setRegisterModalError(errorMessage));
                    break;
            }
            return;
        }
        if (flowType === PASSKEY_FLOW_TYPES.AUTHENTICATE) {
            // If the popup is closed in the AUTHENTICATE flow, treat as a fatal error
            popupCheckIntervalRef.current = window.setInterval(() => {
                if (popupInstance && popupInstance.closed) {
                    dispatch(completeWithError("Authentication failed because popup was closed."));
                    if (popupCheckIntervalRef.current) {
                        clearInterval(popupCheckIntervalRef.current);
                    }
                }
            }, 500);
        }
    };

    /**
     * Sends a message to the VPP popup using postMessage API
     * Security: Uses explicit targetOrigin from PASSKEY_URL to prevent privacy violations
     * and ensure messages are only sent to the trusted VPP domain (sbx.vts.auth.visa.com)
     * @param message - The message object to send to the popup
     */
    const sendPopupCommand = (message: any) => {
        if (!popupInstance || popupInstance.closed) {
            return;
        }
        const targetOrigin = new URL(PASSKEY_URL).origin;
        popupInstance.postMessage(message, targetOrigin);
    };

    const handlePopupEvent = async (event: MessageEvent) => {
        const { source, data } = event;
        // Validate source window
        if (source !== popupInstance) {
            return;
        }
        // Validate origin to prevent privacy violations and ensure messages come from trusted VPP domain
        const expectedOrigin = new URL(PASSKEY_URL).origin;
        if (event.origin !== expectedOrigin) {
            console.warn('Ignoring message from untrusted origin:', event.origin);
            return;
        }
        switch (data.type) {
            case EVENTS.AUTH_READY:
                // Note: createAuthenticateMessage expects 3 params, keeping original functionality
                const message = createAuthenticateMessage(data, authContext, dispatch);
                sendPopupCommand(message);
                break;
            case EVENTS.AUTH_COMPLETE:
                dispatch(completeWithSuccess(data.assuranceData));
                if (popupCheckIntervalRef.current) {
                    clearInterval(popupCheckIntervalRef.current);
                    popupCheckIntervalRef.current = null;
                }
                break;
            case EVENTS.AUTH_NOT_SUPPORTED:
                dispatch(completeWithError("Authentication not supported."));
                break;
            case EVENTS.AUTH_FAILED:
                dispatch(completeWithError("Authentication failed."));
                break;
            case EVENTS.AUTH_CANCELLED:
                dispatch(completeWithError("Authentication was cancelled."));
                break;
            case EVENTS.AUTH_NOT_PERFORMED:
                dispatch(completeWithError("Authentication was not performed."));
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('message', handlePopupEvent);
        return () => {
            window.removeEventListener('message', handlePopupEvent);
        };
    }, []);
    
    useEffect(() => {
        if (flowType === PASSKEY_FLOW_TYPES.AUTHENTICATE) {
            focusOrOpenPopup();
        }
        return () => {
            if (popupCheckIntervalRef.current) {
                clearInterval(popupCheckIntervalRef.current);
            }
            if (popupInstance && !popupInstance.closed) {
                popupInstance.close();
                popupInstance = null;
            }
        };
    }, [flowType]);
    
    // Respond to popup triggers from register modal
    useEffect(() => {
        if (popupTrigger > 0) {
            focusOrOpenPopup();
        }
    }, [popupTrigger]);

    return null;
};

export default PopupManager;
