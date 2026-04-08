/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Typography } from '@visa/nova-react';
import { VisaCartLow, VisaCardGenericLow, VisaArtificialIntelligenceLow, VisaQuestionLow, VisaMediaReplayLow } from '@visa/nova-icons-react';
import styles from './QuickActionButton.module.css';
import type { RootState, AppDispatch } from '@/store';
import { resetChat } from '@/features/chat/thunks/chatThunks';

interface QuickAction {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  query: string;
  handler?: (dispatch: AppDispatch) => void;
}

/**
 * QUICK ACTION BUTTON COMPONENT
 * Origin: QuickActionButton with predefined actions
 * Use: Displays quick action buttons for common chat queries
 * Features: Icon buttons, hover states, disabled state, responsive design
 */
const QUICK_ACTIONS: QuickAction[] = [
  { 
    icon: VisaCartLow, 
    label: 'Browse Products', 
    query: 'What products do you have available?'
  },
  { 
    icon: VisaCardGenericLow, 
    label: 'Payment Help', 
    query: 'How do I add a payment method?' 
  },
  { 
    icon: VisaArtificialIntelligenceLow, 
    label: 'Recommendations', 
    query: 'What do you recommend for me?'
  },
  { 
    icon: VisaQuestionLow, 
    label: 'Get Help', 
    query: 'How can you help me today?'
  },
  {
    icon: VisaMediaReplayLow,
    label: 'Start New Order',
    query: 'I want to start a new order',
    handler: (dispatch) => dispatch(resetChat())
  }
];

const QuickActionButton: React.FC<{
  onQuickAction: (query: string) => void;
  disabled?: boolean;
}> = ({ onQuickAction, disabled = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const conversationFlow = useSelector((state: RootState) => state.chat.conversationFlow);

  // Show all actions except "Start New Order" unless order flow is completed, then show only that one
  return (
    <div className={styles.quickActions}>
      {QUICK_ACTIONS
        .filter(action => 
          conversationFlow === 'completed'
            ? action.label === 'Start New Order' 
            : action.label !== 'Start New Order'
        )
        .map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={index}
              type="button"
              className={styles.quickActionButton}
              onClick={() => {
                if (action.handler) {
                  action.handler(dispatch);
                } else {
                  onQuickAction(action.query);
                }
              }}
              disabled={disabled}
            >
              <IconComponent className={styles.quickActionIcon} />
              <Typography variant="body-2" className={styles.quickActionLabel}>
                {action.label}
              </Typography>
            </Button>
          );
      })}
    </div>
  );
};

export default QuickActionButton;
