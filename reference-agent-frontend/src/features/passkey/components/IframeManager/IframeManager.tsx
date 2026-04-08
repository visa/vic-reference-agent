/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EVENTS, setAuthSessionData, completeWithError, setAuthSessionCreated } from '@/features/passkey/slices/passkeySlice';
import { createAuthSessionMessage } from '@/utils';
import { PASSKEY_URL } from '@/config/config';
import type { AppDispatch } from '@/store';
import { selectCurrentClientReferenceId } from '@/features/passkey/selectors/passkeySelectors';

const IframeManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const authReadyReceivedRef = useRef<boolean>(false);
    const clientReferenceId = useSelector(selectCurrentClientReferenceId);

    /**
     * Sends a message to the VPP iframe using postMessage API
     * Security: Uses explicit targetOrigin from PASSKEY_URL to prevent privacy violations
     * and ensure messages are only sent to the trusted VPP domain (sbx.vts.auth.visa.com)
     * @param message - The message object to send to the iframe
     */
    const sendIframeCommand = (message: any) => {
        if (!iframeRef?.current?.contentWindow) {
            return;
        }
        const targetOrigin = new URL(PASSKEY_URL).origin;
        iframeRef.current.contentWindow.postMessage(message, targetOrigin);
    };

    const handleIframeEvent = async (event: MessageEvent) => {
        const { source, data } = event;
        // Validate source window
        if (source !== iframeRef?.current?.contentWindow) {
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
                authReadyReceivedRef.current = true;
                const message = createAuthSessionMessage(data, dispatch, clientReferenceId);
                sendIframeCommand(message);
                break;
            case EVENTS.AUTH_SESSION_CREATED:
                dispatch(setAuthSessionData({
                    sessionContext: data.sessionContext,
                    browserData: data.browserData
                }));
                dispatch(setAuthSessionCreated(true));
                break;
            case EVENTS.AUTH_NOT_SUPPORTED:
                dispatch(completeWithError("Authentication not supported."));
                break;
        }
    };

    useEffect(() => {
        window.addEventListener('message', handleIframeEvent);

        // Set timeout to check if AUTH_READY was received
        // If not, assume iframe failed to load/respond
        const timeoutId = setTimeout(() => {
            if (!authReadyReceivedRef.current) {
                dispatch(completeWithError("Failed to connect to authentication iframe."));
            }
        }, 10000);

        return () => {
            window.removeEventListener('message', handleIframeEvent);
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <iframe
            ref={iframeRef}
            src={PASSKEY_URL}
            style={{ display: 'none' }}
            title="Visa Passkey Authentication"
            allow="publickey-credentials-get *; publickey-credentials-create *"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
    );
};

export default IframeManager;
