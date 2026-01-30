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
import { Typography } from '@visa/nova-react';
import styles from './PurchaseSummary.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { formatCurrency } from '../../../../../../utils/formattingUtils';
import { selectMessagePurchaseSummary } from '../../../../selectors/purchaseConfirmationSelectors';
import type { RootState } from '@/store';

const PurchaseSummary: React.FC<{
    messageIndex: number;
}> = ({ messageIndex }) => {
    const purchaseSummary = useSelector((state: RootState) => selectMessagePurchaseSummary(state, messageIndex));
    console.log('PurchaseSummary messageIndex:', messageIndex);
    console.log('purchaseSummary from selector:', purchaseSummary);
    if (!purchaseSummary) return null;
    const { merchant, overallAmount, orderId, trackingCode } = purchaseSummary;

    return (
        <div className={styles.summarySection}>
            <div className={styles.grid}>
            <div className={styles.row}>
                <Typography variant="body-3" className={styles.fieldLabel}>Merchant</Typography>
                <Typography variant="body-2" className={styles.fieldValue}>{merchant || '-'}</Typography>
            </div>
            <div className={styles.row}>
                <Typography variant="body-3" className={styles.fieldLabel}>Total</Typography>
                <Typography variant="body-2" className={styles.fieldValue}>{formatCurrency ? formatCurrency(Number(overallAmount) || 0) : overallAmount}</Typography>
            </div>
            <div className={styles.row}>
                <Typography variant="body-3" className={styles.fieldLabel}>Order ID</Typography>
                <Typography variant="body-2" className={styles.fieldValue}>{orderId || '-'}</Typography>
            </div>
            <div className={styles.row}>
                <Typography variant="body-3" className={styles.fieldLabel}>Tracking Code</Typography>
                <Typography variant="body-2" className={styles.fieldValue}>{trackingCode || '-'}</Typography>
            </div>
            </div>
        </div>
    );
};

export default PurchaseSummary;
/* END GENAI */
