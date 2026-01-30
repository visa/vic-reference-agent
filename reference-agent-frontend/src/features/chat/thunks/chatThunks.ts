/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../../lib/api';
import { transformAcceptedProductsForApi } from '../../../utils/formattingUtils';
import {
    addMessage,
    setLoading,
    setIsTyping,
    clearInput,
    setConversationFlow,
    updateMessage,
    startNewConversation,
} from '../slices/chatSlice';
import {
    setOrderSummary,
    clearOrderSummary,
} from '../slices/orderSummarySlice';
import {
    resetProducts,
} from '../slices/productSelectionSlice';
import {
    clearSelectedCard,
    setSelectedCard,
} from '../slices/paymentMethodSlice';
import {
    setProducts,
    setAcceptedProducts,
} from '../slices/productSelectionSlice';
import {
    setPurchaseConfirmation,
} from '../slices/purchaseConfirmationSlice';
import {
    resolveAuthorizationFlow,
    rejectAuthorizationFlow,
    closeAuthorizationFlow
} from '../../payment/thunks/paymentAuthorizationThunks';
import { createIntent } from './paymentIntentsThunks';
import { buildIntentPayload } from '../../../utils/chatUtils';
import {
    ChatMessage,
    UserMessage,
    AITextMessage,
    MessageProducts,
    AcceptedProducts,
    AllProducts,
    PaymentMethodMessage,
    ProductSummaryMessage,
    AuthorizePurchaseMessage,
    PurchaseConfirmationMessage,
    ProductData,
    SendChatMessageResult,
    ProcessChatResponseResult,
    ResponseProduct,
    BaseChatRequest,
    ChatMessageData,
    PasskeyResult,
    CreateAgenticIntentRequest,
    CreateAgenticIntentData,
    PaymentCompletionResult,
    CreateIntentResult,
    OrderSummary
} from '@/types';
import {
    RootState
} from '../../../store/index';
import { getDeviceInfo, mapDeviceInfoForVIC } from '@/utils';

/**
 * Sends user message to chat API and receives AI response
 */
export const sendChatMessage = createAsyncThunk<SendChatMessageResult>(
    'chat/sendChatMessage',
    async (_, { dispatch, getState, rejectWithValue }) => {
        console.log("SendChatMessage CALLED")
        try {
            const state = getState() as RootState;
            const { input }: { input: string } = state.chat;
            const { acceptedProducts }: { acceptedProducts: AcceptedProducts } = state.productSelection;
            const { allProducts: allProductsByMessage }: { allProducts: AllProducts } = state.productSelection;

            const productsArray: ResponseProduct[] = Object.values(acceptedProducts).reduce((allProducts: ResponseProduct[], messageProducts: MessageProducts) => {
                const messageProductsArray: ResponseProduct[] = Object.entries(messageProducts)
                    .filter(([_, productData]) => productData.accepted)
                    .map(([productName, productData]): ResponseProduct => {
                        let originalProduct: ResponseProduct | null = null;
                        for (const messageIndex in allProductsByMessage) {
                            const messageProductsList = allProductsByMessage[messageIndex];
                            originalProduct = messageProductsList?.find((p: ResponseProduct) => p.name === productName) || null;
                            if (originalProduct) break;
                        }

                        return {
                            name: productName,
                            price: productData.price,
                            quantity: productData.quantity,
                            sku: originalProduct?.sku || '',
                            image: originalProduct?.image,
                            description: originalProduct?.description,
                            productId: originalProduct?.sku
                        } as ResponseProduct;
                    });
                return allProducts.concat(messageProductsArray);
            }, [] as ResponseProduct[]);

            const userMessage: UserMessage = { text: input, sender: 'user', timestamp: new Date().toISOString() };
            dispatch(addMessage(userMessage));

            dispatch(clearInput());

            dispatch(setLoading(true));
            dispatch(setIsTyping(true));

            const chatRequest: BaseChatRequest = {
                message: input,
                products: productsArray,
                last_4: null
            };
            const response: ChatMessageData = await ApiService.chat(chatRequest);

            return {
                response
            };

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error sending chat message:', error);

            const errorMessage: AITextMessage = {
                text: 'Failed to get a response from the server.',
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            dispatch(addMessage(errorMessage));

            return rejectWithValue(message);
        } finally {
            dispatch(setLoading(false));
            dispatch(setIsTyping(false));
        }
    }
);

/**
 * Processes AI chat response and creates appropriate message types
 */
export const processChatResponse = createAsyncThunk<ProcessChatResponseResult | void, SendChatMessageResult>(
    'chat/processChatResponse',
    async ({ response }: SendChatMessageResult, { dispatch, getState }) => {
        try {
            if (response.orderSummary) {
                dispatch(setConversationFlow('paymentFlow'));

                const orderSummary: OrderSummary = {
                    overallAmount: response.orderSummary.overallAmount,
                    merchantName: response.orderSummary.merchantName,
                }

                dispatch(setOrderSummary({
                    orderSummary: orderSummary,
                }));

                const paymentMethodMessage: PaymentMethodMessage = {
                    type: 'paymentMethod',
                    sender: 'ai',
                    isCompleted: false,
                    timestamp: new Date().toISOString()
                };
                console.log("PaymentMethodMessage dispatched.")
                dispatch(addMessage(paymentMethodMessage));

            } else if (response.products && response.products.length > 0) {
                console.log(response)
                dispatch(setConversationFlow('orderFlow'));

                const state = getState() as RootState;
                const messages: ChatMessage[] = state.chat.messages;
                let messageIndex: number = messages.length;

                // Add AI response message
                const messageText: AITextMessage = {
                    text: response.responseMessage,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                };
                dispatch(addMessage(messageText));
                messageIndex++;

                // Add single ProductSummaryMessage with all products
                const productMessage: ProductSummaryMessage = {
                    type: 'productSummary',
                    products: response.products,
                    sender: 'ai',
                    showCartCard: true
                };
                dispatch(addMessage(productMessage));
                dispatch(setProducts({ messageIndex, products: response.products }));

                return {
                    messageType: 'productSummary',
                    products: response.products
                } as ProcessChatResponseResult;

            } else {
                const aiMessage: AITextMessage = {
                    text: response.responseMessage,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                };
                dispatch(addMessage(aiMessage));

                dispatch(setConversationFlow('idle'));
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error processing chat response:', message);

            const errorMessage: AITextMessage = {
                text: 'Failed to process the response.',
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
            dispatch(addMessage(errorMessage));

            throw error;
        }
    }
);

/**
 * Completes payment method selection and transitions to authorization flow
 */
export const completePaymentMethodMessage = createAsyncThunk(
    'chat/completePaymentMethodMessage',
    async ({ messageIndex, selectedCard }: { messageIndex: number; selectedCard: string }, { dispatch, getState }) => {
        const state = getState() as RootState;
        const orderSummarySlice = state.orderSummary;
        const orderSummary = orderSummarySlice.orderSummary;

        dispatch(setConversationFlow('authFlow'));

        dispatch(setSelectedCard(selectedCard));

        dispatch(updateMessage({
            index: messageIndex,
            updates: {
                isCompleted: true,
                selectedCard
            }
        }));

        const authorizePurchaseMessage = {
            type: 'authorizePurchase',
            orderSummary: orderSummary,
            sender: 'ai',
            isCompleted: false,
            timestamp: new Date().toISOString()
        } as AuthorizePurchaseMessage;

        dispatch(addMessage(authorizePurchaseMessage));
    }
);

/**
 * Completes authorization purchase message after payment processing
 */
export const completeAuthorizePurchaseMessage = createAsyncThunk<PaymentCompletionResult, { messageIndex: number; result: PaymentCompletionResult }, { rejectValue: string }>(
    'chat/completeAuthorizePurchaseMessage',
    async ({ messageIndex, result }, { dispatch, getState, rejectWithValue }) => {
        try {
            dispatch(setConversationFlow(result.success ? 'completed' : 'authFlow'));

            const state = getState() as RootState;
            const chatSlice = state.chat;

            dispatch(updateMessage({
                index: messageIndex,
                updates: {
                    isCompleted: true,
                    result
                }
            }));

            console.log("DEBUG: About to check for purchaseConfirmation message addition, result.success:", result.success);
            console.log("result:", result);

            if (result.success) {
                const messages = chatSlice.messages;
                const messageIndex = messages.length;

                console.log("DEBUG: result.purchaseSummary", result.purchaseSummary);
                console.log("DEBUG: messageIndex for credentials:", messageIndex);

                dispatch(setPurchaseConfirmation({
                    messageIndex,
                    orderItems: result.orderItems,
                    purchaseSummary: result.purchaseSummary || null
                }));

                const purchaseConfirmationMessage = {
                    type: 'purchaseConfirmation',
                    orderItems: result.orderItems,
                    purchaseSummary: result.purchaseSummary || null,
                    sender: 'ai',
                    timestamp: new Date().toISOString()
                } as PurchaseConfirmationMessage;

                console.log("DEBUG: Adding purchaseConfirmation message:", purchaseConfirmationMessage);
                dispatch(addMessage(purchaseConfirmationMessage));
            }

            return result;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("ERROR in completeAuthorizePurchaseMessage:", error);
            return rejectWithValue(message);
        }
    }
);

/**
 * Processes passkey payment completion and creates payment intent
 */
export const processPasskeyCompletion = createAsyncThunk<{wasSuccessful: boolean; result: PaymentCompletionResult; payload: PasskeyResult}, { payload: PasskeyResult }, {state: RootState}>(
    'chat/processPasskeyCompletion',
    async ({ payload }, { dispatch, getState, rejectWithValue }) => {
        try {
            console.log("processPasskeyCompletion called with payload:", payload);
            const state = getState() as RootState;
            const orderSummarySlice = state.orderSummary;
            const productSelection = state.productSelection;

            const acceptedProducts = productSelection.acceptedProducts;
            const orderSummary = orderSummarySlice.orderSummary;

            const { allProducts: allProductsByMessage } = productSelection;
            const productsArray = transformAcceptedProductsForApi(acceptedProducts, allProductsByMessage);

            dispatch(setLoading(true));
            dispatch(setIsTyping(true));

            let wasSuccessful = false;

            try {
                if (!orderSummary) {
                    throw new Error("Order summary is required");
                }

                const deviceInfo = getDeviceInfo();
                const deviceData = mapDeviceInfoForVIC(deviceInfo);

                const payloadResult: CreateAgenticIntentRequest = buildIntentPayload(
                    payload,
                    orderSummary,
                    productsArray,
                    deviceData
                );

                if (!payloadResult) {
                    throw new Error("Failed to build intent payload.");
                }

                console.log("DEBUG: About to call createIntent thunk with payload:", payloadResult);
                console.log("DEBUG: Dispatching createIntent thunk now...");

                const intentResult = await dispatch(createIntent(payloadResult)).unwrap();
                const intentResponse: CreateAgenticIntentData = intentResult.response;
                console.log("DEBUG: intentResponse from thunk.response:", intentResponse);

                console.log("DEBUG: About to create result object");
                console.log("DEBUG: acceptedProducts type:", typeof acceptedProducts, acceptedProducts);
                console.log("DEBUG: productsArray type:", typeof productsArray, productsArray);
                console.log("DEBUG: intentResponse from thunk:", intentResponse);

                const result = {
                    success: intentResponse.purchaseSummary != null,
                    message: {
                        text: intentResponse.message,
                        sender: 'ai',
                        timestamp: new Date().toISOString()
                    },
                    response: intentResponse,
                    orderItems: productsArray.map(product => ({
                        name: product.name,
                        quantity: product.quantity,
                        price: product.price.toString()
                    })),
                    purchaseSummary: intentResponse.purchaseSummary || null,
                } as PaymentCompletionResult;

                console.log("DEBUG: Final result object:", result);
                console.log("DEBUG: result.success:", result.success);
                console.log("DEBUG: result.message.text:", result.message.text);

                const messages = state.chat.messages;
                const authorizeMessageIndex = messages.findIndex((msg: ChatMessage) => msg.type === 'authorizePurchase' && !(msg as AuthorizePurchaseMessage).isCompleted);

                if (authorizeMessageIndex !== -1) {
                    console.log("DEBUG: Completing authorizePurchase message at index:", authorizeMessageIndex);
                    try {
                        const completeResult = await dispatch(completeAuthorizePurchaseMessage({
                            messageIndex: authorizeMessageIndex,
                            result
                        })).unwrap();
                        console.log("DEBUG: completeAuthorizePurchaseMessage result:", completeResult);
                    } catch (error) {
                        console.error("DEBUG: Error in completeAuthorizePurchaseMessage:", error);
                    }
                } else {
                    console.log("DEBUG: No incomplete authorizePurchase message found");
                }

                if (result.success) {
                    console.log("DEBUG: Entering success path");
                    wasSuccessful = true;

                    console.log("DEBUG: Dispatching resolveAuthorizationFlow with:", result.response);
                    dispatch(resolveAuthorizationFlow(result.response));

                    console.log("DEBUG: Dispatching state cleanup actions");
                    dispatch(setConversationFlow('completed'));
                    dispatch(clearOrderSummary());
                } else {
                    dispatch(addMessage(result.message));

                    dispatch(rejectAuthorizationFlow(new Error(result.message.text)));
                }

                return {
                    wasSuccessful,
                    result,
                    payload
                };

            } catch (intentError: unknown) {
                const message = intentError instanceof Error ? intentError.message : 'Unknown error during intent creation';
                console.error("Create intent API error message:", message);
                dispatch(rejectAuthorizationFlow(new Error(message)));
                throw intentError;
            }

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("processPasskeyCompletion error:", error);

            const errorMessage = {
                text: 'Payment processing failed. Please try again.',
                sender: 'ai'
            };
            dispatch(addMessage(errorMessage));

            return rejectWithValue(message);
        } finally {
            dispatch(setLoading(false));
            dispatch(setIsTyping(false));
        }
    }
);

/**
 * Handles passkey modal closure and authorization cleanup
 */
export const handlePasskeyClose = createAsyncThunk<void, { wasSuccessful?: boolean }, { state: RootState }>(
    'chat/handlePasskeyClose',
    async ({ wasSuccessful = false }, { dispatch }) => {
        try {
            dispatch(closeAuthorizationFlow({ wasSuccessful }));

            if (wasSuccessful) {
                dispatch(setConversationFlow('completed'));
                dispatch(clearOrderSummary());
            }

        } catch (error) {
            console.error("handlePasskeyClose error:", error);
            throw error;
        }
    }
);

/**
 * Resets chat session on backend and clears all frontend state
 */
export const resetChat = createAsyncThunk<void, void, { state: RootState }>(
    'chat/resetChat',
    async (_, { dispatch }) => {
        try {
            await ApiService.resetChat();
            dispatch(startNewConversation());
            dispatch(clearOrderSummary());
            dispatch(clearSelectedCard());
            dispatch(resetProducts());
        } catch (error) {
            console.error('Error resetting chat:', error);
            throw error;
        }
    }
);
/* END GENAI */
