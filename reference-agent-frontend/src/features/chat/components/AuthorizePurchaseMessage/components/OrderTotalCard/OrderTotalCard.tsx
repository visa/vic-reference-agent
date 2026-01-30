/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI@CLAUDE */
import React from 'react';
import { useSelector } from 'react-redux';
import { Surface, Typography } from '@visa/nova-react';
import { selectTotalQuantity } from '../../../../selectors/productSelectionSelectors';
import styles from './OrderTotalCard.module.css';
import { SHIPPING_ADDRESS } from '@/constants/address';
import { OrderSummary } from '@/types';

interface OrderTotalCardProps {
  formatCurrency: (amount: number) => string;
  orderSummary?: OrderSummary;
}

const OrderTotalCard: React.FC<OrderTotalCardProps> = ({
  formatCurrency,
  orderSummary
}) => {
  console.log("orderSummary from props:", orderSummary)
  const totalItems = useSelector(selectTotalQuantity);
  // Use overallAmount instead of purchase_amount to show the total including tax
  const overallAmount = orderSummary?.overallAmount || '0';
  const merchantName = orderSummary?.merchantName || 'Unknown Merchant';

  return (
    <Surface className={styles.orderTotalCard}>
      <div className={styles.cardHeader}>
        <Typography variant="headline-3" tag="h3" className={styles.cardTitle}>
          Order Summary
        </Typography>
      </div>

      <div className={styles.cardContent}>
        {/* Merchant row */}
        <div className={styles.orderRow}>
          <Typography variant="body-1" className={styles.orderLabel}>Merchant:</Typography>
          <Typography variant="body-1" className={styles.orderValue}>{merchantName}</Typography>
        </div>

        {/* Total amount and total items row */}
        <div className={styles.orderRow}>
          <div className={styles.orderSubRow}>
            <Typography variant="body-1" className={styles.orderLabel}>Total (incl. shipping and tax)</Typography>
            <Typography variant="body-1" className={styles.orderValue}>{formatCurrency(parseFloat(overallAmount))}</Typography>
          </div>
          <div className={styles.orderSubRow}>
            <Typography variant="body-1" className={styles.orderLabel}>Total Items</Typography>
            <Typography variant="body-1" className={styles.orderValue}>{(totalItems > 1) ? `${totalItems} products` : `${totalItems} product`}</Typography>
          </div>
          <div className={styles.orderSubRow}>
            <Typography variant="body-1" className={styles.orderLabel}>Shipping Address</Typography>
            <Typography variant="body-1" className={styles.orderValue}>{SHIPPING_ADDRESS.addressLine1 || 'Not Provided'}</Typography>
          </div>
        </div>
      </div>
    </Surface>
  );
};

export default React.memo(OrderTotalCard);
/* END GENAI@CLAUDE */
