/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import BotMessage from '../../../BotMessage/BotMessage';
import NoPaymentMethodMessage from '../NoPaymentMethodMessage/NoPaymentMethodMessage';
import PaymentMethodSelection from '../PaymentMethodSelection/PaymentMethodSelection';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveCards } from '../../../../../cards/selectors/cardsSelectors';
import type { RootState } from '@/store';

interface PaymentMethodMessageProps {
  messageIndex: number;
  timestamp: string;
  isCompleted?: boolean;
}

const PaymentMethodMessage: React.FC<PaymentMethodMessageProps> = ({ 
  messageIndex,
  timestamp,
  isCompleted = false
}) => {
  const loadingCards = useSelector((state: RootState) => state.cards.isLoadingCards);
  const cardError = useSelector((state: RootState) => state.cards.cardsError);
  const activeCards = useSelector(selectActiveCards);

  // Determine bot message text
  const getBotMessageText = (): string => {
    if (loadingCards) return "Loading payment methods...";
    if (cardError) return `Error loading payment methods: ${cardError}`;
    if (activeCards.length === 0) return "No payment methods available.";
    return "To proceed, please select a payment method:";
  };

  // Determine what content to show
  const renderPaymentContent = () => {
    // Loading or error states - no content needed
    if (loadingCards || cardError) return null;
    
    // No cards available
    if (activeCards.length === 0) {
      return <NoPaymentMethodMessage />;
    }
    
    // Cards available
    return (
      <PaymentMethodSelection 
        messageIndex={messageIndex}
        isCompleted={isCompleted}
      />
    );
  };

  return (
    <>
      <BotMessage 
        text={getBotMessageText()}
        timestamp={timestamp}
      />
      {renderPaymentContent()}
    </>
  );
};

export default React.memo(PaymentMethodMessage);
