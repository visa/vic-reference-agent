/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import styles from './Sidebar.module.css';
import { Surface, Typography, Button } from '@visa/nova-react';
import { VisaChevronLeftTiny, VisaChevronRightTiny, VisaCategoryLow, VisaCardGenericLow, VisaOffersLow } from '@visa/nova-icons-react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { paths } from '@/config/paths';
import { toggleSidebar } from '@/features/layout/slices/sidebarSlice';
import type { RootState, AppDispatch } from '@/store';

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const visible = useSelector((state: RootState) => state.sidebar.visible);

  const handleToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <>
      <Surface className={`${styles.sidebar} ${visible ? '' : styles.closed}`}>
        <nav className={styles.sidebarNav}>
          <div className={styles.navItems}>
            <Link to={paths.chat.path} className={styles.navLink}>
              <VisaOffersLow className={styles.navIcon} style={{ '--v-icon-primary': 'black', '--v-icon-secondary': 'black' } as React.CSSProperties} />
              <Typography variant="body-2">Shop</Typography>
            </Link>

            <Link to={paths.cards.path} className={styles.navLink}>
              <VisaCardGenericLow className={styles.navIcon} style={{ '--v-icon-primary': 'black', '--v-icon-secondary': 'black' } as React.CSSProperties} />
              <Typography variant="body-2">Cards</Typography>
            </Link>
          </div>
        </nav>
      
      {visible && (
        <div className={styles.togglerWrapper}>
          <Button
            colorScheme="secondary"
            className={styles.toggler}
            onClick={handleToggle}
            aria-label="Hide sidebar"
          >
            <VisaChevronLeftTiny />
          </Button>
        </div>
      )}
      </Surface>

      <Button
        colorScheme="secondary"
        className={`${styles.floatingToggler} ${!visible ? styles.visible : ''}`}
        onClick={handleToggle}
        aria-label="Show sidebar"
      >
        <VisaChevronRightTiny />
      </Button>
    </>
  );
};

export default Sidebar;
