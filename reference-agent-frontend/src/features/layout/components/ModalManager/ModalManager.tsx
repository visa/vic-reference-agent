/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React from 'react';
import { useSelector } from 'react-redux';
import AddCardModal from '@/features/cards/components/AddCardModal/AddCardModal';
import APILogModal from '@/features/logs/components/APILogModal/APILogModal';
import PasskeyModal from '@/features/layout/components/PasskeyModal/PasskeyModal';
import DeleteCardModal from '@/features/cards/components/DeleteCardModal/DeleteCardModal';
import type { RootState } from '@/store';

type ModalType =
  | 'addCard'
  | 'apiLog'
  | 'passkeyModal'
  | 'deleteCard';

type ModalComponents = {
  [K in ModalType]: React.ComponentType;
};

const MODALS: ModalComponents = {
    addCard: AddCardModal,
    apiLog: APILogModal,
    passkeyModal: PasskeyModal,
    deleteCard: DeleteCardModal,
};

const ModalManager: React.FC = () => {
    const currentModal = useSelector((state: RootState) => state.modal.activeModal) as ModalType | null;

    if (!currentModal) {
        return null; // No modal to render
    }

    const ModalComponent = MODALS[currentModal];

    if (!ModalComponent) {
        console.warn(`Modal component for "${currentModal}" not found.`);
        return null;
    }

    return <ModalComponent />;
};

export default ModalManager;
