/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogCloseButton,
    Input,
    InputContainer,
    InputMessage,
    Button,
    Label,
    Utility,
    Typography,
    SectionMessage,
    SectionMessageContent,
    SectionMessageIcon,
    UtilityFragment,
} from '@visa/nova-react';
import { VisaErrorTiny } from '@visa/nova-icons-react';
import styles from './AddCardModal.module.css';
import { useAddCardModal } from './hooks/useAddCardModal';

const AddCardModal: React.FC = () => {
    const {
        register,
        handleSubmit,
        errors,
        cardNumberInputValue,
        cardNumberValid,
        brand,
        loading,
        error,
        cardNumberInputRef,
        handleCardNumberChange,
        handleCardNumberFocus,
        handleCardNumberBlur,
        handleAddCardSubmit,
        handleModalClose,
    } = useAddCardModal();

    return (
        <>
            <div className={styles.modalOverlay} onClick={handleModalClose} />
            <Dialog open className={styles.dialog}>
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader className={styles.dialogHeader}>
                        Add Card
                    </DialogHeader>
                {error ? (
                    <SectionMessage messageType="error" className={styles.sectionMessage}>
                        <SectionMessageIcon />
                        <UtilityFragment vPaddingLeft={8} vPaddingBottom={2}>
                            <SectionMessageContent>
                                <Typography variant="body-2">{error}</Typography>
                            </SectionMessageContent>
                        </UtilityFragment>
                    </SectionMessage>
                ) : (
                    <SectionMessage messageType={"info" as any} className={styles.sectionMessage}>
                        <SectionMessageIcon />
                        <UtilityFragment vPaddingLeft={8} vPaddingBottom={2}>
                            <SectionMessageContent>
                                <Typography variant="body-2">VIC only supports Visa cards for enrollment. Other card networks are not supported.</Typography>
                            </SectionMessageContent>
                        </UtilityFragment>
                    </SectionMessage>
                )}
                <form onSubmit={handleSubmit(handleAddCardSubmit)} className={`v-flex v-flex-col ${styles.form}`}>
                    <div className={`v-flex v-flex-row ${styles.expirationRow}`}>
                        <Utility vFlex vFlexCol vGap={4} className={styles.cardNumberField}>
                            <Label htmlFor="card-number">
                                Card Number{brand && ` (${brand})`}
                            </Label>
                            <InputContainer>
                                <Input
                                    ref={cardNumberInputRef}
                                    type="text"
                                    id="card-number"
                                    value={cardNumberInputValue}
                                    onChange={handleCardNumberChange}
                                    onFocus={handleCardNumberFocus}
                                    onBlur={handleCardNumberBlur}
                                    aria-describedby="card-number-message"
                                    aria-required="true"
                                    aria-invalid={!!(errors.cardNumber || (cardNumberInputValue && !cardNumberValid))}
                                />
                            </InputContainer>
                            {errors.cardNumber ? (
                                <InputMessage aria-atomic="true" aria-live="assertive" id="card-number-message" role="alert">
                                    <VisaErrorTiny />
                                    {errors.cardNumber.message}
                                </InputMessage>
                            ) : cardNumberInputValue && !cardNumberValid ? (
                                <InputMessage aria-atomic="true" aria-live="assertive" id="card-number-message" role="alert">
                                    <VisaErrorTiny />
                                    Please enter a valid Visa card number
                                </InputMessage>
                            ) : (
                                <InputMessage id="card-number-message">
                                    Enter your 16-digit card number
                                </InputMessage>
                            )}
                        </Utility>
                        <Utility vFlex vFlexCol vGap={4} className={styles.expDateField}>
                            <Typography variant="label" tag="label" className={(errors.expMonth || errors.expYear) ? styles.labelError : styles.expDateLabel}>Expiration Date</Typography>
                            <Utility vFlex vAlignItems="start" vGap={8}>
                                <Utility vFlex vFlexCol vGap={4} className={styles.expFieldWrapper}>
                                    <Label htmlFor="expiration-month" className={styles.srOnly}>Expiration Month</Label>
                                    <InputContainer className={styles.expInput}>
                                        <Input
                                            type="text"
                                            id="expiration-month"
                                            aria-describedby="expiration-month-message"
                                            aria-required="true"
                                            aria-invalid={!!errors.expMonth || undefined}
                                            maxLength={2}
                                            {...(() => {
                                                const { onChange: registerOnChange, ...rest } = register("expMonth", {
                                                    required: "Month is required",
                                                    pattern: {
                                                        value: /^(0[1-9]|1[0-2])$/,
                                                        message: "Month must be 01-12"
                                                    }
                                                });
                                                return {
                                                    ...rest,
                                                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        e.target.value = value;
                                                        registerOnChange(e);
                                                        if (value.length >= 2) {
                                                            const yearInput = document.getElementById('expiration-year') as HTMLInputElement;
                                                            yearInput?.focus();
                                                            yearInput?.select();
                                                        }
                                                    }
                                                };
                                            })()}
                                        />
                                    </InputContainer>
                                    {errors.expMonth ? (
                                        <InputMessage aria-atomic="true" aria-live="assertive" id="expiration-month-message" role="alert">
                                            <VisaErrorTiny />
                                            {errors.expMonth.message}
                                        </InputMessage>
                                    ) : (
                                        <InputMessage id="expiration-month-message">MM</InputMessage>
                                    )}
                                </Utility>
                                <span className={styles.slashSeparator}>/</span>
                                <Utility vFlex vFlexCol vGap={4} className={styles.expFieldWrapper}>
                                    <Label htmlFor="expiration-year" className={styles.srOnly}>Expiration Year</Label>
                                    <InputContainer className={styles.expInput}>
                                        <Input
                                            type="text"
                                            id="expiration-year"
                                            aria-describedby="expiration-year-message"
                                            aria-required="true"
                                            aria-invalid={!!errors.expYear || undefined}
                                            maxLength={2}
                                            {...register("expYear", {
                                                required: "Year is required",
                                                pattern: {
                                                    value: /^\d{2}$/,
                                                    message: "Year must be 2 digits"
                                                },
                                                validate: value => {
                                                    const year = parseInt("20" + value);
                                                    const currentYear = new Date().getFullYear();
                                                    return year >= currentYear || "Year cannot be in the past";
                                                }
                                            })}
                                        />
                                    </InputContainer>
                                    {errors.expYear ? (
                                        <InputMessage aria-atomic="true" aria-live="assertive" id="expiration-year-message" role="alert">
                                            <VisaErrorTiny />
                                            {errors.expYear.message}
                                        </InputMessage>
                                    ) : (
                                        <InputMessage id="expiration-year-message">YY</InputMessage>
                                    )}
                                </Utility>
                            </Utility>
                        </Utility>
                        <Utility vFlex vFlexCol vGap={4} className={styles.cvvField}>
                            <Label htmlFor="cvv">CVV2</Label>
                            <InputContainer className={styles.cvvInput}>
                                <Input
                                    type="password"
                                    id="cvv"
                                    maxLength={3}
                                    aria-describedby="cvv-message"
                                    aria-required="true"
                                    aria-invalid={!!errors.cvv || undefined}
                                    {...register("cvv", {
                                        required: "CVV is required",
                                        pattern: {
                                            value: /^\d{3}$/,
                                            message: "CVV must be 3 digits"
                                        }
                                    })}
                                />
                            </InputContainer>
                            {errors.cvv ? (
                                <InputMessage aria-atomic="true" aria-live="assertive" id="cvv-message" role="alert">
                                    <VisaErrorTiny />
                                    {errors.cvv.message}
                                </InputMessage>
                            ) : (
                                <InputMessage id="cvv-message">3 digits</InputMessage>
                            )}
                        </Utility>
                    </div>
                    <Utility vFlex vFlexCol vGap={4}>
                        <Label htmlFor="name-on-card">Name on Card</Label>
                        <InputContainer>
                            <Input
                                type="text"
                                id="name-on-card"
                                aria-describedby="name-on-card-message"
                                aria-required="true"
                                aria-invalid={!!errors.nameOnCard || undefined}
                                {...register("nameOnCard", {
                                    required: "Name on card is required",
                                    minLength: {
                                        value: 3,
                                        message: "Name must be at least 3 characters"
                                    },
                                    maxLength: {
                                        value: 50,
                                        message: "Name must be at most 50 characters"
                                    }
                                })}
                            />
                        </InputContainer>
                        {errors.nameOnCard ? (
                            <InputMessage aria-atomic="true" aria-live="assertive" id="name-on-card-message" role="alert">
                                <VisaErrorTiny />
                                {errors.nameOnCard.message}
                            </InputMessage>
                        ) : (
                            <InputMessage id="name-on-card-message">Full name as it appears on card</InputMessage>
                        )}
                    </Utility>

                    <Button type="submit" disabled={loading} className={styles.submitButton}>
                        {loading ? 'Processing...' : 'Continue'}
                    </Button>
                </form>
            </DialogContent>
            <DialogCloseButton onClick={handleModalClose} />
        </Dialog>
        </>
    );
};

export default AddCardModal;
