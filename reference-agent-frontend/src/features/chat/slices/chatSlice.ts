/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { InitialChatState } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

// === CHAT SLICE ===
const initialState: InitialChatState = {
    messages: [], 
    input: '',
    loading: false,
    isTyping: false,
    conversationFlow: 'idle',
}

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        // === MESSAGE MANAGEMENT ===
        
        addMessage: (state, action) => {
            const messageWithTimestamp = {
                ...action.payload,
                timestamp: action.payload.timestamp || new Date().toISOString()
            };
            state.messages.push(messageWithTimestamp);
        },
        
        updateMessage: (state, action) => {
            const { index, updates } = action.payload;
            if (state.messages[index]) {
                Object.assign(state.messages[index], updates);
            }
        },
        
        setMessages: (state, action) => {
            state.messages = action.payload;
        },
        
        clearMessages: (state) => {
            state.messages = [];
            state.input = '';
            state.loading = false;
            state.isTyping = false;
        },
        
        // === INPUT MANAGEMENT ===
        
        setInput: (state, action) => {
            state.input = action.payload;
        },
        
        clearInput: (state) => {
            state.input = '';
        },
        
        // === LOADING STATES ===
        
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        
        setIsTyping: (state, action) => {
            state.isTyping = action.payload;
        },
        
        // === CONVERSATION MANAGEMENT ===

        startNewConversation: (state) => {
            state.messages = [];
            state.input = '';
            state.loading = false;
            state.isTyping = false;
            state.conversationFlow = 'idle';
        },
        
        // === FLOW STATE MANAGEMENT ===
        
        setConversationFlow: (state, action) => {
            state.conversationFlow = action.payload;
        },
    }
});

export const {
    addMessage,
    updateMessage,
    setMessages,
    clearMessages,
    setInput,
    clearInput,
    setLoading,
    setIsTyping,
    startNewConversation,
    setConversationFlow,
} = chatSlice.actions;

export default chatSlice.reducer;
