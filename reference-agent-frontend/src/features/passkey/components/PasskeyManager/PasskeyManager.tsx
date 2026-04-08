/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    Dialog,
    DialogContent,
    DialogCloseButton,
    Typography,
    ProgressCircular
} from '@visa/nova-react';
import { attestationOptionsAuthenticate } from '@/features/passkey/thunks/passkeyAuthenticationThunks';
import { attestationOptionsRegister } from '@/features/passkey/thunks/passkeyRegistrationThunks';
import {
    PASSKEY_FLOW_TYPES,
    REGISTER_FLOW_STEPS,
    setRegisterFlowStep,
    completeWithError,
    completeWithSuccess
} from '@/features/passkey/slices/passkeySlice';
import { deviceBinding, createChallenge, solveChallenge } from '@/features/passkey/thunks/passkeyRegistrationThunks';
import IframeManager from '../IframeManager/IframeManager';
import PopupManager from '../PopupManager/PopupManager';
import RegisterModal from '../RegisterModal/RegisterModal';
import styles from './PasskeyManager.module.css';
import type { RootState, AppDispatch } from '@/store';

const PasskeyManager: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { authSessionCreated, flowType, registerFlowStep } = useSelector((state: RootState) => state.passkey);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Once the auth session is created, begin the flow
    useEffect(() => {
        if (!authSessionCreated) return;
        const determineFlowType = async () => {
            await dispatch(attestationOptionsAuthenticate()).unwrap();
        }
        determineFlowType();
    }, [authSessionCreated, dispatch]);

    // Update loading state when modal or popup is shown
    useEffect(() => {
        if (showRegisterModal || showPopup) {
            setIsLoading(false);
        }
    }, [showRegisterModal, showPopup]);

    // Handle entry into each flow type
    useEffect(() => {
        switch (flowType) {
            case PASSKEY_FLOW_TYPES.AUTHENTICATE:
                setShowPopup(true);
                break;
            case PASSKEY_FLOW_TYPES.REGISTER:
                dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.REQUEST_DEVICE_BINDING));
                break;
        }
    }, [flowType, dispatch]);

    // Manage register flow
    useEffect(() => {
        const handleRegisterFlow = async () => {
            switch (registerFlowStep) {
                case REGISTER_FLOW_STEPS.REQUEST_DEVICE_BINDING:
                    await dispatch(deviceBinding()).unwrap();
                    break;
                case REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS:
                    setShowRegisterModal(true);
                    break;
                case REGISTER_FLOW_STEPS.CREATE_CHALLENGE:
                    await dispatch(createChallenge()).unwrap();
                    break;
                case REGISTER_FLOW_STEPS.SOLVE_CHALLENGE:
                    await dispatch(solveChallenge()).unwrap();
                    break;
                case REGISTER_FLOW_STEPS.REGISTER:
                    await dispatch(attestationOptionsRegister()).unwrap();
                    break;
                case REGISTER_FLOW_STEPS.CREATE_PASSKEY:
                    setShowRegisterModal(true);
                    setShowPopup(true);
                    break;
            }
        };
        handleRegisterFlow();
    }, [registerFlowStep, dispatch]);

    const handleLoadingClose = () => {
        dispatch(completeWithError("Passkey authentication cancelled by user."));
    };

    return (
        <>
            {isLoading && (
                <>
                    <div className={styles.modalOverlay} />
                    <Dialog open className={styles.dialog}>
                        <DialogContent>
                            <div className={styles.loadingContent}>
                                <ProgressCircular progressSize="large" indeterminate />
                                <Typography variant="headline-4" tag="h2" className={styles.loadingTitle}>
                                    Setting Up Passkey Authentication
                                </Typography>
                                <Typography variant="body-2" className={styles.loadingDescription}>
                                    Preparing secure authentication and connecting to passkey services...
                                </Typography>
                            </div>
                        </DialogContent>
                        <DialogCloseButton onClick={handleLoadingClose} />
                    </Dialog>
                </>
            )}
            <IframeManager />
            {showRegisterModal && <RegisterModal />}
            {showPopup && <PopupManager />}
        </>
    );
};

export default PasskeyManager;
