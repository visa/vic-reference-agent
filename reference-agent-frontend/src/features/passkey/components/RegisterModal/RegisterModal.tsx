/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    Dialog,
    DialogContent,
    DialogCloseButton,
    Button,
    Typography,
    Input,
    InputContainer,
    InputMessage,
    Label,
    Radio,
    RadioPanel,
    Utility,
    SectionMessage,
    SectionMessageContent,
    SectionMessageIcon,
    UtilityFragment,
} from "@visa/nova-react";
import { VisaChevronRightTiny } from "@visa/nova-icons-react";
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

    const handleCodeInputKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (!code || isLoading) return;
            solveChallenge();
        },
        [code, isLoading]
    );

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

    const renderError = () => registerModalError ? (
        <Utility vPaddingTop={16} className={styles.errorContainer}>
            <SectionMessage messageType="error" className={styles.errorMessage}>
                <SectionMessageIcon />
                <UtilityFragment vPaddingLeft={8} vPaddingBottom={2}>
                    <SectionMessageContent>
                        <Typography variant="body-2">{registerModalError}</Typography>
                    </SectionMessageContent>
                </UtilityFragment>
            </SectionMessage>
        </Utility>
    ) : null;

    const renderStepUpOptionsScreen = () => (
        <>
            <Typography variant="headline-3" tag="h2">
                Additional Verification Required
            </Typography>
            <Typography variant="body-2" className={styles.modalMessage}>
                Select a verification method to continue
            </Typography>
            {renderError()}
            <fieldset aria-labelledby="step-up-options-legend" className={styles.stepUpOptions}>
                <Utility vFlex vFlexCol vGap={8}>
                    {stepUpOptions?.map((option: any, index: number) => (
                        <RadioPanel
                            className="v-align-items-start"
                            htmlFor={`step-up-option-${index}`}
                            key={`step-up-option-${index}`}
                        >
                            <Utility vFlex vGap={2} style={{ inlineSize: '100%' }}>
                                <Radio
                                    className="v-flex-shrink-0"
                                    id={`step-up-option-${index}`}
                                    name="stepUpOption"
                                    checked={selectedOption && option.identifier === selectedOption.identifier}
                                    onChange={() => dispatch(setSelectedOption(option))}
                                    disabled={isLoading}
                                />
                                <Utility vFlex vFlexCol vGap={2} vMarginVertical={6}>
                                    <Typography variant="body-2" className={styles.stepUpOptionMethod}>
                                        {getMethodDisplayName(option.method)}
                                    </Typography>
                                    <InputMessage id={`step-up-option-${index}-message`}>
                                        {option.value}
                                    </InputMessage>
                                </Utility>
                            </Utility>
                        </RadioPanel>
                    ))}
                </Utility>
            </fieldset>
            <Utility vFlex vAlignItems="center" vGap={12} vPaddingTop={16}>
                <Button
                    onClick={createChallenge}
                    disabled={!selectedOption || isLoading}
                >
                    {isLoading ? "Processing..." : "Continue"}
                </Button>
                <Button
                    colorScheme="secondary"
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </Utility>
        </>
    );

    const renderChallengeScreen = () => {
        const requiresCodeInput = selectedOption?.method === "OTPEMAIL" ||
                                 selectedOption?.method === "OTPSMS" ||
                                 selectedOption?.method === "OTPONLINEBANKING";

        return (
            <>
                <Typography variant="headline-3" tag="h2">
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
                {renderError()}

                {requiresCodeInput ? (
                    <>
                        <Utility vFlex vFlexCol vGap={4} style={{ width: '100%' }}>
                            <Label htmlFor="verification-code">Verification Code</Label>
                            <InputContainer>
                                <Input
                                    type="text"
                                    id="verification-code"
                                    placeholder="Enter verification code"
                                    value={code ?? ""}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch(setCode(e.target.value))}
                                    onKeyDown={handleCodeInputKeyDown}
                                    disabled={isLoading}
                                    aria-describedby="verification-code-message"
                                />
                            </InputContainer>
                            <InputMessage id="verification-code-message">
                                Enter the code sent to you
                            </InputMessage>
                        </Utility>

                        <Utility vFlex vAlignItems="center" vFlexWrap vGap={12} vPaddingTop={16}>
                            <Button
                                onClick={solveChallenge}
                                disabled={!code || isLoading}
                            >
                                Verify
                            </Button>
                            <Button
                                colorScheme="secondary"
                                onClick={createChallenge}
                                disabled={isLoading}
                            >
                                Resend code
                            </Button>
                            <Button
                                colorScheme="tertiary"
                                onClick={() => dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS))}
                                disabled={isLoading}
                            >
                                Use different method
                                <VisaChevronRightTiny />
                            </Button>
                        </Utility>
                    </>
                ) : (
                    <Utility vFlex vAlignItems="center" vGap={12} vPaddingTop={16}>
                        <Button
                            colorScheme="tertiary"
                            onClick={() => dispatch(setRegisterFlowStep(REGISTER_FLOW_STEPS.SHOW_STEP_UP_OPTIONS))}
                            disabled={isLoading}
                        >
                            Use different method
                        </Button>
                        <Button
                            colorScheme="secondary"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </Utility>
                )}
            </>
        );
    };

    const renderCreatePasskeyScreen = () => (
        <>
            <Typography variant="headline-3" tag="h2" className={styles.heading}>
                Create Your Passkey
            </Typography>
            <Typography variant="body-2" className={styles.modalMessage}>
                A passkey provides an easy and secure way to authenticate without using passwords.
            </Typography>
            {renderError()}
            <Utility vFlex vAlignItems="center" vGap={12}>
                <Button
                    onClick={createPasskey}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Create Passkey"}
                </Button>
                <Button
                    colorScheme="secondary"
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    Cancel
                </Button>
            </Utility>
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
        <>
            <div className={styles.modalOverlay} />
            <Dialog open className={styles.dialog}>
                <DialogContent>
                    <div className={styles.registerModal}>
                        {renderContent()}
                    </div>
                </DialogContent>
                <DialogCloseButton onClick={handleClose} />
            </Dialog>
        </>
    );
};

export default RegisterModal;
