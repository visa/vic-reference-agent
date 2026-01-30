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
import { VisaCartLow } from '@visa/nova-icons-react';
import { Button, Surface, Typography } from '@visa/nova-react';
import styles from './CartCard.module.css';
import { formatCurrency } from '../../../../../../utils/formattingUtils';
import { useDispatch } from 'react-redux';
import { setInput } from '../../../../slices/chatSlice';
import { sendChatMessage, processChatResponse } from '../../../../thunks/chatThunks';
import type { AppDispatch } from '@/store';

interface CartCardProps {
  itemCount: number;
  totalAmount: number;
}

const CartCard: React.FC<CartCardProps> = ({ 
  itemCount, 
  totalAmount, 
}) => {
  const itemText = itemCount === 1 ? 'item' : 'items';
  const dispatch = useDispatch<AppDispatch>();

  const handleCheckout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      dispatch(setInput('I want to proceed to checkout.'));
      const result = await dispatch(sendChatMessage()).unwrap();

      // Process the AI response
      if (result.response) {
        await dispatch(processChatResponse(result));
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  return (
    <Surface className={styles.cartCard}>
      <div className={styles.cartHeader}>
        <VisaCartLow className={styles.cartIcon} />
        <div className={styles.cartInfo}>
          <Typography variant="body-1" className={styles.cartTitle}>
            {itemCount} {itemText} in cart
          </Typography>
          <Typography variant="body-2" className={styles.cartSubtitle}>
            Total: {formatCurrency(totalAmount)}
          </Typography>
        </div>
      </div>

      <Button
        className={styles.checkoutButton}
        onClick={handleCheckout}
      >
        <VisaCartLow className={styles.buttonIcon} />
        Proceed to Checkout
      </Button>
    </Surface>
  );
};

export default CartCard;
/* END GENAI */
