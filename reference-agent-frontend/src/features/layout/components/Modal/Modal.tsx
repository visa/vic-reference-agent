/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, {ReactNode} from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  children: ReactNode;
  onClose: any; // onClose can be a lot of things
  customClassName?: string;
  customContentClassName?: string;
  closeOnOverlayClick?: boolean;
}

const Modal = ({
  children,
  onClose,
  customClassName = '',
  customContentClassName = '',
  closeOnOverlayClick = true
}: ModalProps) => {
  // Prevent clicks inside the modal content from closing the modal
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  // Handle overlay click, respecting the closeOnOverlayClick setting
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && onClose) {
      onClose(e);
    }
  };

  return (
    <div className={`${styles.modalOverlay} ${customClassName}`} onClick={handleOverlayClick}>
      <div className={`${styles.modalContent} ${customContentClassName}`} onClick={handleContentClick}>
        <button className={styles.modalCloseButton} onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;