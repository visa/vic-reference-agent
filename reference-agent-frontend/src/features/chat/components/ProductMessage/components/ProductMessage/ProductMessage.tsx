/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { useProductMessage } from '../../hooks/useProductMessage';
import { useSelector } from 'react-redux';
import { selectProductsForMessage } from '../../../../selectors/productSelectionSelectors';
import { selectMessageAtIndex } from '../../../../selectors/chatSelectors';
import BotMessage from '../../../BotMessage/BotMessage';
import ProductCard from '../ProductCard/ProductCard';
import CartCard from '../CartCard/CartCard';
import styles from './ProductMessage.module.css';
import type { RootState } from '@/store';
import type { ProductSummaryMessage } from '@/types';

interface ProductMessageProps {
    messageIndex: number;
}

const ProductMessage: React.FC<ProductMessageProps> = ({ messageIndex }) => {
    const products = useSelector((state: RootState) => selectProductsForMessage(state, messageIndex));
    const message = useSelector((state: RootState) => selectMessageAtIndex(state, messageIndex));
    const {
        productListRef,
        cartQuantity,
        cartTotal,
    } = useProductMessage(messageIndex);

    // Type guard to check if message is ProductSummaryMessage and get showCartCard
    const showCartCard = (message?.type === 'productSummary' && (message as ProductSummaryMessage).showCartCard !== false) || message?.type !== 'productSummary';

    return (
        <>   
        {/* Product cards container */}
        <div className={styles.productContainer}>
            <div className={styles.productList} ref={productListRef}>
            {products.map((product, idx) => (
                <ProductCard 
                  key={`${product.name}-${idx}`} 
                  product={product} 
                  messageIndex={messageIndex}
                />
            ))}
            </div>
            
            {/* Cart Card - shown when items are in cart AND showCartCard is true */}
            {cartQuantity > 0 && showCartCard && (
            <CartCard
                itemCount={cartQuantity}
                totalAmount={cartTotal}
            />
            )}
        </div>
        </>
  );
};

export default ProductMessage;
