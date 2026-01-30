/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState } from 'react';
import { VisaSecurityProtectionLow } from '@visa/nova-icons-react';
import { Button, Typography } from '@visa/nova-react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './VerifyIdentityButton.module.css';
import { openModal } from '@/features/layout/slices/modalSlice';
import { startAuthorizationFlow } from '@/features/payment/thunks/paymentAuthorizationThunks';
import type { RootState, AppDispatch } from '@/store';
import type { Card } from '@/types';

const VerifyIdentityButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedCardId = useSelector((state: RootState) => state.paymentMethod.selectedCard);
  const cards = useSelector((state: RootState) => state.cards.cards);
  const orderSummary = useSelector((state: RootState) => state.orderSummary.orderSummary);
  const conversationFlow = useSelector((state: RootState) => state.chat.conversationFlow);
  const [isLoading, setIsLoading] = useState(false);
  
  // Type guard to ensure selectedCard exists
  // This should never be null at this point in the flow, so we throw if it is
  const getSelectedCard = (): Card => {
    if (!selectedCardId) {
      throw new Error('No card selected - selectedCardId is null');
    }
    if (!cards || cards.length === 0) {
      throw new Error('No cards available in store');
    }
    const card = cards.find((c: Card) => c.cardId === selectedCardId);
    if (!card) {
      throw new Error(`Selected card with ID ${selectedCardId} not found in cards array`);
    }
    return card;
  };
  
  // Button should be disabled if payment is completed
  const isPaymentCompleted = conversationFlow === 'completed';

  const handleClick = async () => {
    if (orderSummary && !isLoading && !isPaymentCompleted) {
      try {
        setIsLoading(true);
        
        // Get the selected card (will throw if null)
        const selectedCard = getSelectedCard();
    
        // Open modal
        dispatch(openModal({
          modalType: 'passkeyModal',
          props: {
            origin: 'handleVerify',
            cardId: selectedCard.cardId,
            provisionedTokenId: selectedCard.tokenId,
            expMonth: selectedCard.expMonth,
            expYear: selectedCard.expYear,
            amount: orderSummary.overallAmount,
            currencyCode: orderSummary.currencyCode || 'USD',
            prompt: orderSummary.merchantName
          }
        }));
        
        // Start the authorization flow that waits for user completion
        try {
          //TODO CHECK IF THIS NEEDS URL ACTUALLY
          const result = await dispatch(startAuthorizationFlow()).unwrap();
          
          console.log('Authorization completed successfully:', result);
        } catch (authError) {
          console.log('Authorization failed or was cancelled:', (authError as Error).message);
        }
      } catch (error) {
        console.error('Error in handleClick:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getButtonText = () => {
    if (isPaymentCompleted) return 'Payment Completed';
    if (isLoading) return 'Processing...';
    return 'Verify Identity & Continue';
  };

  return (
    <div className={styles.buttonContainer}>
      <Button
        className={styles.verifyButton}
        onClick={handleClick}
        disabled={!selectedCardId || isLoading || isPaymentCompleted}
      >
        <VisaSecurityProtectionLow className={styles.shieldIcon} />
        <Typography variant="body-1" className={styles.buttonText}>
          {getButtonText()}
        </Typography>
      </Button>

      <div className={styles.securityTag}>
        <Typography variant="body-2" className={styles.tagText}>Secured by Visa</Typography>
      </div>
    </div>
  );
};

export default React.memo(VerifyIdentityButton);
