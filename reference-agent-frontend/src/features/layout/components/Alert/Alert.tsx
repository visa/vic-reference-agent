/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Banner, BannerCloseButton, BannerContent, MessageType } from '@visa/nova-react';
import { VisaCloseTiny } from '@visa/nova-icons-react'; 
import './Alert.css';

interface AlertProps {
  message?: string;
  messageType?: MessageType;
  duration?: number | null;
  onClose?: () => void;
}

type AnimationState = 'enter' | 'exit';

const Alert: React.FC<AlertProps> = ({ message, messageType = 'success', duration = 5000, onClose }) => {
  const [visible, setVisible] = useState<boolean>(true);
  const [animationState, setAnimationState] = useState<AnimationState>('enter');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!message) return;
    
    // Clear any existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    
    // Reset state on new message
    setVisible(true);
    setAnimationState('enter');
    
    if (duration === null) return; // Do not auto-dismiss if duration is null
    
    // Set timer to start exit animation
    timerRef.current = setTimeout(() => {
      setAnimationState('exit');
      
      // Actually remove the component after animation completes
      animationTimerRef.current = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 500); // Match this to the CSS animation duration
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, [message, duration, onClose]);

  const handleDismiss = () => {
    setAnimationState('exit');
    
    // Clear auto-dismiss timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Remove component after animation
    animationTimerRef.current = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 500); // Match this to the CSS animation duration
  };

  if (!message || !visible) return null;

  if (!messageType) {
    throw new Error("Message Type must be specified");
  }

  return (
    <div className={`floating-alert floating-alert-${animationState}`}>
      <Banner messageType='error'>
        <BannerContent>
          {message}
        </BannerContent>
        <BannerCloseButton onClick={handleDismiss}>
          <VisaCloseTiny />
        </BannerCloseButton>
      </Banner>
    </div>
  );
};

export default Alert;
