/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createSlice } from '@reduxjs/toolkit';
import { ApiLogsState } from '@/types';
import { APILoggingConfig } from '@/config/config';

const initialState: ApiLogsState = {
  logs: [],
  loading: false,
  error: null,
  isSidebarOpen: false
};

const apiLogsSlice = createSlice({
  name: 'apiLogs',
  initialState,
  reducers: {
    setLogs: (state, action) => {
      state.logs = action.payload;
    },
    
    addLog: (state, action) => {
      state.logs.push(action.payload);
      // Enforce max display logs limit
      if (state.logs.length > APILoggingConfig.maxDisplayLogs) {
        state.logs = state.logs.slice(-APILoggingConfig.maxDisplayLogs);
      }
    },
  
    clearLogsState: (state) => {
      state.logs = [];
    },
    
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    setWidgetSidebarOpen: (state, action) => {
        state.isSidebarOpen = action.payload;
    },
  }
});

export const {
  setLogs,
  addLog,
  clearLogsState,
  setLoading,
  setError,
  clearError,
  setWidgetSidebarOpen
} = apiLogsSlice.actions;

export default apiLogsSlice.reducer;
