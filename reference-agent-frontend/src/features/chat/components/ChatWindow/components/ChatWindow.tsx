/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { Surface } from '@visa/nova-react';
import AuthorizePurchaseMessage from '../../AuthorizePurchaseMessage/components/AuthorizePurchaseMessage/AuthorizePurchaseMessage';
import BotMessage from '../../BotMessage/BotMessage';
import PurchaseConfirmationMessage from '../../PurchaseConfirmationMessage/PurchaseConfirmationMessage';
import ChatHeader from '../../ChatHeader/ChatHeader';
import ChatInputForm from '../../ChatInputForm/components/ChatInputForm';
import PaymentMethodMessage from '../../PaymentMethodMessage/components/PaymentMethodMessage/PaymentMethodMessage';
import ProductMessage from '../../ProductMessage/components/ProductMessage/ProductMessage';
import UserMessage from '../../UserMessage/UserMessage';
import styles from './ChatWindow.module.css';
import { useChatWindow } from '../hooks/useChatWindow';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type {
  ChatMessage,
  PaymentMethodMessage as PaymentMethodMessageType,
  AuthorizePurchaseMessage as AuthorizePurchaseMessageType,
  PurchaseConfirmationMessage as PurchaseConfirmationMessageType,
  AITextMessage,
  UserMessage as UserMessageType
} from '@/types';

/**
 * CHAT WINDOW COMPONENT
 * Origin: ChatWindow with Redux integration
 * Use: Main chat interface container with message display
 * Features: Message rendering, auto-scroll, loading states, responsive design
 */
export const ChatWindow: React.FC = () => {
    const messages = useSelector((state: RootState) => state.chat.messages);
    const loading = useSelector((state: RootState) => state.chat.loading);

    const {
        messagesEndRef,
    } = useChatWindow();

      return (
    <div className={styles.chatContainer}>
      <ChatHeader />
      <Surface className={styles.chatContent}>
      <div className={styles.chatMessages}>
        {messages.length === 0 ? (
          <BotMessage
            text="🎉 Welcome to your personal AI shopping assistant! I can help you discover amazing products, compare prices, and complete purchases seamlessly. What would you like to explore today?"
            timestamp={new Date().toISOString()}
          />
        ) : (
          messages.map((msg: ChatMessage, index: number) => {
            // Payment Method Messages
            if (msg.type === 'paymentMethod') {
              const paymentMethodMsg = msg as PaymentMethodMessageType;
              return (
                <PaymentMethodMessage
                  key={index}
                  messageIndex={index}
                  timestamp={paymentMethodMsg.timestamp}
                  isCompleted={paymentMethodMsg.isCompleted}
                />
              );
            }
            
            // Authorize Purchase Messages
            if (msg.type === 'authorizePurchase') {
              const authMsg = msg as AuthorizePurchaseMessageType;
              return (
                <AuthorizePurchaseMessage
                  key={index}
                  isCompleted={authMsg.isCompleted}
                  orderSummary={authMsg.orderSummary}
                />
              );
            }
            
            // Product Summary Messages
            if (msg.type === 'productSummary') {
              return (
                <ProductMessage 
                  key={index}
                  messageIndex={index}
                />
              );
            }
            
            // Purchase Confirmation Messages
            if (msg.type === 'purchaseConfirmation') {
              const purchaseConfirmationMsg = msg as PurchaseConfirmationMessageType;
              return (
                <PurchaseConfirmationMessage
                  key={index}
                  messageIndex={index}
                  timestamp={purchaseConfirmationMsg.timestamp}
                />
              );
            }
            
            // Regular Chat Messages - split by sender
            if (msg.sender === 'ai') {
              const aiMsg = msg as AITextMessage;
              return (
                <BotMessage
                  key={index}
                  text={aiMsg.text || ''}
                  timestamp={aiMsg.timestamp}
                />
              );
            }

            // User messages
            const userMsg = msg as UserMessageType;
            return (
              <UserMessage
                key={index}
                text={userMsg.text || ''}
                timestamp={userMsg.timestamp}
              />
            );
          })
        )}
        
        {/* Show thinking message when AI is processing */}
        {loading && (
          <BotMessage
            text="AI is thinking"
            isTyping={true}
            timestamp={new Date().toISOString()}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <ChatInputForm />
      </Surface>
    </div>
  );
};

export default ChatWindow;
