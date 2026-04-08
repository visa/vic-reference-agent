/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { Surface, Typography } from '@visa/nova-react';
import { VisaDeviceVrHigh } from '@visa/nova-icons-react';
import styles from './BotMessage.module.css';
import type { Timestamp } from '@/types';

interface BotMessageProps {
  text?: string;
  timestamp?: Timestamp;
  isTyping?: boolean;
}

/**
 * BOT MESSAGE COMPONENT
 * Origin: BotMessage with typing indicator
 * Use: Displays bot/AI messages in the chat interface
 * Features: Avatar, message bubble, typing indicator, timestamp
 */
const BotMessage: React.FC<BotMessageProps> = ({ text, timestamp, isTyping = false }) => {
  return (
    <div className={styles.botMessageContainer}>
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          <VisaDeviceVrHigh className={styles.botIcon} />
        </div>
      </div>

      <div className={styles.messageContent}>
        <Surface className={styles.messageBubble}>
          {isTyping ? (
            <div className={styles.typingIndicator}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          ) : (
            <Typography variant="body-2" className={styles.messageText}>{text}</Typography>
          )}
        </Surface>

        {timestamp && !isTyping && (
          <Typography variant="body-3" className={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default BotMessage;
