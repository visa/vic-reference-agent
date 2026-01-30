/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { config } from '../../config/config';
import type {
  VDPLog,
  HttpMethod,
  RequestHeaders
} from '@/types';
import { setLogs } from '@/features/logs/slices/apiLogsSlice';

class BaseApiService {
  static dispatch: any = null;

  static setDispatch(dispatchFn: any): void {
    BaseApiService.dispatch = dispatchFn;
  }

  static async makeRequest(
    endpoint: string,
    method: HttpMethod = 'GET',
    headers: RequestHeaders = {},
    body: any = null,
    includeStatus: boolean = false
  ) {
    try {
      const url: string = endpoint.startsWith('http') ? endpoint : `${config.backendBaseURL}${endpoint}`;

      const defaultHeaders: RequestHeaders = {
        'Content-Type': 'application/json',
      };

      if (body instanceof FormData) {
        delete defaultHeaders['Content-Type'];
      }

      // Merge headers
      const finalHeaders = { ...defaultHeaders, ...headers };

      const options: RequestInit = {
        method,
        headers: finalHeaders
      };

      if (body && method !== 'GET') {
        options.body = typeof body === 'string' || body instanceof FormData ? body : JSON.stringify(body);
      }

      let response = await fetch(url, options);

      if (response.headers.get('content-type')?.startsWith('image')) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        return { imageUrl };
      }

      let data: any = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = responseText;
        }
      }

      try {
        if (includeStatus) {
          data.statusCode = response.status;
        }
      } catch (error) {
        console.error("Error including status code:", error);
      }

      if (data && data.logs && Array.isArray(data.logs)) {
        BaseApiService.storeVDPLogs(data.logs);
      }
      if (!response.ok) {
        if (response.status === 422) {
          throw new Error();
        }
        throw new Error(data.message || data.detail || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      // Error logging removed to prevent log forging with untrusted data
      throw error;
    }
  }

  static storeVDPLogs(vdpLogs: VDPLog[]): void {
    try {
      const logsWithIds = vdpLogs.map(log => ({
        ...log,
        id: log.id || `vdp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      const existingLogs = JSON.parse(localStorage.getItem('vdp_api_logs') || '[]');
      const updatedLogs = [...existingLogs, ...logsWithIds];

      const trimmedLogs = updatedLogs.slice(-1000);

      localStorage.setItem('vdp_api_logs', JSON.stringify(trimmedLogs));

      if (BaseApiService.dispatch) {
        BaseApiService.dispatch(setLogs(trimmedLogs));
      }
    } catch (error) {
      console.error('Failed to store VDP logs:', error);
    }
  }
}

export default BaseApiService;
/* END GENAI */
