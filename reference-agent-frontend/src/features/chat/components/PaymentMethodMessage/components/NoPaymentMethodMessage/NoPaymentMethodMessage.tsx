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
import { useNavigate } from 'react-router-dom';
import { VisaCardGenericLow, VisaAddLow } from '@visa/nova-icons-react';
import { paths } from '../../../../../../config/paths';
import styles from './NoPaymentMethodMessage.module.css';

const NoPaymentMethodMessage: React.FC = () => {
  const navigate = useNavigate();

  const handleAddCard = () => {
    navigate(paths.cards.path);
  };

  return (
    <div className={styles.paymentMethodContainer}>
      <div className={styles.noCardsMessage}>
        <VisaCardGenericLow className={styles.cardIcon} style={{ '--v-icon-primary': '#CC5500', '--v-icon-secondary': '#CC5500' } as React.CSSProperties} />
        <div className={styles.textContent}>
          <h4 className={styles.noCardsTitle}>Payment Method Required</h4>
          <p className={styles.noCardsText}>
            Please add a payment method to complete your purchase
          </p>
        </div>
        <button 
          className={styles.addCardButton}
          onClick={handleAddCard}
        >
          <VisaAddLow className={styles.buttonIcon} style={{ '--v-icon-primary': '#CC5500' } as React.CSSProperties} />
          Add Card
        </button>
      </div>
    </div>
  );
};

export default NoPaymentMethodMessage;
/* END GENAI */
