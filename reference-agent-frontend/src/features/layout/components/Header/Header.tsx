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
import styles from './Header.module.css';
import { Typography, VisaLogo } from '@visa/nova-react';
import StaticAPIWidget from './components/StaticAPIWidget/StaticAPIWidget';
import APISidebar from '@/features/logs/components/APISidebar/components/APISidebar';

/**
 * HEADER COMPONENT
 * Use: Main application header with branding and actions
 * Features: Clear chat, API logs
 */
const Header: React.FC = () => {
    return (
        <>
            <header className={styles.appHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.logo}>
                        <VisaLogo aria-label="Visa" />
                    </div>
                    <Typography variant="headline-2" tag="h1" className={styles.title}>
                        Reference Agent
                    </Typography>
                </div>
                <div className={styles.headerButtons}>
                    <StaticAPIWidget />
                </div>
            </header>

            {/* APISidebar - rendered outside header but managed by widget */}
            <APISidebar />
        </>
    );
};

export default Header;
/* END GENAI */
