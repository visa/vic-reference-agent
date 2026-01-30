/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { AcceptedProducts, AllProducts, ResponseProduct, MessageProducts, ProductData, Product } from '@/types';

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

export const formatDate = (dateInput: number | string): string => {
    if (!dateInput) return '';
    
    // Handle Unix timestamp (number)
    if (typeof dateInput === 'number') {
        let date = new Date(dateInput * 1000);
        // Get year, month, day from UTC date object
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth();
        const day = date.getUTCDate();
        // Format as local date string
        date = new Date(year, month, day);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // Handle date string (from DateInput component)
    if (typeof dateInput === 'string') {
        // If it's in YYYY-MM-DD format, parse it as local date to avoid timezone issues
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
            const [year, month, day] = dateInput.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
        
        // For other string formats, use regular Date constructor
        const date = new Date(dateInput);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    return '';
}

export const dateStringToUNIXTimestamp = (dateInput: string, inclusive: boolean = true): number | null => {
    if (!dateInput) return null;
    
    const utcDate = new Date(dateInput);
    const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
    if (inclusive) {
        // Set to end of day (23:59:59.999)
        localDate.setHours(23, 59, 59, 999);
    }
    return Math.floor(localDate.getTime() / 1000);
};

export const UNIXTimestampToDateString = (unixTimestamp: string): string | null => {
    if (unixTimestamp === null || unixTimestamp === undefined) {
        return null;
    }

    // Create a new Date object from the timestamp.
    const date = new Date(parseInt(unixTimestamp) * 1000);

    // Get the year, month, and day using the local timezone of the environment.
    const year = date.getFullYear();
    // getMonth() is zero-based (0 for January), so we add 1.
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Pad the month and day with a leading zero if they are single-digit numbers.
    const monthPadded = String(month).padStart(2, '0');
    const dayPadded = String(day).padStart(2, '0');

    // Construct the YYYY-MM-DD string.
    return `${year}-${monthPadded}-${dayPadded}`;
};

export const UNIXTimestampToFormattedDate = (timestamp: number): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
};

/**
 * Transforms acceptedProducts from Redux state structure to API-compatible array
 * @param acceptedProducts - Message-scoped accepted products object
 * @param allProductsByMessage - Original products data by message
 * @returns Flat array of products for API submission
 */
export const transformAcceptedProductsForApi = (
    acceptedProducts: AcceptedProducts, 
    allProductsByMessage: AllProducts
): Product[] => {
    return Object.values(acceptedProducts).reduce((allProducts, messageProducts: MessageProducts) => {
        const messageProductsArray = Object.entries(messageProducts)
            .filter(([_, productData]: [string, ProductData]) => productData.accepted)
            .map(([productName, productData]: [string, ProductData]) => {
                // Find the original product data to get the sku and other fields
                let originalProduct = null;
                for (const messageIndex in allProductsByMessage) {
                    const messageProductsList = allProductsByMessage[messageIndex];
                    originalProduct = messageProductsList?.find(p => p.name === productName);
                    if (originalProduct) break;
                }
                
                return {
                    productId: originalProduct?.sku || productName, // Use sku as productId, fallback to name
                    name: productName,
                    quantity: productData.quantity,
                    price: productData.price,
                };
            });
        return [...allProducts, ...messageProductsArray];
    }, []);
};
/* END GENAI */