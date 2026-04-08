/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useState, useCallback, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useCardNumberValidation } from '@visa/nova-react';
import { addCard } from '@/features/cards/thunks/cardsThunks';
import { closeModal } from '@/features/layout/slices/modalSlice';
import type { RootState, AppDispatch } from '@/store';
import type { AddCardFormData } from '@/types';

const formatWithSpaces = (digits: string): string => {
    const groups = [4, 4, 4, 4];
    let result = '';
    let offset = 0;
    for (const len of groups) {
        if (offset >= digits.length) break;
        if (offset > 0) result += ' ';
        result += digits.slice(offset, offset + len);
        offset += len;
    }
    return result;
};

export const useAddCardModal = () => {
    // Redux state
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector((state: RootState) => state.cards.isLoadingCards);
    const error = useSelector((state: RootState) => state.cards.cardsError);
    const modalProps = useSelector((state: RootState) => state.modal.modalProps);

    // Local state
    const [isCardNumberFocused, setIsCardNumberFocused] = useState<boolean>(true);

    // Cursor position management for card number input
    const cardNumberInputRef = useRef<HTMLInputElement>(null);
    const cursorPositionRef = useRef<number | null>(null);

    // Nova card number validation hook
    const {
        formattedCardNumber,
        cleanCardNumber,
        onCardNumberChange,
        valid: cardNumberValid,
        brand,
    } = useCardNumberValidation({
        trimToMaxLength: true,
        allowedBrands: ['VISA']
    });

    // Masked card number display (shows last 4 digits, with spaces matching formatted pattern)
    const maskedCardNumber = cleanCardNumber && cleanCardNumber.length >= 4
        ? formattedCardNumber.replace(/\d(?=.{4,}$)/g, '•')
        : formattedCardNumber;

    // Display value based on focus state
    const displayCardNumber = isCardNumberFocused ? formattedCardNumber : maskedCardNumber;

    // Form management
    const form = useForm<AddCardFormData>({
        defaultValues: {
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvv: '',
            nameOnCard: '',
        }
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        setError,
        clearErrors
    } = form;

    // Card number input handler using Nova's validation
    const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const digitsOnly = value.replace(/\D/g, '');
        // Limit to 16 digits
        if (digitsOnly.length > 16) return;

        // Count digits before the cursor in the old value to track position
        const cursorPos = e.target.selectionStart ?? value.length;
        const digitsBefore = value.slice(0, cursorPos).replace(/\D/g, '').length;

        // Compute where cursor should land in the formatted output:
        // walk through formatted value until we've passed `digitsBefore` digits
        const formatted = formatWithSpaces(digitsOnly);
        let newCursor = 0;
        let digitsSeen = 0;
        for (let i = 0; i < formatted.length && digitsSeen < digitsBefore; i++) {
            newCursor = i + 1;
            if (formatted[i] !== ' ') {
                digitsSeen++;
            }
        }
        cursorPositionRef.current = newCursor;

        onCardNumberChange(value);

        // Clear any existing card number errors when user types
        if (errors.cardNumber) {
            clearErrors('cardNumber');
        }
    }, [onCardNumberChange, errors.cardNumber, clearErrors]);

    // Restore cursor position after React re-renders the formatted value
    useLayoutEffect(() => {
        if (cursorPositionRef.current !== null && cardNumberInputRef.current && isCardNumberFocused) {
            cardNumberInputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
            cursorPositionRef.current = null;
        }
    }, [formattedCardNumber, isCardNumberFocused]);

    // Form submission
    const handleAddCardSubmit = useCallback(async (data: AddCardFormData) => {
        // Validate card number using Nova's validation
        if (!cleanCardNumber) {
            setError('cardNumber', { type: 'required', message: 'Card number is required' });
            return;
        }
        if (!cardNumberValid) {
            setError('cardNumber', { type: 'pattern', message: 'Please enter a valid Visa card number' });
            return;
        }

        // Convert YY to YYYY for API
        const fullYear = '20' + data.expYear;

        try {
            const cardDetails: AddCardFormData = {
                cardNumber: cleanCardNumber,
                expMonth: data.expMonth,
                expYear: fullYear,
                cvv: data.cvv,
                nameOnCard: data.nameOnCard,
            };

            const response = await dispatch(addCard(cardDetails)).unwrap();

            // Reset form and state
            reset();
            onCardNumberChange('');
            setIsCardNumberFocused(true);

            // Close the modal
            dispatch(closeModal());

            // Call any success callback from props if provided
            modalProps.onCardAdded?.(response);
        } catch (error) {
            console.error('Add card failed:', error);
            // Error is already handled by Redux thunk
        }
    }, [cleanCardNumber, cardNumberValid, setError, dispatch, reset, onCardNumberChange, modalProps]);

    // Modal close handler
    const handleModalClose = useCallback(() => {
        onCardNumberChange('');
        setIsCardNumberFocused(true);
        reset();
        dispatch(closeModal());
    }, [reset, dispatch, onCardNumberChange]);

    // Card number focus/blur handlers for masking
    const handleCardNumberFocus = useCallback(() => {
        setIsCardNumberFocused(true);
    }, []);

    const handleCardNumberBlur = useCallback(() => {
        setIsCardNumberFocused(false);
    }, []);

    return {
        // Form state
        form,
        register,
        handleSubmit,
        errors,

        // Card number state (Nova validation)
        cardNumberInputValue: displayCardNumber,
        cardNumberValid,
        brand,

        // Loading/error state
        loading,
        error,

        // Refs
        cardNumberInputRef,

        // Handlers
        handleCardNumberChange,
        handleCardNumberFocus,
        handleCardNumberBlur,
        handleAddCardSubmit,
        handleModalClose,
    };
};
