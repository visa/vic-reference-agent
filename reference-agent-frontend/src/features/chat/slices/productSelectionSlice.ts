/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { createSlice } from '@reduxjs/toolkit';
import { InitialProductSelectionState } from '@/types';

const initialState: InitialProductSelectionState = {
    allProducts: {},
    acceptedProducts: {},
};

export const productSelectionSlice = createSlice({
    name: 'productSelection',
    initialState,
    reducers: {
        setProducts: (state, action) => {
            const { messageIndex, products } = action.payload;
            state.allProducts[messageIndex] = products;
        },

        setAcceptedProducts: (state, action) => {
            const { messageIndex, acceptedProducts } = action.payload;
            state.acceptedProducts[messageIndex] = acceptedProducts;
        },

        updateQuantity: (state, action) => {
            const { messageIndex, product, newQuantity } = action.payload;

            if (newQuantity < 1) return;

            if (!state.acceptedProducts[messageIndex]) {
                state.acceptedProducts[messageIndex] = {};
            }

            const currentData = state.acceptedProducts[messageIndex][product.name] || { accepted: false, quantity: 1 };

            state.acceptedProducts[messageIndex][product.name] = {
                ...currentData,
                quantity: newQuantity
            };
        },

        resetProducts: (state) => {
            state.allProducts = {};
            state.acceptedProducts = {};
        },
    }
});

export const {
    setProducts,
    setAcceptedProducts,
    updateQuantity,
    resetProducts,
} = productSelectionSlice.actions;

export default productSelectionSlice.reducer;
/* END GENAI */
