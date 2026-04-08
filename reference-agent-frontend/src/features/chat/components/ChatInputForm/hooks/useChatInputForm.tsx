/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useDispatch, useSelector } from "react-redux";
import { sendChatMessage, processChatResponse } from '../../../thunks/chatThunks';
import { setInput } from '@/features/chat/slices/chatSlice';
import type { AppDispatch, RootState } from '@/store';
import type { ChangeEvent, KeyboardEvent, FormEvent } from 'react';

export const useChatInputForm = () => {
    const dispatch = useDispatch<AppDispatch>();
    const input = useSelector((state: RootState) => state.chat.input);

    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const { value } = event.target;
        dispatch(setInput(value));
    }

    const handleSendMessage = async (e?: FormEvent<HTMLFormElement>, quickActionQuery?: string) => {
        if (e) {
            e.preventDefault();
        }

        // Use quickActionQuery if provided, otherwise use input from state
        const messageToSend = quickActionQuery || input;

        // Don't send if input is empty or only whitespace
        if (!messageToSend.trim()) {
            return;
        }

        // If using quick action, update the input state
        if (quickActionQuery) {
            dispatch(setInput(quickActionQuery));
        }

        try {
            // Send message and get response
            const result = await dispatch(sendChatMessage()).unwrap();

            // Process the AI response
            if (result.response) {
                console.log('result.response:', result.response);
                await dispatch(processChatResponse({ response: result.response }));
            }
        } catch (error) {
            console.error('Chat message failed:', error);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
                handleSendMessage();
            }
        }
    };

    const handleQuickAction = (query: string) => {
        // Send the message immediately with the query
        handleSendMessage(undefined, query);
    };

    return {
        handleInputChange,
        handleSendMessage,
        handleKeyDown,
        handleQuickAction
    };
}
