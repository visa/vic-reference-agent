/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedCard } from '../../../slices/paymentMethodSlice';
import { completePaymentMethodMessage } from '../../../thunks/chatThunks';
import type { RootState, AppDispatch } from '@/store';

export const usePaymentMethodMessage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCard = useSelector((state: RootState) => state.paymentMethod.selectedCard);
  
  const handlePaymentMethodSelected = useCallback((card: string, messageIndex: number) => {
    console.log('Payment method selected:', card);
    
    // Set the selected card in our slice
    dispatch(setSelectedCard(card));
    
    // Complete the payment method message and add authorize message
    dispatch(completePaymentMethodMessage({
      messageIndex,
      selectedCard: card
    }));
  }, [dispatch]);

  return {
    selectedCard,
    handlePaymentMethodSelected
  };
};
