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
import {
    Button,
    Badge,
    Typography,
    Surface,
    ContentCard,
    ContentCardBody,
    UtilityFragment
} from '@visa/nova-react';
import { VisaDeleteTiny, VisaCloseTiny } from '@visa/nova-icons-react';
import styles from './APISidebar.module.css';
import { useAPISidebar } from '../hooks/useAPISidebar';

/**
 * API SIDEBAR COMPONENT
 * Origin: APISidebar with Redux integration
 * Use: Displays list of API logs with clear and detail functionality
 * Features: Log listing, clearing, modal opening, responsive design
 */
const APISidebar: React.FC = () => {
    // === Get sidebar functionality from hook ===
    const {
        processedLogs,
        logsCount,
        isOpen,
        isLoading,
        error,
        handleClearLogs,
        handleLogClick,
        handleCloseSidebar
    } = useAPISidebar();

    return (
        <Surface className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
            <div className={`v-flex v-flex-row v-justify-content-between v-align-items-center ${styles.sidebarHeader}`}>
                <div className={`v-flex v-flex-row v-align-items-center ${styles.headerContent}`}>
                    <Typography variant="headline-3" tag="h3">API Logs</Typography>
                    <Badge badgeType="neutral">{logsCount}</Badge>
                    {/* Show loading indicator */}
                    {isLoading && <span className={styles.loadingIndicator}>⟳</span>}
                    {/* Show error indicator */}
                    {error && <span className={styles.errorIndicator} title={error}>⚠️</span>}
                </div>
                <div className={`v-flex v-flex-row ${styles.headerControls}`}>
                    <Button
                        colorScheme="secondary"
                        destructive
                        onClick={handleClearLogs}
                        disabled={logsCount === 0}
                    >
                        <VisaDeleteTiny />
                        Clear Logs
                    </Button>
                    <Button
                        aria-label="Close"
                        colorScheme="tertiary"
                        iconButton
                        onClick={handleCloseSidebar}
                        subtle
                    >
                        <VisaCloseTiny />
                    </Button>
                </div>
            </div>

            <div className={styles.sidebarContent}>
                {logsCount === 0 ? (
                    <div className={`v-flex v-flex-col v-align-items-center ${styles.noLogs}`}>
                        <Typography variant="body-2">No API calls logged yet</Typography>
                        {isLoading && <Typography variant="body-2">Loading logs...</Typography>}
                        {error && <Typography variant="body-2" className={styles.errorText}>Error loading logs: {error}</Typography>}
                    </div>
                ) : (
                    <div className={`v-flex v-flex-col ${styles.logsList}`}>
                        {processedLogs.map((logData: any) => {
                            const {
                                logId,
                                method,
                                url,
                                status,
                                formattedTimestamp,
                                statusColor,
                                originalLog
                            } = logData;

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

                            return (
                                <ContentCard
                                    key={logId}
                                    className={styles.logItem}
                                    onClick={() => handleLogClick(originalLog)}
                                >
                                    <ContentCardBody>
                                        <div className={styles.logSummary}>
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
                                            <Typography variant="body-2" className={styles.timestamp}>{formattedTimestamp}</Typography>
                                        </div>
                                    </ContentCardBody>
                                </ContentCard>
                            );
                        })}
                    </div>
                )}
            </div>

        </Surface>
    );
};

export default APISidebar;
/* END GENAI */
