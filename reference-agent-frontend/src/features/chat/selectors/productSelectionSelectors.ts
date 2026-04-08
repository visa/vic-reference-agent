/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/store';
import { ResponseProduct, ProductData, MessageProducts } from '@/types';

// === PRODUCT SELECTION SELECTORS ===
// Get accepted products for a specific message
export const selectAcceptedProductsForMessage = createSelector(
  [(state: RootState) => state.productSelection.acceptedProducts, (state: RootState, messageIndex: number) => messageIndex],
  (allAcceptedProducts, messageIndex): MessageProducts => {
    return allAcceptedProducts[messageIndex] || {};
  }
);

// Get products for a specific message
export const selectProductsForMessage = createSelector(
  [(state: RootState) => state.productSelection.allProducts, (state: RootState, messageIndex: number) => messageIndex],
  (allProducts, messageIndex): ResponseProduct[] => {
    return allProducts[messageIndex] || [];
  }
);

// === CART STATE SELECTORS ===
export const selectAcceptedProductCount = createSelector(
  [(state: RootState) => state.productSelection.acceptedProducts],
  (allAcceptedProducts: Record<number, MessageProducts>): number => {
    if (!allAcceptedProducts) return 0;
    return Object.values(allAcceptedProducts).reduce((total: number, messageProducts: MessageProducts) => {
      if (!messageProducts) return total;
      return total + Object.keys(messageProducts).length;
    }, 0);
  }
);

export const selectTotalQuantity = createSelector(
  [(state: RootState) => state.productSelection.acceptedProducts],
  (allAcceptedProducts: Record<number, MessageProducts>): number => {
    if (!allAcceptedProducts) return 0;
    return Object.values(allAcceptedProducts).reduce((total: number, messageProducts: MessageProducts) => {
      if (!messageProducts) return total;
      return total + Object.values(messageProducts).reduce((messageTotal: number, productData: ProductData) => {
        return messageTotal + (productData.quantity || 1);
      }, 0);
    }, 0);
  }
);

export const selectCartTotal = createSelector(
  [(state: RootState) => state.productSelection.acceptedProducts],
  (allAcceptedProducts: Record<number, MessageProducts>): number => {
    if (!allAcceptedProducts) return 0;
    return Object.values(allAcceptedProducts).reduce((total: number, messageProducts: MessageProducts) => {
      if (!messageProducts) return total;
      return total + Object.values(messageProducts).reduce((messageTotal: number, productData: ProductData) => {
        const price = typeof productData.price === 'string'
          ? parseFloat(productData.price.replace(/[$,]/g, '')) || 0
          : productData.price || 0;
        const quantity = productData.quantity || 1;
        return messageTotal + (price * quantity);
      }, 0);
    }, 0);
  }
);
