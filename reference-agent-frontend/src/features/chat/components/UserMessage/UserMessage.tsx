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
import { VisaAccountLow } from '@visa/nova-icons-react';
import styles from './UserMessage.module.css';

interface UserMessageProps {
  text: string;
  timestamp?: string;
}

/**
 * USER MESSAGE COMPONENT
 * Origin: UserMessage with timestamp
 * Use: Displays user messages in the chat interface
 * Features: Avatar, message bubble, timestamp, right-aligned
 */
const UserMessage: React.FC<UserMessageProps> = ({ text, timestamp }) => {
  return (
    <div className={styles.userMessageContainer}>
      <div className={styles.messageContent}>
        <Surface className={styles.messageBubble}>
          <Typography variant="body-2" className={styles.messageText}>{text}</Typography>
        </Surface>

        {timestamp && (
          <Typography variant="body-3" className={styles.timestamp}>
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Typography>
        )}
      </div>
      
      <div className={styles.avatarContainer}>
        <div className={styles.avatar}>
          <VisaAccountLow className={styles.userIcon} style={{ '--v-icon-primary': 'var(--visa-white)', '--v-icon-secondary': 'var(--visa-white)' } as React.CSSProperties} />
        </div>
      </div>
    </div>
  );
};

export default UserMessage;
