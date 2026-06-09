/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

// The merchant backend requires an API key (X-Api-Key), baked in at build time
// via VITE_MERCHANT_API_KEY. A key in a browser bundle isn't a strong secret.
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(import.meta.env.VITE_MERCHANT_API_KEY
      ? { 'X-Api-Key': import.meta.env.VITE_MERCHANT_API_KEY }
      : {}),
  },
});

// Products API
export const productsAPI = {
  searchProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/products?${searchParams.toString()}`);
  },
  
  getProduct: (id) => api.get(`/products/${id}`),
  
};

// Cart API
export const cartAPI = {
  createCart: () => api.post('/cart'),
  
  getCart: (sessionId) => api.get(`/cart/${sessionId}`),
  
  addItemToCart: (sessionId, item) => 
    api.post(`/cart/${sessionId}/items`, item),
  
  updateCartItem: (sessionId, productId, quantity) =>
    api.put(`/cart/${sessionId}/items/${productId}`, { quantity }),
  
  removeItemFromCart: (sessionId, productId) =>
    api.delete(`/cart/${sessionId}/items/${productId}`),
  
  clearCart: (sessionId) => api.delete(`/cart/${sessionId}`),
};

// Orders API
export const ordersAPI = {
  checkout: (sessionId, checkoutData) => api.post(`/cart/${sessionId}/checkout`, checkoutData),
  
  getOrders: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key]);
      }
    });
    return api.get(`/orders?${searchParams.toString()}`);
  },
  
  getOrder: (id) => api.get(`/orders/${id}`),
  
  getOrderByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),
  
  updateOrderStatus: (id, status) => 
    api.put(`/orders/${id}/status?status=${status}`),
  
  cancelOrder: (id) => api.delete(`/orders/${id}`),
};

// Individual exports for convenience
export const getProduct = (id) => productsAPI.getProduct(id).then(response => response.data);

export default api;
