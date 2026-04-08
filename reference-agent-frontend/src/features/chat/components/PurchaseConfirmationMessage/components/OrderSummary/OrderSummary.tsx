/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { VisaLogCompletedLow } from '@visa/nova-icons-react';
import { Typography } from '@visa/nova-react';
import { selectMessageOrderItems } from '../../../../selectors/purchaseConfirmationSelectors';
import styles from './OrderSummary.module.css';
import type { RootState } from '@/store';
import type { orderItem } from '@/types';
import { selectTotalQuantity } from '@/features/chat/selectors/productSelectionSelectors';

interface OrderSummaryProps {
  messageIndex: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ messageIndex }) => {
  const orderItems = useSelector((state: RootState) => selectMessageOrderItems(state, messageIndex));

  // Calculate total from order items with error handling
  const orderTotal = orderItems?.reduce((total: number, item: orderItem) => {
    const price = parseFloat(item?.price) || 0;
    const quantity = item?.quantity || 0;
    return total + (price * quantity);
  }, 0) || 0;

  // Filter out items with missing essential data
  const validItems = orderItems?.filter((item: orderItem) =>
    item?.name && item?.price && item?.quantity
  ) || [];

  // Don't render if no valid items
  if (validItems.length === 0) {
    return null;
  }

  const cartQuantity = useSelector(selectTotalQuantity);

  return (
    <div className={styles.orderSection}>
      <div className={styles.separator} />
      <div className={styles.sectionHeader}>
        <VisaLogCompletedLow style={{ '--v-icon-primary': 'var(--palette-color-default)', '--v-icon-secondary': 'var(--palette-color-default)' } as React.CSSProperties} />
        <Typography variant="body-1" tag="h4" className={styles.sectionTitle}>
          Order Items ({cartQuantity})
        </Typography>
      </div>
      <div className={styles.orderItems}>
        {validItems.map((item, index) => {
          const itemPrice = parseFloat(item.price) || 0;
          const itemQuantity = item.quantity || 0;
          const itemTotal = itemPrice * itemQuantity;

          return (
            <div key={item?.id || item?.productId || index} className={styles.orderItem}>
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.itemImage}
                />
              )}
              <div className={styles.itemDetails}>
                <Typography variant="body-2" className={styles.itemName}>{item.name}</Typography>
                <Typography variant="body-3" className={styles.itemQuantity}>Quantity: {itemQuantity}</Typography>
              </div>
              <Typography variant="body-2" className={styles.itemPrice}>
                ${itemTotal.toFixed(2)}
              </Typography>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default OrderSummary;
