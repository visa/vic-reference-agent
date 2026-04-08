/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useState } from 'react';
import type { ResponseProduct, MessageProducts, ChatMessage } from '@/types';

export const useProductSelection = () => {
  const [acceptedProducts, setAcceptedProducts] = useState<MessageProducts>({});

  const toggleProduct = (product: ResponseProduct) => {
    setAcceptedProducts(prev => {
      const currentData = prev[product.name] || { accepted: false, quantity: 1 };
      return {
        ...prev,
        [product.name]: {
          ...currentData,
          accepted: !currentData.accepted,
          quantity: currentData.accepted ? currentData.quantity : 1,
          price: product.price
        }
      };
    });
  };

  const updateQuantity = (product: ResponseProduct, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setAcceptedProducts(prev => {
      const currentData = prev[product.name] || { accepted: false, quantity: 1 };
      return {
        ...prev,
        [product.name]: {
          ...currentData,
          quantity: newQuantity
        }
      };
    });
  };

  const getAcceptedProductList = (messages: ChatMessage[]) => {
    return Object.entries(acceptedProducts)
      .filter(([_, productData]) => productData.accepted)
      .map(([name, productData]) => {
        const lastProductMsg = messages
          .slice()
          .reverse()
          .find(msg => 'products' in msg && msg.products && msg.products.some((p: ResponseProduct) => p.name === name));
        
        if (lastProductMsg && 'products' in lastProductMsg && lastProductMsg.products) {
          const product = lastProductMsg.products.find((p: ResponseProduct) => p.name === name);
          if (product) {
            return {
              productId: product.sku,
              quantity: productData.quantity || 1,
              name: product.name,
              image: product.image,
              price: product.price,
              description: product.description
            };
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  const resetProducts = () => {
    setAcceptedProducts({});
  };

  return {
    acceptedProducts,
    toggleProduct,
    updateQuantity,
    getAcceptedProductList,
    resetProducts
  };
};
