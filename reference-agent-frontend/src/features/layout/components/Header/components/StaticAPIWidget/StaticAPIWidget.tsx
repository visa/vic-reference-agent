/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWidgetSidebarOpen } from '@/features/logs/slices/apiLogsSlice';
import { Button, Badge, Typography } from '@visa/nova-react';
import styles from './StaticAPIWidget.module.css';
import { RootState } from '@/store';

const StaticAPIWidget: React.FC = () => {
  const dispatch = useDispatch();

  // Get state from Redux
  const logCount = useSelector((state: RootState) => state.apiLogs.logs.length);
  const isLoading = useSelector((state: RootState) => state.apiLogs.loading);
  const error = useSelector((state: RootState) => state.apiLogs.error);

  const handleWidgetClick = () => {
    dispatch(setWidgetSidebarOpen(true));
  };

  return (
    <Button
      className={styles.staticApiWidget}
      onClick={handleWidgetClick}
    >
      <Typography variant="body-2" className={styles.apiLogsText}>
        API Logs
      </Typography>
      <Badge badgeType="neutral" className={styles.logCount}>
        {logCount}
      </Badge>
      {isLoading && <span className={styles.loadingIndicator}>⟳</span>}
      {error && <span className={styles.errorIndicator} title={error}>⚠️</span>}
    </Button>
  );
};

export default StaticAPIWidget;
