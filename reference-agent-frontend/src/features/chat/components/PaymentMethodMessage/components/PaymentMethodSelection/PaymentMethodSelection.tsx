/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisaCardGenericLow, VisaAddLow, VisaCardVerifyLow } from '@visa/nova-icons-react';
import { Surface, Typography, Button } from '@visa/nova-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectActiveCards } from '@/features/cards/selectors/cardsSelectors';
import { setSelectedCard } from '@/features/chat/slices/paymentMethodSlice';
import { usePaymentMethodMessage } from '../../hooks/usePaymentMethodMessage';
import { paths } from '@/config/paths';
import styles from './PaymentMethodSelection.module.css';
import type { RootState, AppDispatch } from '@/store';
import type { Card } from '@/types';

interface PaymentMethodSelectionProps {
  messageIndex: number;
  isCompleted?: boolean;
}

const PaymentMethodSelection: React.FC<PaymentMethodSelectionProps> = ({ 
  messageIndex,
  isCompleted = false
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const activeCards = useSelector(selectActiveCards);
  const selectedCard = useSelector((state: RootState) => state.paymentMethod.selectedCard);
  
  // Hook for payment method logic
  const { handlePaymentMethodSelected } = usePaymentMethodMessage();

  // Auto-select first card when cards are loaded, but only if no card is already selected
  useEffect(() => {
    if (!selectedCard && activeCards.length > 0) {
      dispatch(setSelectedCard(activeCards[0].cardId));
    }
  }, [activeCards, dispatch, selectedCard]);

  const handleCardSelection = (card: Card) => {
    if (!isCompleted) {
      dispatch(setSelectedCard(card.cardId));
    }
  };

  const handleContinue = () => {
    if (selectedCard) {
      handlePaymentMethodSelected(selectedCard, messageIndex);
    }
  };

  const handleAddCard = () => {
    navigate(paths.cards.path);
  };

  return (
    <div className={styles.paymentMethodContainer}>
      <Surface className={styles.cardSelection}>
        <div className={styles.cardList}>
          {activeCards.map((card) => (
            <Surface
              key={card.cardId}
              className={`${styles.cardItem} ${
                selectedCard === card.cardId ? styles.selected : ''
              } ${isCompleted ? styles.disabled : ''}`}
              onClick={() => handleCardSelection(card)}
              style={{
                cursor: isCompleted ? 'default' : 'pointer',
                pointerEvents: isCompleted ? 'none' : 'auto'
              }}
            >
              <div className={styles.cardInfo}>
                <VisaCardGenericLow className={styles.cardIcon} />
                <div className={styles.cardDetails}>
                  <Typography variant="body-1" className={styles.cardNumber}>
                    •••• •••• •••• {card.last4}
                  </Typography>
                  <Typography variant="body-2" className={styles.cardType}>
                    Card ending in {card.last4}
                  </Typography>
                </div>
              </div>
            </Surface>
          ))}
        </div>

        {!isCompleted && (
          <div className={styles.actionButtons}>
            <Button
              className={styles.addCardButton}
              onClick={handleAddCard}
            >
              <VisaAddLow className={styles.buttonIcon} />
              Add Card
            </Button>

            {selectedCard && (
              <Button
                className={styles.continueButton}
                onClick={handleContinue}
              >
                <VisaCardVerifyLow className={styles.buttonIcon} />
                Continue with Selected Card
              </Button>
            )}
          </div>
        )}
      </Surface>
    </div>
  );
};

export default React.memo(PaymentMethodSelection, (prevProps, nextProps) => {
  // Only re-render if isCompleted or messageIndex changes
  return prevProps.isCompleted === nextProps.isCompleted &&
         prevProps.messageIndex === nextProps.messageIndex;
});
