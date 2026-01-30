/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
// === CHAT MIDDLEWARE ===

import { ChatMessage } from '@/types';
import { Middleware, MiddlewareAPI, Action } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from '@/store';
import { setPurchaseConfirmation } from '@/features/chat/slices/purchaseConfirmationSlice';
import {
    addMessage,
    setMessages,
    clearMessages,
    startNewConversation,
    setConversationFlow
} from '@/features/chat/slices/chatSlice';
import { setProducts, setAcceptedProducts } from '@/features/chat/slices/productSelectionSlice';
import { setOrderSummary, clearOrderSummary } from '@/features/chat/slices/orderSummarySlice';
import { setSelectedCard, clearSelectedCard } from '@/features/chat/slices/paymentMethodSlice';

// === PERSISTENCE CONSTANTS ===
const CHAT_MESSAGES_KEY = 'chatMessages';
const CART_KEY = 'cart';
const ORDER_SUMMARY_KEY = 'orderSummary';
const SELECTED_CARD_KEY = 'selectedCard';

// === PERSISTENCE UTILITIES ===

const clearPersistedMessages = () => {
    try {
        localStorage.removeItem(CHAT_MESSAGES_KEY);
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem(ORDER_SUMMARY_KEY);
        localStorage.removeItem(SELECTED_CARD_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing persisted messages:', error);
        return false;
    }
};

// === CART PERSISTENCE UTILITIES ===

const saveCartToLocalStorage = (acceptedProducts: Record<number, Record<string, any>>) => {
    try {
        if (Object.keys(acceptedProducts).length > 0) {
            localStorage.setItem(CART_KEY, JSON.stringify(acceptedProducts));
        }
        return true;
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
        return false;
    }
};

const loadPersistedCart = (dispatch: AppDispatch) => {
    try {
        const savedCart = localStorage.getItem(CART_KEY);
        if (savedCart) {
            const parsedCart = JSON.parse(savedCart);

            // Restore acceptedProducts for each message index
            Object.entries(parsedCart).forEach(([messageIndex, acceptedProducts]) => {
                dispatch(setAcceptedProducts({
                    messageIndex: parseInt(messageIndex, 10),
                    acceptedProducts
                }));
            });

            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading persisted cart:', error);
        localStorage.removeItem(CART_KEY);
        return false;
    }
};

const clearPersistedCart = () => {
    try {
        localStorage.removeItem(CART_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing persisted cart:', error);
        return false;
    }
};

// === ORDER SUMMARY PERSISTENCE UTILITIES ===

const saveOrderSummaryToLocalStorage = (orderSummary: any) => {
    try {
        if (orderSummary) {
            localStorage.setItem(ORDER_SUMMARY_KEY, JSON.stringify(orderSummary));
        } else {
            localStorage.removeItem(ORDER_SUMMARY_KEY);
        }
        return true;
    } catch (error) {
        console.error('Error saving orderSummary to localStorage:', error);
        return false;
    }
};

const loadPersistedOrderSummary = (dispatch: AppDispatch) => {
    try {
        const savedOrderSummary = localStorage.getItem(ORDER_SUMMARY_KEY);
        if (savedOrderSummary) {
            const parsedOrderSummary = JSON.parse(savedOrderSummary);
            dispatch(setOrderSummary({ orderSummary: parsedOrderSummary }));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading persisted orderSummary:', error);
        localStorage.removeItem(ORDER_SUMMARY_KEY);
        return false;
    }
};

const clearPersistedOrderSummary = () => {
    try {
        localStorage.removeItem(ORDER_SUMMARY_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing persisted orderSummary:', error);
        return false;
    }
};

// === SELECTED CARD PERSISTENCE UTILITIES ===

const saveSelectedCardToLocalStorage = (selectedCard: string | null) => {
    try {
        if (selectedCard) {
            localStorage.setItem(SELECTED_CARD_KEY, selectedCard);
        } else {
            localStorage.removeItem(SELECTED_CARD_KEY);
        }
        return true;
    } catch (error) {
        console.error('Error saving selectedCard to localStorage:', error);
        return false;
    }
};

const loadPersistedSelectedCard = (dispatch: AppDispatch) => {
    try {
        const savedSelectedCard = localStorage.getItem(SELECTED_CARD_KEY);
        if (savedSelectedCard) {
            dispatch(setSelectedCard(savedSelectedCard));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading persisted selectedCard:', error);
        localStorage.removeItem(SELECTED_CARD_KEY);
        return false;
    }
};

const clearPersistedSelectedCard = () => {
    try {
        localStorage.removeItem(SELECTED_CARD_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing persisted selectedCard:', error);
        return false;
    }
};

const exportMessages = () => {
    try {
        return localStorage.getItem(CHAT_MESSAGES_KEY);
    } catch (error) {
        console.error('Error exporting messages:', error);
        return null;
    }
};

const importMessages = (messagesJson: string, dispatch: AppDispatch) => {
    try {
        const parsedMessages = JSON.parse(messagesJson);
        
        // Validate message structure
        if (!Array.isArray(parsedMessages)) {
            throw new Error('Invalid message format: not an array');
        }
        
        // Update Redux state
        dispatch(setMessages(parsedMessages));
        
        // Save to localStorage
        localStorage.setItem(CHAT_MESSAGES_KEY, messagesJson);
        
        return true;
    } catch (error) {
        console.error('Error importing messages:', error);
        return false;
    }
};

const loadPersistedMessages = (dispatch: AppDispatch) => {
    try {
        const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
        if (savedMessages) {
            const parsedMessages = JSON.parse(savedMessages);
            
            // Validate message structure
            if (Array.isArray(parsedMessages)) {
                dispatch(setMessages(parsedMessages));
                
                // Restore product data for product messages
                parsedMessages.forEach((message, messageIndex) => {
                    if (message.type === 'productSummary' && message.products) {
                        dispatch(setProducts({ messageIndex, products: message.products }));
                    } else if (message.type === 'purchaseConfirmation') {
                        dispatch(setPurchaseConfirmation({
                            messageIndex,
                            orderItems: message.orderItems,
                            purchaseSummary: message.purchaseSummary
                        }));
                    }
                });

                // Restore cart (acceptedProducts) state
                loadPersistedCart(dispatch);

                // Restore orderSummary from localStorage (for paymentMethod step)
                loadPersistedOrderSummary(dispatch);

                // Restore selectedCard from localStorage
                loadPersistedSelectedCard(dispatch);

                // Restore conversationFlow state based on message types
                // Check messages in reverse order to find the most recent flow state
                for (let i = parsedMessages.length - 1; i >= 0; i--) {
                    const message = parsedMessages[i];
                    if (message.type === 'purchaseConfirmation') {
                        dispatch(setConversationFlow('completed'));
                        break;
                    } else if (message.type === 'authorizePurchase' && !message.isCompleted) {
                        dispatch(setConversationFlow('authFlow'));
                        break;
                    } else if (message.type === 'paymentMethod' && !message.isCompleted) {
                        dispatch(setConversationFlow('paymentFlow'));
                        break;
                    } else if (message.type === 'productSummary') {
                        dispatch(setConversationFlow('orderFlow'));
                        break;
                    }
                }

                return true;
            } else {
                throw new Error('Invalid message format: not an array');
            }
        }
        return false;
    } catch (error) {
        console.error('Error parsing saved messages:', error);
        localStorage.removeItem(CHAT_MESSAGES_KEY);
        return false;
    }
};

const saveMessagesToLocalStorage = (messages: ChatMessage[]) => {
    try {
        if (messages.length > 0) {
            localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
        }
        return true;
    } catch (error) {
        console.error('Error saving messages to localStorage:', error);
        return false;
    }
};

// === AUTO-SCROLL SIDE EFFECT ===
const triggerAutoScroll = () => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
        const messagesEndElement = document.querySelector('[data-chat-messages-end]');
        if (messagesEndElement) {
            messagesEndElement.scrollIntoView({ behavior: "smooth" });
        }
    }, 100);
};

// === MAIN MIDDLEWARE ===

export const chatMiddleware = (
    (store: MiddlewareAPI<AppDispatch, RootState>) => 
    (next: any) => 
    (action: any) => {
    // Process action first
    const result = next(action);
    
    // Get current state after action
    const state = store.getState();
    const chatState = state.chat;
    const productSelectionState = state.productSelection;

    // === MESSAGE PERSISTENCE LOGIC ===

    if (
        action.type === addMessage.type ||
        action.type === setMessages.type ||
        action.type.startsWith('chat/updateMessage') ||
        action.type.startsWith('chat/completePaymentMethodMessage') ||
        action.type.startsWith('chat/completeAuthorizePurchaseMessage')
    ) {
        saveMessagesToLocalStorage(chatState.messages);
        // Save cart state alongside messages
        saveCartToLocalStorage(productSelectionState.acceptedProducts);

        if (action.type === addMessage.type) {
            triggerAutoScroll();
        }
    }

    // === CART PERSISTENCE LOGIC ===
    if (
        action.type === setAcceptedProducts.type ||
        action.type.startsWith('productSelection/updateQuantity')
    ) {
        saveCartToLocalStorage(productSelectionState.acceptedProducts);
    }

    // === ORDER SUMMARY PERSISTENCE LOGIC ===
    if (action.type === setOrderSummary.type) {
        saveOrderSummaryToLocalStorage(state.orderSummary.orderSummary);
    }
    if (action.type === clearOrderSummary.type) {
        clearPersistedOrderSummary();
    }

    // === SELECTED CARD PERSISTENCE LOGIC ===
    if (action.type === setSelectedCard.type) {
        saveSelectedCardToLocalStorage(state.paymentMethod.selectedCard);
    }
    if (action.type === clearSelectedCard.type) {
        clearPersistedSelectedCard();
    }
    
    if (
        action.type === clearMessages.type ||
        action.type === startNewConversation.type
    ) {
        clearPersistedMessages();
    }
    
    // === CUSTOM ACTION HANDLING ===
    // NOTE: These are convenience actions - main functionality handled via regular Redux actions
    
    if (action.type === 'chat/loadPersistedMessages') {
        loadPersistedMessages(store.dispatch);
    }
    
    if (action.type === 'chat/exportMessages') {
        // Store export result in a way components can access it
        // This could be enhanced to use a callback or promise
        const exported = exportMessages();
        console.log('Messages exported:', exported);
    }
    
    if (action.type === 'chat/importMessages') {
        const success = importMessages(action.payload, store.dispatch);
        console.log('Messages import result:', success);
    }
    
    if (action.type === 'chat/clearPersistedMessages') {
        const success = clearPersistedMessages();
        console.log('Clear persisted messages result:', success);
    }

    if (action.type === 'chat/clearPersistedCart') {
        const success = clearPersistedCart();
        console.log('Clear persisted cart result:', success);
    }

    return result;
}) as Middleware;

// === MIDDLEWARE UTILITIES FOR COMPONENTS ===

export const chatPersistenceUtils = {
    clearPersistedMessages,
    exportMessages,
    importMessages: (messagesJson: string, dispatch: AppDispatch) => importMessages(messagesJson, dispatch),
    loadPersistedMessages: (dispatch: AppDispatch) => loadPersistedMessages(dispatch),
    clearPersistedCart,
    loadPersistedCart: (dispatch: AppDispatch) => loadPersistedCart(dispatch),
};

// === PERSISTENCE ACTION CREATORS ===

// Custom actions that components can dispatch to trigger persistence operations
export const persistenceActions = {
    loadPersistedMessages: () => ({ type: 'chat/loadPersistedMessages' }),
    exportMessages: () => ({ type: 'chat/exportMessages' }),
    importMessages: (messagesJson: string) => ({ type: 'chat/importMessages', payload: messagesJson }),
    clearPersistedMessages: () => ({ type: 'chat/clearPersistedMessages' }),
    clearPersistedCart: () => ({ type: 'chat/clearPersistedCart' }),
};
/* END GENAI */
