/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI@CLAUDE */
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "@/features/layout/components/Modal/Modal";
import { Button, Typography, Input, InputContainer, InputMessage, Radio, SectionMessage, SectionMessageContent } from "@visa/nova-react";
import {
    REGISTER_FLOW_STEPS,
    setRegisterFlowStep,
    setSelectedOption,
    setCode,
    setRegisterModalError,
    triggerPopup,
    completeWithError
} from "@/features/passkey/slices/passkeySlice";
import styles from "./RegisterModal.module.css";
import type { RootState, AppDispatch } from '@/store';
/* END GENAI@CLAUDE */

// Screen states to manage UI independently from flow steps
const SCREEN_STATES = {
    STEP_UP_OPTIONS: 'step_up_options',
    CHALLENGE: 'challenge',
    CREATE_PASSKEY: 'create_passkey'
} as const;

type ScreenState = typeof SCREEN_STATES[keyof typeof SCREEN_STATES];

const SCREEN_MAP: Record<string, ScreenState> = {
    [REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS]: SCREEN_STATES.STEP_UP_OPTIONS,
    [REGISTER_FLOW_STEPS.CHALLENGE_CREATED]: SCREEN_STATES.CHALLENGE,
    [REGISTER_FLOW_STEPS.CREATE_PASSKEY]: SCREEN_STATES.CREATE_PASSKEY
};

const RegisterModal: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { registerFlowStep, stepUpOptions, selectedOption, code, registerModalError } = useSelector((state: RootState) => state.passkey);
    const [currentScreen, setCurrentScreen] = useState<ScreenState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleScreenChange = (screen: ScreenState) => {
        if (currentScreen === screen) return;
        setCurrentScreen(screen);
        dispatch(setRegisterModalError(null));
    };

    // Listen for specific flow steps to update the screen state
    useEffect(() => {
        if (!registerFlowStep || !SCREEN_MAP[registerFlowStep]) return;
        switch (registerFlowStep) {
            case REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS:
                dispatch(setSelectedOption(null));
                break;
            case REGISTER_FLOW_STEPS.CHALLENGE_CREATED:
                dispatch(setCode(null));
                break;
        }
        setIsLoading(false);
        handleScreenChange(SCREEN_MAP[registerFlowStep]);
    }, [registerFlowStep, dispatch]);

    const handleClose = () => {
        dispatch(completeWithError("Passkey setup cancelled."));
    };

    const createChallenge = () => {
        if (!selectedOption) return;
        setIsLoading(true);
        dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.CREATE_CHALLENGE));
    }

    const solveChallenge = () => {
        if (!code || code.trim() === "") return;
        setIsLoading(true);
        dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SOLVE_CHALLENGE));
    };

    const createPasskey = () => {
        dispatch(setRegisterModalError(null));
        dispatch(triggerPopup());
    };

    const getMethodDisplayName = (method: string): string => {
        const methodMap: Record<string, string> = {
            OTPEMAIL: "Email OTP",
            OTPSMS: "SMS OTP",
            OTPONLINEBANKING: "Online Banking OTP",
            "APP-TO-APP": "Banking App",
            CUSTOMERSERVICE: "Customer Service",
            OUTBOUNDCALL: "Phone Call"
        };
        return methodMap[method] || method;
    };

    const renderStepUpOptionsScreen = () => (
        <>
            {/* START GENAI@CLAUDE */}
            <Typography variant="headline-3" tag="h2" className={styles.heading}>
                Additional Verification Required
            </Typography>
            <Typography variant="body-2" className={styles.modalMessage}>
                Select a verification method to continue
            </Typography>
            <div className={styles.stepUpOptions}>
                {stepUpOptions?.map((option: any, index: number) => (
                    <label key={index} className={styles.stepUpOptionRadio}>
                        <Radio
                            name="stepUpOption"
                            value={option.identifier}
                            checked={selectedOption && option.identifier === selectedOption.identifier}
                            onChange={() => dispatch(setSelectedOption(option))}
                            disabled={isLoading}
                        />
                        <div className={styles.stepUpOptionContent}>
                            <Typography variant="body-2" className={styles.stepUpOptionMethod}>
                                {getMethodDisplayName(option.method)}
                            </Typography>
                            <Typography variant="body-2" className={styles.stepUpOptionValue}>
                                {option.value}
                            </Typography>
                        </div>
                    </label>
                ))}
            </div>
            <div className={styles.registerActions}>
                <Button
                    className={styles.registerSubmitBtn}
                    onClick={createChallenge}
                    disabled={!selectedOption || isLoading}
                >
                    <Typography variant="body-2">{isLoading ? "Processing..." : "Continue"}</Typography>
                </Button>
            </div>
            {/* END GENAI@CLAUDE */}
        </>
    );

    const renderChallengeScreen = () => {
        // Check if the selected method requires a code input
        const requiresCodeInput = selectedOption?.method === "OTPEMAIL" ||
                                 selectedOption?.method === "OTPSMS" ||
                                 selectedOption?.method === "OTPONLINEBANKING";

        return (
            <>
                {/* START GENAI@CLAUDE */}
                <Typography variant="headline-3" tag="h2" className={styles.heading}>
                    Enter Verification Code
                </Typography>
                <Typography variant="body-2" className={styles.modalMessage}>
                    {selectedOption?.method === "OTPEMAIL" &&
                    `A verification code has been sent to ${selectedOption.value}.`}
                    {selectedOption?.method === "OTPSMS" &&
                    `A verification code has been sent to ${selectedOption.value}.`}
                    {selectedOption?.method === "OTPONLINEBANKING" &&
                    `Please check your card issuer's online banking portal for the verification code.`}
                    {selectedOption?.method === "CUSTOMERSERVICE" &&
                    `Contact customer service at ${selectedOption.value} to complete the verification process. Once complete, please restart the passkey setup process.`}
                    {selectedOption?.method === "APP-TO-APP" &&
                    `Please check your banking app to complete the verification process. Once complete, please restart the passkey setup process.`}
                    {selectedOption?.method === "OUTBOUNDCALL" &&
                    `You'll receive a call at ${selectedOption.value} to complete the verification process. Once complete, please restart the passkey setup process.`}
                </Typography>

                {requiresCodeInput ? (
                    <>
                        <div className={styles.codeInputContainer}>
                            <Typography variant="label" tag="label" htmlFor="verification-code">
                                Verification Code
                            </Typography>
                            <InputContainer>
                                <Input
                                    type="text"
                                    id="verification-code"
                                    placeholder="Enter verification code"
                                    value={code ?? ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setCode(e.target.value))}
                                    disabled={isLoading}
                                    aria-describedby="verification-code-message"
                                />
                            </InputContainer>
                            <InputMessage id="verification-code-message">
                                Enter the code sent to you
                            </InputMessage>
                        </div>

                        <div className={styles.registerActions}>
                            <Button
                                className={styles.registerSubmitBtn}
                                onClick={solveChallenge}
                                disabled={!code || isLoading}
                            >
                                <Typography variant="body-2">Verify</Typography>
                            </Button>
                            <div className={styles.registerSecondaryActions}>
                                <Button
                                    className={styles.registerLinkBtn}
                                    onClick={createChallenge}
                                    disabled={isLoading}
                                >
                                    <Typography variant="body-2">Resend code</Typography>
                                </Button>
                                <Button
                                    className={styles.registerLinkBtn}
                                    onClick={() => dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS))}
                                    disabled={isLoading}
                                >
                                    <Typography variant="body-2">Use different method</Typography>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className={styles.registerActions}>
                        <Button
                            className={styles.registerLinkBtn}
                            onClick={() => dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS))}
                            disabled={isLoading}
                        >
                            <Typography variant="body-2">Use different method</Typography>
                        </Button>
                    </div>
                )}
                {/* END GENAI@CLAUDE */}
            </>
        );
    };

    const renderCreatePasskeyScreen = () => (
        <>
            {/* START GENAI@CLAUDE */}
            <Typography variant="headline-3" tag="h2" className={styles.heading}>
                Create Your Passkey
            </Typography>
            <Typography variant="body-2" className={styles.modalMessage}>
                A passkey provides an easy and secure way to authenticate without using passwords.
            </Typography>
            <div className={styles.registerActions}>
                <Button
                    className={styles.registerSubmitBtn}
                    onClick={createPasskey}
                    disabled={isLoading}
                >
                    <Typography variant="body-2">{isLoading ? "Processing..." : "Create Passkey"}</Typography>
                </Button>
            </div>
            {/* END GENAI@CLAUDE */}
        </>
    );

    const renderContent = () => {
        switch (currentScreen) {
            case SCREEN_STATES.STEP_UP_OPTIONS:
                return renderStepUpOptionsScreen();
            case SCREEN_STATES.CHALLENGE:
                return renderChallengeScreen();
            case SCREEN_STATES.CREATE_PASSKEY:
                return renderCreatePasskeyScreen();
        }
    };
    
    return (
        <Modal onClose={handleClose} closeOnOverlayClick={false}>
            <div className={styles.registerModal}>
                {renderContent()}
            </div>
            {/* START GENAI@CLAUDE */}
            {registerModalError && (
                <SectionMessage messageType="error" className={styles.errorMessage}>
                    <SectionMessageContent>
                        <Typography variant="body-2">{registerModalError}</Typography>
                    </SectionMessageContent>
                </SectionMessage>
            )}
            {/* END GENAI@CLAUDE */}
        </Modal>
    );
};

export default RegisterModal;
