/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import axios from 'axios';

// Requests go to a same-origin path. A server-side reverse proxy (nginx in
// production, the Vite dev server in development) forwards `/api` to the
// merchant backend and injects the X-Api-Key header. The shared secret is held
// only by that proxy and is never shipped in the browser bundle.
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
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
  
  // Owner-scoped: the backend enforces object-level authorization, so the
  // owning customer email must accompany by-id reads/mutations.
  getOrder: (id, customerEmail) =>
    api.get(`/orders/${id}?customer_email=${encodeURIComponent(customerEmail)}`),

  getOrderByNumber: (orderNumber) => api.get(`/orders/number/${orderNumber}`),

  updateOrderStatus: (id, status, customerEmail) =>
    api.put(`/orders/${id}/status?status=${encodeURIComponent(status)}&customer_email=${encodeURIComponent(customerEmail)}`),

  cancelOrder: (id, customerEmail) =>
    api.delete(`/orders/${id}?customer_email=${encodeURIComponent(customerEmail)}`),
};

// Individual exports for convenience
export const getProduct = (id) => productsAPI.getProduct(id).then(response => response.data);

export default api;
