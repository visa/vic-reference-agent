/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { Typography, Badge, Button } from '@visa/nova-react';
import { VisaDeviceVrHigh, VisaArtificialIntelligenceLow, VisaCartLow } from '@visa/nova-icons-react';
import styles from './ChatHeader.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartTotal, selectTotalQuantity } from '../../selectors/productSelectionSelectors';
import { formatCurrency } from '@/utils/formattingUtils';
import { AppDispatch } from '@/store';
import { resetChat } from '../../thunks/chatThunks';

/**
 * CHAT HEADER COMPONENT
 * Origin: ChatHeader with Redux integration
 * Use: Header bar for chat interface with bot info and cart summary
 * Features: Bot avatar, status indicator, cart display, responsive design
 */
const ChatHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const handleClearChat = () => {
      dispatch(resetChat());
  };

  const cartTotal = useSelector(selectCartTotal);
  const cartQuantity = useSelector(selectTotalQuantity);

  return (
    <div className={styles.header}>
      {/* Left Section - Bot Info */}
      <div className={styles.leftSection}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatar}>
            <VisaDeviceVrHigh className={styles.botIcon} />
          </div>
          <div className={styles.statusIndicator} />
        </div>
        <div className={styles.textInfo}>
          <Typography variant="headline-3" tag="h2" className={styles.title}>
            AI Shopping Assistant
          </Typography>
          <div className={styles.subtitle}>
            <VisaArtificialIntelligenceLow className={styles.sparklesIcon} style={{ '--v-icon-primary': 'var(--visa-white)', '--v-icon-secondary': 'var(--visa-white)' } as React.CSSProperties} />
            <Typography variant="body-2" className={styles.subtitleText}>
              Powered by Visa Intelligent Commerce
            </Typography>
          </div>
        </div>
      </div>

      {/* Right Section - Cart (Conditional) */}
      <Button
          className={styles.clearChatBtn}
          onClick={handleClearChat}
      >
          <Typography variant='body-2' className={styles.clearChatBtnTxt}>Clear Chat History</Typography>
      </Button>
      <div className={styles.cartSummary}>
        <div className={styles.cartInfo}>
          <VisaCartLow className={styles.cartIcon} style={{ '--v-icon-primary': 'var(--visa-white)', '--v-icon-secondary': 'var(--visa-white)' } as React.CSSProperties} />
          <Typography variant="body-2" className={styles.cartCount}>
            {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
          </Typography>
          <Badge badgeType="neutral" className={styles.totalBadge}>
            {formatCurrency(cartTotal)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatHeader);