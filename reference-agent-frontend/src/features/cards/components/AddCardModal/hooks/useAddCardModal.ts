/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useCardNumberValidation } from '@visa/nova-react';
import { addCard } from '@/features/cards/thunks/cardsThunks';
import { closeModal } from '@/features/layout/slices/modalSlice';
import type { RootState, AppDispatch } from '@/store';
import type { AddCardFormData } from '@/types';

export const useAddCardModal = () => {
    // Redux state
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector((state: RootState) => state.cards.isLoadingCards);
    const error = useSelector((state: RootState) => state.cards.cardsError);
    const modalProps = useSelector((state: RootState) => state.modal.modalProps);

    // Nova card number validation hook
    const {
        cardNumberInputValue,
        formattedCardNumber,
        cleanCardNumber,
        onCardNumberChange,
        valid: cardNumberValid,
        brand,
        binValid,
        lengthValid,
        lastDigitValid
    } = useCardNumberValidation({
        trimToMaxLength: true,
        allowedBrands: ['VISA']
    });

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
        onCardNumberChange(value);
        setValue('cardNumber', cleanCardNumber);

        // Clear any existing card number errors when user types
        if (errors.cardNumber) {
            clearErrors('cardNumber');
        }
    }, [onCardNumberChange, cleanCardNumber, errors.cardNumber, setValue, clearErrors]);

    // Form submission
    const handleAddCardSubmit = useCallback(async (data: AddCardFormData) => {
        // Validate card number using Nova's validation
        if (!cleanCardNumber) {
            setError('cardNumber', { type: 'required', message: 'Card number is required' });
            return;
        }
        if (!cardNumberValid) {
            setError('cardNumber', { type: 'validation', message: 'Please enter a valid card number' });
            return;
        }

        try {
            const cardDetails: AddCardFormData = {
                cardNumber: cleanCardNumber,
                expMonth: data.expMonth,
                expYear: data.expYear,
                cvv: data.cvv,
                nameOnCard: data.nameOnCard,
            };
            console.log(cardDetails)

            const response = await dispatch(addCard(cardDetails)).unwrap();

            // Reset form and state
            reset();
            onCardNumberChange('');

            // Close the modal
            dispatch(closeModal());

            // Call any success callback from props if provided
            modalProps.onCardAdded?.(response);
        } catch (error) {
            console.error('Add card failed:', error);
            // Error is already handled by Redux thunk
        }
    }, [cleanCardNumber, cardNumberValid, setError, dispatch, reset, modalProps, onCardNumberChange]);

    // Modal close handler
    const handleModalClose = useCallback(() => {
        onCardNumberChange('');
        reset();
        dispatch(closeModal());
    }, [reset, dispatch, onCardNumberChange]);

    return {

        // Form state
        form,
        register,
        handleSubmit,
        errors,

        // Card number state (Nova validation)
        cardNumberInputValue,
        formattedCardNumber,
        cleanCardNumber,
        cardNumberValid,
        brand,
        binValid,
        lengthValid,
        lastDigitValid,

        // Loading/error state
        loading,
        error,

        // Handlers
        handleCardNumberChange,
        handleAddCardSubmit,
        handleModalClose,
    };
};
/* END GENAI */
