/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { Typography } from '@visa/nova-react';
import styles from './LogMessage.module.css';
import useLogFormatting from '../APISidebar/hooks/useLogFormatting';
import type { VDPLog } from '@/types';

/**
 * LOG MESSAGE COMPONENT
 * Origin: LogMessage with log formatting hooks
 * Use: Displays detailed API log information with formatted request/response
 * Features: JSON formatting, property ordering, VDP-specific log handling
 */
const LogMessage: React.FC<{log: VDPLog, index: number}> = ({ log, index }) => {
  const { formatTimestamp, formatJSON, extractLogFields } = useLogFormatting();

  // Format log entry for display
  const formatLogEntry = (log: any, index: number) => {
    // Default format - can be easily customized
    if (typeof log === 'string') {
      return {
        id: `log-${index}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        message: log,
        level: 'info'
      };
    }
    
    // Use hook to extract fields consistently
    const { method, url, status, requestPayload, responseBody, timestamp, id, correlationId } = extractLogFields(log);
    
    return {
      id: id || `log-${index}-${Date.now()}`,
      timestamp: timestamp || new Date().toISOString(),
      method,
      url,
      requestPayload,
      response: responseBody,
      status,
      message: log.message || JSON.stringify(log),
      level: log.level || 'info',
      correlationId: correlationId || 'unknown'
    };
  };

  const formattedLog = formatLogEntry(log, index);
  
  // Updated property order for VDP logs
  const propertyOrder = [
    { key: 'timestamp', label: 'Timestamp', format: (val: any) => formatTimestamp(val) },
    { key: 'method', label: 'HTTP Method' },
    { key: 'url', label: 'URL' },
    {
      key: 'requestPayload',
      label: 'Request Payload',
      format: (val: any) => formatJSON(val),
      isJson: true
    },
    {
      key: 'response',
      label: 'Response',
      format: (val: any) => formatJSON(val),
      isJson: true
    },
    { key: 'status', label: 'Status' },
    { key: 'error', label: 'Error' },
    { key: 'correlationId', label: 'Correlation ID' }
  ];

  return (
    <div
      key={formattedLog.id}
      className={`${styles.logEntry} ${styles[`logEntry--${formattedLog.level}`]} ${styles['logEntry--vdp']}`}
    >
      {propertyOrder.map(({ key, label, format, isJson }) => {
        const value = (formattedLog as any)[key];

        if (!value) return null;

        const displayValue = format ? format(value) : value;

        return (
          <div key={key} className={`${styles.logSection} ${isJson ? styles.jsonSection : ''}`}>
            <div className={styles.logLabel}>
              <Typography variant="body-2" tag="strong">{label}:</Typography>
            </div>
            {isJson ? (
              <pre className={styles.logJsonContent}>
                <code>{displayValue}</code>
              </pre>
            ) : (
              <div className={styles.logValue}>{displayValue}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LogMessage;
