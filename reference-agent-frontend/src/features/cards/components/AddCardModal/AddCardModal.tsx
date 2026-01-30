/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
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
    Typography,
    SectionMessage,
    SectionMessageContent,
    SectionMessageIcon
} from '@visa/nova-react';
import styles from './AddCardModal.module.css';
import { useAddCardModal } from './hooks/useAddCardModal';

const AddCardModal: React.FC = () => {
    const {
        register,
        handleSubmit,
        errors,
        formattedCardNumber,
        cardNumberValid,
        brand,
        loading,
        error,
        handleCardNumberChange,
        handleAddCardSubmit,
        handleModalClose,
    } = useAddCardModal();
    
    return (
        <>
            <div className={styles.modalOverlay} onClick={handleModalClose} />
            <Dialog open className={styles.dialog}>
                <DialogContent>
                    <DialogHeader className={styles.dialogHeader}>
                        Add Card
                    </DialogHeader>
                {error && (
                    <SectionMessage messageType="error">
                        <SectionMessageIcon />
                        <SectionMessageContent>{error}</SectionMessageContent>
                    </SectionMessage>
                )}
                <form onSubmit={handleSubmit(handleAddCardSubmit)} className={`v-flex v-flex-col ${styles.form}`}>
                    <div className={`v-flex v-flex-col ${styles.fieldGroup}`}>
                        <Typography variant="label" tag="label" htmlFor="card-number">
                            Card Number (required)
                            {brand && <span className={styles.cardBrand}>({brand})</span>}
                        </Typography>
                        <InputContainer>
                            <Input
                                type="text"
                                id="card-number"
                                value={formattedCardNumber}
                                onChange={handleCardNumberChange}
                                aria-describedby="card-number-message"
                                aria-required="true"
                                aria-invalid={!!(errors.cardNumber || (formattedCardNumber && !cardNumberValid))}
                            />
                        </InputContainer>
                        {errors.cardNumber ? (
                            <InputMessage id="card-number-message" colorScheme="default" className={styles.errorMessage}>
                                {errors.cardNumber.message}
                            </InputMessage>
                        ) : formattedCardNumber && !cardNumberValid ? (
                            <InputMessage id="card-number-message" colorScheme="default" className={styles.errorMessage}>
                                Please enter a valid Visa card number
                            </InputMessage>
                        ) : (
                            <InputMessage id="card-number-message">
                                Enter your 16-digit card number
                            </InputMessage>
                        )}
                    </div>
                    <div className={`v-flex v-flex-row ${styles.expirationRow}`}>
                        <div className={`v-flex v-flex-col ${styles.expirationField}`}>
                            <Typography variant="label" tag="label" htmlFor="expiration-month">Expiration Month (required)</Typography>
                            <InputContainer>
                                <Input
                                    type="text"
                                    id="expiration-month"
                                    aria-describedby="expiration-month-message"
                                    aria-required="true"
                                    aria-invalid={!!errors.expMonth || undefined}
                                    {...register("expMonth", {
                                        required: "Month is required",
                                        pattern: {
                                            value: /^(0[1-9]|1[0-2])$/,
                                            message: "Month must be 01-12"
                                        }
                                    })}
                                />
                            </InputContainer>
                            {errors.expMonth ? (
                                <InputMessage id="expiration-month-message" colorScheme="default" className={styles.errorMessage}>
                                    {errors.expMonth.message}
                                </InputMessage>
                            ) : (
                                <InputMessage id="expiration-month-message">MM (01-12)</InputMessage>
                            )}
                        </div>
                        <div className={`v-flex v-flex-col ${styles.expirationField}`}>
                            <Typography variant="label" tag="label" htmlFor="expiration-year">Expiration Year (required)</Typography>
                            <InputContainer>
                                <Input
                                    type="text"
                                    id="expiration-year"
                                    aria-describedby="expiration-year-message"
                                    aria-required="true"
                                    aria-invalid={!!errors.expYear || undefined}
                                    {...register("expYear", {
                                        required: "Year is required",
                                        pattern: {
                                            value: /^\d{4}$/,
                                            message: "Year must be 4 digits"
                                        },
                                        validate: value => {
                                            const year = parseInt(value);
                                            const currentYear = new Date().getFullYear();
                                            return year >= currentYear || "Year cannot be in the past";
                                        }
                                    })}
                                />
                            </InputContainer>
                            {errors.expYear ? (
                                <InputMessage id="expiration-year-message" colorScheme="default" className={styles.errorMessage}>
                                    {errors.expYear.message}
                                </InputMessage>
                            ) : (
                                <InputMessage id="expiration-year-message">YYYY (e.g., 2025)</InputMessage>
                            )}
                        </div>
                    </div>
                    <div className={`v-flex v-flex-col ${styles.fieldGroup}`}>
                        <Typography variant="label" tag="label" htmlFor="cvv">CVV2 (required)</Typography>
                        <InputContainer>
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
                            <InputMessage id="cvv-message" colorScheme="default" className={styles.errorMessage}>
                                {errors.cvv.message}
                            </InputMessage>
                        ) : (
                            <InputMessage id="cvv-message">3-digit security code on back of card</InputMessage>
                        )}
                    </div>
                    <div className={`v-flex v-flex-col ${styles.fieldGroup}`}>
                        <Typography variant="label" tag="label" htmlFor="name-on-card">Name on Card (required)</Typography>
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
                            <InputMessage id="name-on-card-message" colorScheme="default" className={styles.errorMessage}>
                                {errors.nameOnCard.message}
                            </InputMessage>
                        ) : (
                            <InputMessage id="name-on-card-message">Full name as it appears on card</InputMessage>
                        )}
                    </div>

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
/* END GENAI */
