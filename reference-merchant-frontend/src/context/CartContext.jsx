/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useToast } from './ToastContext';

const CartContext = createContext();

const initialState = {
  cart: null,
  sessionId: null,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'SET_SESSION_ID':
      return { ...state, sessionId: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { showSuccess, showError } = useToast();

  // Initialize cart session
  useEffect(() => {
    const initializeCart = async () => {
      console.log('🛒 [CART] Initializing cart...');
      let sessionId = localStorage.getItem('cartSessionId');
      console.log('🛒 [CART] SessionId from localStorage:', sessionId);

      if (!sessionId) {
        console.log('🛒 [CART] No sessionId found, creating new cart...');
        try {
          const response = await cartAPI.createCart();
          sessionId = response.data.session_id;
          localStorage.setItem('cartSessionId', sessionId);
          console.log('🛒 [CART] New cart created with sessionId:', sessionId);
        } catch (error) {
          console.error('🛒 [CART] ❌ Failed to create cart:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize cart' });
          return;
        }
      }

      console.log('🛒 [CART] Setting sessionId in state:', sessionId);
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
      await loadCart(sessionId);
      console.log('🛒 [CART] ✅ Cart initialization complete');
    };

    initializeCart();
  }, []);

  const loadCart = async (sessionId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await cartAPI.getCart(sessionId);
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error) {
      console.error('Failed to load cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    console.log('🛒 [CART] addToCart called with:', { productId, quantity });
    console.log('🛒 [CART] Current state.sessionId:', state.sessionId);
    console.log('🛒 [CART] Current state:', state);

    if (!state.sessionId) {
      console.error('🛒 [CART] ❌ No sessionId available! Cannot add to cart.');
      showError('Cart is not ready yet. Please try again.');
      return;
    }

    console.log('🛒 [CART] Calling API to add item to cart...');
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await cartAPI.addItemToCart(state.sessionId, {
        product_id: productId,
        quantity: quantity,
      });
      console.log('🛒 [CART] ✅ Item added successfully:', response.data);
      dispatch({ type: 'SET_CART', payload: response.data });

      // Show success toast
      const addedItem = response.data.items.find(item => item.product.id === productId);
      const productName = addedItem?.product.name || 'Product';
      if (quantity > 1) {
        showSuccess(`Added ${quantity} ${productName} to cart`);
      } else {
        showSuccess(`Added ${productName} to cart`);
      }
    } catch (error) {
      console.error('🛒 [CART] ❌ Failed to add item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' });
      showError('Failed to add item to cart');
    }
  };

  const updateCartItem = async (productId, quantity) => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await cartAPI.updateCartItem(state.sessionId, productId, quantity);
      dispatch({ type: 'SET_CART', payload: response.data });
      showSuccess('Cart updated');
    } catch (error) {
      console.error('Failed to update cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update cart item' });
      showError('Failed to update cart item');
    }
  };

  const removeFromCart = async (productId) => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await cartAPI.removeItemFromCart(state.sessionId, productId);
      await loadCart(state.sessionId);
      showSuccess('Item removed from cart');
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' });
      showError('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    if (!state.sessionId) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await cartAPI.clearCart(state.sessionId);
      dispatch({ type: 'CLEAR_CART' });
      showSuccess('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      showError('Failed to clear cart');
    }
  };

  const getCartTotal = () => {
    if (!state.cart || !state.cart.items) return 0;
    return state.cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    if (!state.cart || !state.cart.items) return 0;
    return state.cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
