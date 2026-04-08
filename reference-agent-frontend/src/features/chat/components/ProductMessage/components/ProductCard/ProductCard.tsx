/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { VisaAddTiny, VisaSubtractTiny, VisaCartTiny, VisaCheckmarkLow } from '@visa/nova-icons-react';
import { Button, Surface, Typography } from '@visa/nova-react';
import { setAcceptedProducts, updateQuantity } from '@/features/chat/slices/productSelectionSlice';
import { selectAcceptedProductsForMessage } from '@/features/chat/selectors/productSelectionSelectors';
import { formatCurrency } from '@/utils/formattingUtils';
import styles from './ProductCard.module.css';
import type { RootState, AppDispatch } from '@/store';
import type { ResponseProduct } from '@/types';

interface ProductCardProps {
  product: ResponseProduct;
  messageIndex: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, messageIndex }) => {
  const dispatch = useDispatch<AppDispatch>();
  const acceptedProducts = useSelector((state: RootState) => selectAcceptedProductsForMessage(state, messageIndex));
  
  const productData = acceptedProducts[product.name] || { accepted: false, quantity: 1 };
  const isAccepted = productData.accepted;
  const quantity = productData.quantity;

  // Local state for input value to handle editing
  const [inputValue, setInputValue] = useState(quantity.toString());

  // Sync local input value with Redux state when quantity changes
  // Also reset input when item is re-added to cart
  useEffect(() => {
    if (isAccepted) {
      setInputValue(quantity.toString());
    }
  }, [quantity, isAccepted]);

  const handleRemoveFromCart = () => {
    const newAcceptedProducts = { ...acceptedProducts };
    delete newAcceptedProducts[product.name];
    dispatch(setAcceptedProducts({ messageIndex, acceptedProducts: newAcceptedProducts }));
  };

  const commitInputValue = (value: string) => {
    const newValue = parseInt(value, 10);
    
    if (isNaN(newValue) || newValue < 0) {
      // Reset to current quantity if invalid
      setInputValue(quantity.toString());
    } else if (newValue === 0) {
      // Remove from cart if 0
      handleRemoveFromCart();
    } else if (newValue !== quantity) {
      // Update if different from current quantity
      handleQuantityChange(newValue);
    }
  };

  const handleAcceptClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default button behavior that might cause scrolling
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle product acceptance using setAcceptedProducts with messageIndex
    const currentData = productData;
    let newAcceptedProducts;
    
    if (currentData.accepted) {
      // If currently accepted, remove it from acceptedProducts entirely
      newAcceptedProducts = { ...acceptedProducts };
      delete newAcceptedProducts[product.name];
    } else {
      // If not accepted, add it to acceptedProducts with quantity 1
      // Always start with quantity 1 when adding back to cart
      newAcceptedProducts = {
        ...acceptedProducts,
        [product.name]: {
          accepted: true,
          quantity: 1,
          price: product.price
        }
      };
      // Reset input value to "1" when adding to cart
      setInputValue("1");
    }
    
    dispatch(setAcceptedProducts({ messageIndex, acceptedProducts: newAcceptedProducts }));
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      dispatch(updateQuantity({ messageIndex, product, newQuantity }));
    } else if (newQuantity === 0) {
      // Remove from cart if quantity is 0
      handleRemoveFromCart();
    }
  };

  return (
    <div className={styles.productCard}>
      <Surface className={`${styles.card} ${isAccepted ? styles.expanded : ''}`}>
        <div className={styles.imageContainer}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImage}
          />
          {/* Overlay with checkmark when product is accepted - covers only image */}
          {isAccepted && (
            <div className={styles.acceptedOverlay}>
              <div className={styles.checkmarkContainer}>
                <VisaCheckmarkLow className={styles.checkmarkIcon} />
              </div>
            </div>
          )}
        </div>

        <div className={styles.cardContent}>
          <Typography variant="headline-3" tag="h3" className={styles.productTitle}>
            {product.name}
          </Typography>

          <Typography variant="body-2" className={styles.productDescription}>
            {product.description}
          </Typography>

          <div className={styles.actionSection}>
            <div className={styles.priceAndButtonRow}>
              <Typography variant="body-1" className={styles.productPrice}>
                {formatCurrency(parseFloat(product.price))}
              </Typography>

              <Button
                type="button"
                className={`${styles.acceptButton} ${isAccepted ? styles.accepted : ''}`}
                onClick={handleAcceptClick}
              >
                {isAccepted ? (
                  <>
                    <VisaCartTiny className={styles.buttonIcon} />
                    <Typography variant="body-2" className={styles.buttonText}>Added</Typography>
                  </>
                ) : (
                  <>
                    <VisaAddTiny className={styles.buttonIcon} />
                    <Typography variant="body-2" className={styles.buttonText}>Add to Cart</Typography>
                  </>
                )}
              </Button>
            </div>

            {isAccepted && (
              <div className={styles.quantityControls}>
                <Button
                  className={styles.quantityButton}
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 0}
                  aria-label="Decrease quantity"
                >
                  <VisaSubtractTiny className={styles.quantityIcon} />
                </Button>

              <input
                type="number"
                className={styles.quantityInput}
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputValue(value);
                  
                  // Only update Redux state for valid numbers >= 1
                  const newValue = parseInt(value, 10);
                  if (!isNaN(newValue) && newValue >= 1) {
                    handleQuantityChange(newValue);
                  }
                }}
                onBlur={(e) => {
                  // On blur (click away), commit the value
                  commitInputValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  // Handle Enter key to commit the value
                  if (e.key === 'Enter') {
                    commitInputValue(inputValue);
                    e.currentTarget.blur(); // Remove focus after Enter
                  }
                }}
                min="0"
                aria-label={`Quantity for ${product.name}`}
                style={{
                  '--input-width': Math.max(2, inputValue.length)
                } as React.CSSProperties}
              />

              <Button
                className={styles.quantityButton}
                onClick={() => handleQuantityChange(quantity + 1)}
                aria-label="Increase quantity"
              >
                <VisaAddTiny className={styles.quantityIcon} />
              </Button>
            </div>
            )}
          </div>
        </div>
      </Surface>
    </div>
  );
};

export default ProductCard;
