/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useEffect, useRef } from 'react';
import { Button, Input, InputContainer } from '@visa/nova-react';
import { VisaSendLow } from '@visa/nova-icons-react';
import styles from './ChatInputForm.module.css';
import { useSelector } from 'react-redux';
import { useChatInputForm } from '../hooks/useChatInputForm';
import QuickActionButton from './QuickActionButton/QuickActionButton';
import type { RootState } from '@/store';

const MAX_HEIGHT = 150;

/**
 * CHAT INPUT FORM COMPONENT
 * Origin: ChatInputForm with Redux integration
 * Use: Input area for user messages with auto-resizing textarea
 * Features: Auto-resize textarea, send button, loading state, quick actions
 */
const ChatInputForm: React.FC = () => {
  const { handleInputChange, handleSendMessage, handleKeyDown, handleQuickAction } = useChatInputForm();
  const input = useSelector((state: RootState) => state.chat.input);
  const loading = useSelector((state: RootState) => state.chat.loading);
  const conversationFlow = useSelector((state: RootState) => state.chat.conversationFlow);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const orderCompleted = conversationFlow === 'completed';

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      let newHeight = textarea.scrollHeight;
      if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY = newHeight >= MAX_HEIGHT ? 'auto' : 'hidden';
    }
  }, [input]);
  
  return (
    <div>
      <form className={styles.chatInputForm} onSubmit={handleSendMessage}>
        <InputContainer className={styles.textareaContainer}>
          <Input
            ref={textareaRef}
            tag="textarea"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            rows={1}
            disabled={loading || orderCompleted}
            aria-label="Type your message"
            aria-describedby="send-button"
          />
        </InputContainer>

        <Button
          type="submit"
          className={styles.sendButton}
          disabled={!input.trim() || loading || orderCompleted}
          aria-label={loading ? "Sending message..." : "Send message"}
          id="send-button"
        >
          {loading ? (
            <div className={styles.spinner} aria-hidden="true" />
          ) : (
            <VisaSendLow className={styles.sendIcon} />
          )}
        </Button>
      </form>
      
      {/* Quick Action Buttons */}
      <QuickActionButton 
        onQuickAction={handleQuickAction} 
        disabled={loading} 
      />
    </div>
  );
};

export default ChatInputForm;
