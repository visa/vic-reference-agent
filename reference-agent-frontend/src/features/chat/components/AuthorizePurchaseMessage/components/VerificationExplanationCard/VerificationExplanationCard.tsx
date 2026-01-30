/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { VisaInformationLow, VisaSecurityLow, VisaSecurityLockLow, VisaSuccessLow } from '@visa/nova-icons-react';
import { Surface, Typography } from '@visa/nova-react';
import styles from './VerificationExplanationCard.module.css';

const VerificationExplanationCard: React.FC = () => {
  return (
    <Surface className={styles.explanationCard}>
      <div className={styles.cardHeader}>
        <VisaInformationLow />
        <Typography variant="headline-3" tag="h3" className={styles.cardTitle}>
          Why we need verification
        </Typography>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.explanationItem}>
          <VisaSecurityLow />
          <div className={styles.itemText}>
            <Typography variant="body-2" className={styles.itemDescription}>
              Protects your account from unauthorized purchases
            </Typography>
          </div>
        </div>

        <div className={styles.explanationItem}>
          <VisaSecurityLockLow />
          <div className={styles.itemText}>
            <Typography variant="body-2" className={styles.itemDescription}>
              Prevents fraudulent transactions and keeps your money safe
            </Typography>
          </div>
        </div>

        <div className={styles.explanationItem}>
          <VisaSuccessLow style={{ '--v-icon-primary': 'var(--visa-blue)', '--v-icon-secondary': 'var(--visa-blue)' } as React.CSSProperties} />
          <div className={styles.itemText}>
            <Typography variant="body-2" className={styles.itemDescription}>
              Meets industry standards for secure online payments
            </Typography>
          </div>
        </div>
      </div>
    </Surface>
  );
};

export default React.memo(VerificationExplanationCard);
