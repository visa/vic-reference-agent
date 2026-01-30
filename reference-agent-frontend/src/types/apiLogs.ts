/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
export interface VDPLog {
    id?: string; // Unique identifier for the log
    request: {
        method: string;
        path: string;
        body: Record<string, any> | null;
    };
    response: {
        statusCode: number;
        body: Record<string, any> | null;
        correlationId: string;
    };
    timestamp?: string; // ISO 8601 format
}

export interface ApiLogsState { 
    logs: VDPLog[];  // Import VDPLog from your types
    loading: boolean;
    error: string | null;
    isSidebarOpen: boolean;
}

export interface ExtractedLogFields {
    method: string;
    url: string;
    status: string | number;
    isVDPError: boolean;
    timestamp?: string;
    requestPayload: Record<string, any> | null;
    responseBody: Record<string, any> | null;
    id?: string;
    correlationId?: string;
}

export interface ProcessedLog extends ExtractedLogFields {
    logId: string;
    originalLog: VDPLog;
    formattedTimestamp: string;
    statusColor: string;
}
/* END GENAI */