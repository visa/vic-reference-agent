/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { useMemo } from 'react';
import { VDPLog, ExtractedLogFields } from '@/types';

const useLogFormatting = () => {
  //THIS FUNCTION EXTRACTS TIMESTAMPS FROM VDPLOGS
  //THIS FUNCTION PROVIDES A TYPEGUARD - ANY IS OKAY HERE
  const formatTimestamp = useMemo(() => (timestamp: string | any) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleTimeString();
    } catch (error) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Invalid Date';
    }
  }, []);

  const getStatusColor = useMemo(() => (status: string | number, isVDPError = false) => {
    if (isVDPError) return 'error';
    if (!status || status === 'N/A') return 'info';
    if (status === 0) return 'error'; // Exception case from VDP client
    
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return 'success';
      if (status >= 400 && status < 500) return 'error';
      if (status >= 500) return 'server-error';
    }
    
    // Handle string status codes
    if (typeof status === 'string') {
      const numStatus = parseInt(status, 10);
      if (!isNaN(numStatus)) {
        if (numStatus >= 200 && numStatus < 300) return 'success';
        if (numStatus >= 400 && numStatus < 500) return 'error';
        if (numStatus >= 500) return 'server-error';
      }
    }
    
    return 'info';
  }, []);

  const formatJSON = useMemo(() => (obj: any) => {
    if (obj === null || obj === undefined) return 'null';
    if (typeof obj === 'string') return obj;
    try {
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return String(obj);
    }
  }, []);

  const extractLogFields = useMemo(() => (log: VDPLog): ExtractedLogFields => {
    // Extract fields from VDP log format with fallbacks
    return {
      method: log?.request?.method || 'GET',
      url: log?.request?.path || 'Unknown URL',
      status: log?.response?.statusCode || 'N/A',
      isVDPError: false, // VDPLog doesn't have is_vdp_error field
      timestamp: log?.timestamp,
      requestPayload: log?.request?.body,
      responseBody: log?.response?.body,
      id: log?.id,
      correlationId: log?.response?.correlationId
    };
  }, []);

  return {
    formatTimestamp,
    getStatusColor,
    formatJSON,
    extractLogFields
  };
};

export default useLogFormatting;
