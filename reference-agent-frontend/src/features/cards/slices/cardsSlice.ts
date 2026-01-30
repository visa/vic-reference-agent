/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { InitialCardState } from '@/types';
import {createSlice} from '@reduxjs/toolkit';

const initialState: InitialCardState = {
    cards: [],
    isLoadingCards: false,
    cardsError: null,
}

export const cardsSlice = createSlice({
    name: 'cardsSlice',
    initialState,
    reducers: {
        setCards: (state, action) => { state.cards = action.payload },

        setCardsLoading: (state, action) => { state.isLoadingCards = action.payload },

        setCardsError: (state, action) => { state.cardsError = action.payload },

        clearCardsError: (state) => { state.cardsError = null },

        clearCards: (state) => {
            state.cards = [];
            state.isLoadingCards = false;
            state.cardsError = null;
        },
    }
})

export const {
    setCards,
    setCardsLoading,
    setCardsError,
    clearCardsError,
    clearCards,
} = cardsSlice.actions

export default cardsSlice.reducer
/* END GENAI */
