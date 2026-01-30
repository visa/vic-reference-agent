/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogCloseButton,
    Typography,
    Badge,
    Surface
} from '@visa/nova-react';
import LogMessage from './LogMessage';
import styles from './APILogModal.module.css';
import useLogFormatting from '../APISidebar/hooks/useLogFormatting';
import { closeModal } from '@/features/layout/slices/modalSlice';
import type { RootState, AppDispatch } from '@/store';

/**
 * API LOG MODAL COMPONENT
 * Origin: APILogModal with Redux integration
 * Use: Displays detailed API log information in a modal dialog
 * Features: Full log details, request/response viewing, status display
 */
const APILogModal: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const log = useSelector((state: RootState) => state.modal.modalProps.log);
    const {formatTimestamp, getStatusColor, extractLogFields} = useLogFormatting();
    const {method, url, status, isVDPError, timestamp} = extractLogFields(log);

    const handleClose = (): void => {
        dispatch(closeModal());
    };

    // Map status color to Nova Badge type
    const getBadgeType = (color: string) => {
        switch(color) {
            case 'success': return 'stable';
            case 'error': return 'critical';
            case 'server-error': return 'critical';
            case 'info': return 'neutral';
            default: return 'neutral';
        }
    };

    const statusColor = getStatusColor(status, isVDPError);

    return (
        <>
            <div className={styles.modalOverlay} onClick={handleClose} />
            <Dialog open className={styles.dialog}>
                <DialogContent className={styles.dialogContent}>
                    <DialogHeader>API Log Details</DialogHeader>

                    {/* Log Summary Header */}
                    <Surface className={styles.logSummaryHeader}>
                        <div className={styles.logSummaryContent}>
                            <Typography variant="body-2" className={styles.method}>{method}</Typography>
                            <span className={styles.separator}>|</span>
                            <Typography variant="body-2" className={styles.url} title={url}>
                                {url}
                            </Typography>
                            <span className={styles.separator}>|</span>
                            <Badge badgeType={getBadgeType(statusColor)}>
                                {status}
                            </Badge>
                            <span className={styles.separator}>|</span>
                            <Typography variant="body-2" className={styles.timestamp}>
                                {formatTimestamp(timestamp)}
                            </Typography>
                        </div>
                    </Surface>

                    {/* Detailed Log Message */}
                    <div className={styles.logMessageContainer}>
                        <LogMessage log={log} index={0} />
                    </div>
                </DialogContent>
                <DialogCloseButton onClick={handleClose} />
            </Dialog>
        </>
    );
};

export default APILogModal;
/* END GENAI */