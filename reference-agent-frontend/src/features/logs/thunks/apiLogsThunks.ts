/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { APILoggingConfig } from '../../../config/config';
import { 
  setLogs, 
  clearLogsState as clearLogsAction,
  setLoading, 
  setError, 
  clearError 
} from '../slices/apiLogsSlice';
import { 
  VDPLog
} from '@/types'

// === API LOGS THUNKS ===
export const loadLogs = createAsyncThunk<VDPLog[], void>(
  'apiLogs/loadLogs',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const { localStorageKey, maxDisplayLogs } = APILoggingConfig;
      const storedLogs = localStorage.getItem(localStorageKey);
      if (storedLogs) {
        console.log('Loading logs from localStorage');
        const parsedLogs: VDPLog[] = JSON.parse(storedLogs);
        const logsArray = Array.isArray(parsedLogs) ? parsedLogs : [];
        const limitedLogs = logsArray.slice(-maxDisplayLogs);
        
        dispatch(setLogs(limitedLogs));
        return limitedLogs;
      } else {
        dispatch(setLogs([]));
        return [];
      }
    } catch (error) {
      console.error('Error loading logs from localStorage:', error);
      const errorMessage = 'Failed to load API logs';
      dispatch(setError(errorMessage));
      dispatch(setLogs([]));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const clearLogs = createAsyncThunk(
  'apiLogs/clearLogs',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      const { localStorageKey, maxDisplayLogs } = APILoggingConfig;
      // Clear from localStorage
      localStorage.removeItem(localStorageKey);
      
      // Clear from state
      dispatch(clearLogsAction());
      
      return { cleared: true };
    } catch (error) {
      console.error('Error clearing logs:', error);
      const errorMessage = 'Failed to clear API logs';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const addLogEntry = createAsyncThunk<VDPLog, VDPLog>(
  'apiLogs/addLogEntry',
  async (logEntry, { dispatch, getState, rejectWithValue }) => {
    try {
      const { localStorageKey, maxDisplayLogs } = APILoggingConfig;
      
      // Add timestamp if not present
      const timestampedLog = {
        ...logEntry,
        timestamp: logEntry.timestamp || new Date().toISOString()
      };
      
      // Get current logs from localStorage
      const storedLogs = localStorage.getItem(localStorageKey);
      const currentLogs = storedLogs ? JSON.parse(storedLogs) : [];
      
      // Add new log and enforce limit
      const updatedLogs = [...currentLogs, timestampedLog].slice(-maxDisplayLogs);
      
      // Update localStorage
      localStorage.setItem(localStorageKey, JSON.stringify(updatedLogs));
      
      // Update state by reloading (ensures consistency)
      dispatch(loadLogs());
      
      return timestampedLog;
    } catch (error) {
      console.error('Error adding log entry:', error);
      const errorMessage = 'Failed to add log entry';
      dispatch(setError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);
