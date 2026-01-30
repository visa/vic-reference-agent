/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import { useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useLogFormatting from './useLogFormatting';
import type { RootState, AppDispatch } from '@/store';
import type { ProcessedLog, VDPLog } from '@/types';

// API Logs thunks
import {
    clearLogs,
    loadLogs
} from '@/features/logs/thunks/apiLogsThunks';

// Modal actions
import {
    openModal
} from '@/features/layout/slices/modalSlice';

// Widget actions (for sidebar state)
import {
    setWidgetSidebarOpen
} from '@/features/logs/slices/apiLogsSlice';

/**
 * Business logic hook for APISidebar
 * Use: Handles API logs management, modal operations, and log formatting
 * Scope: Sidebar-specific functionality - logs display, clearing, modal opening
 */
export const useAPISidebar = () => {
    const dispatch = useDispatch<AppDispatch>();
    
    // === API Logs State ===
    const logs = useSelector((state: RootState) => state.apiLogs.logs);
    const isLoading = useSelector((state: RootState) => state.apiLogs.loading);
    const error = useSelector((state: RootState) => state.apiLogs.error);
    const activeModal = useSelector((state: RootState) => state.modal.activeModal);
    
    // === Sidebar State ===
    const isOpen = useSelector((state: RootState) => state.apiLogs.isSidebarOpen);
    
    // === Log Formatting Hook ===
    const { formatTimestamp, getStatusColor, extractLogFields } = useLogFormatting();
    
    // === Initialize logs on mount ===
    // Logs are now updated in real-time via Redux dispatch from BaseApiService
    // when API calls are made, eliminating the need for polling
    useEffect(() => {
        console.log('Loading API logs on sidebar mount');
        dispatch(loadLogs());
    }, [dispatch]);
    
    // === Business Actions ===
    const handleClearLogs = useCallback(() => {
        dispatch(clearLogs());
    }, [dispatch]);
    
    const handleLogClick = useCallback((log: VDPLog) => {
        console.log("Log clicked", log);
        dispatch(openModal({
            modalType: 'apiLog',
            props: { log: log }
        }));
        console.log("Active Modal:", activeModal)
    }, [dispatch, activeModal]);
    
    const handleCloseSidebar = useCallback(() => {
        dispatch(setWidgetSidebarOpen(false));
    }, [dispatch]);
    
    // === Log Processing ===
    const processedLogs = useMemo((): ProcessedLog[] => {
        return logs.map((log: VDPLog, index: number) => {
            const logFields = extractLogFields(log);
            const logId = logFields.id || `log-${index}`;
            
            return {
                ...logFields,
                logId,
                originalLog: log,
                formattedTimestamp: formatTimestamp(logFields.timestamp),
                statusColor: getStatusColor(logFields.status, logFields.isVDPError)
            };
        });
    }, [logs, extractLogFields, formatTimestamp, getStatusColor]);
    
    // === Return Business State and Actions ===
    return {
        // === Data State ===
        logs,
        processedLogs: processedLogs,
        logsCount: logs.length,
        isOpen,
        isLoading,
        error,
        
        // === Formatting Utilities ===
        formatTimestamp,
        getStatusColor,
        extractLogFields,
        
        // === Actions ===
        handleClearLogs,
        handleLogClick,
        handleCloseSidebar
    };
};
/* END GENAI */
