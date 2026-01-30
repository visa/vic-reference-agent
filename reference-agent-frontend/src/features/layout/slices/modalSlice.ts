/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// === UNIFIED MODAL SLICE ===
// Use: Single source of truth for ALL modal state management across the application

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InitialModalState } from '@/types';

const initialState: InitialModalState = {
  // === GLOBAL MODAL SYSTEM ===
  activeModal: null,
  modalProps: {},
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    
    // === UNIFIED MODAL ACTIONS ===
    openModal: (state, action: PayloadAction<{ modalType: string; props?: any }>) => {
        const { modalType, props = {} } = action.payload;
        state.activeModal = modalType;
        state.modalProps = props;
    },
    
    closeModal: (state) => {
        console.log("Closing modal");
        state.activeModal = null;
        state.modalProps = {};
    },
  }
});

export const {  
  // Unified modal actions (preferred approach)
  openModal,
  closeModal,
} = modalSlice.actions;

export default modalSlice.reducer;
