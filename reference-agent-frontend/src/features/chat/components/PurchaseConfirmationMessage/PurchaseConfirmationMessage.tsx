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
import { useSelector } from 'react-redux';
import BotMessage from '../BotMessage/BotMessage';
import PaymentSuccessHeader from './components/PaymentSuccessHeader/PaymentSuccessHeader';
import OrderSummary from './components/OrderSummary/OrderSummary';
import PurchaseSummary from './components/PurchaseSummary/PurchaseSummary';
import { selectMessagePurchaseSummary } from '../../selectors/purchaseConfirmationSelectors';
import type { RootState } from '@/store';
import styles from './PurchaseConfirmationMessage.module.css';

const PurchaseConfirmationMessage: React.FC<{
  messageIndex: number;
  timestamp: string;
}> = ({ messageIndex, timestamp }) => {
  const purchaseSummary = useSelector((state: RootState) => selectMessagePurchaseSummary(state, messageIndex));
  const purchaseSuccessful = purchaseSummary?.orderId;
  return (
    <>
      {/* Bot message with introduction text */}
      <BotMessage 
        text={purchaseSuccessful 
          ? "Great! Your purchase is completed. Here is a summary of your order:" 
          : "Sorry, there was an issue with your purchase. Here are the details:"
        }
        timestamp={timestamp}
        isTyping={false}
      />
      
      {/* Main container */}
      <div className={purchaseSuccessful ? styles.container : styles.containerError}>
        {/* Success/Error header */}
        <PaymentSuccessHeader 
          title={purchaseSuccessful 
            ? "Order Confirmed Successfully!" 
            : "Purchase Failed"
          }
          isSuccess={!!purchaseSuccessful}
        />
        <PurchaseSummary messageIndex={messageIndex}/>
        {/* Order Items Section */}
        <OrderSummary messageIndex={messageIndex} />
      </div>
    </>
  );
};

export default PurchaseConfirmationMessage;
/* END GENAI */