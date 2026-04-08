/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, resetProducts, setProducts, setAcceptedProducts } from '../../../slices/productSelectionSlice';
import { 
    selectTotalQuantity, 
    selectCartTotal,
    selectProductsForMessage,
    selectAcceptedProductsForMessage
} from '../../../selectors/productSelectionSelectors';
import type { RootState, AppDispatch } from '@/store';
import type { ResponseProduct } from '@/types';

export const useProductMessage = (messageIndex: number) => {
    const productListRef = useRef<HTMLDivElement>(null);
    const dispatch = useDispatch<AppDispatch>(); 
    
    // Redux state - message-specific for products, global for cart totals
    const products = useSelector((state: RootState) => selectProductsForMessage(state, messageIndex));
    const acceptedProducts = useSelector((state: RootState) => selectAcceptedProductsForMessage(state, messageIndex));
    const cartQuantity = useSelector(selectTotalQuantity); // Global cart quantity
    const cartTotal = useSelector(selectCartTotal); // Global cart total

    const updateProducts = (payload: any) => {
        dispatch(setProducts(payload));
    }

    const updateAcceptedProducts = (payload: any) => {
        dispatch(setAcceptedProducts(payload));
    }

    const updateProductQuantity = (product: ResponseProduct, newQuantity: number) => {
        dispatch(updateQuantity({ product, newQuantity }));
    }

    const resetAllProducts = () => {
        dispatch(resetProducts());
    }

    return {
        productListRef,
        products,
        cartQuantity,
        cartTotal,
    }
}
