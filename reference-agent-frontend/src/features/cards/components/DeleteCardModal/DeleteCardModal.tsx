/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, {useState} from 'react';
import {
    Dialog,
    DialogHeader,
    DialogContent,
    DialogCloseButton,
    Button,
    Typography,
    Utility
} from '@visa/nova-react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteCard } from '@/features/cards/thunks/cardsThunks';
import { closeModal } from '@/features/layout/slices/modalSlice';
import styles from './DeleteCardModal.module.css';
import type { RootState, AppDispatch } from '@/store';
import type { CardWithArt } from '@/types';

const DeleteCardModal: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const modalProps = useSelector((state: RootState) => state.modal.modalProps);
    const cardToDelete = modalProps?.card as CardWithArt | undefined;
    const [loading, setLoading] = useState(false);   

    const handleDeleteCard = async (): Promise<void> => {
        if (cardToDelete) {
            setLoading(true);
            await dispatch(deleteCard(cardToDelete.cardId));
            dispatch(closeModal());
        }
    };

    const handleClose = (): void => {
        dispatch(closeModal());
    };

    return (
        <>
            <div className={styles.modalOverlay} onClick={handleClose} />
            <Dialog open className={styles.dialog}>
                <DialogContent>
                    <DialogHeader>Delete Card</DialogHeader>
                    <Typography variant="body-2" style={{ textAlign: 'left', marginBottom: 'var(--size-scalable-24)' }}>
                        Are you sure you want to delete this card? This action cannot be undone.
                    </Typography>
                    <Utility className="v-flex v-flex-row" style={{ gap: 'var(--size-scalable-12)' }}>
                        <Button destructive disabled={loading} onClick={handleDeleteCard}>
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button colorScheme="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                    </Utility>
                </DialogContent>
                <DialogCloseButton onClick={handleClose} />
            </Dialog>
        </>
    );
};

export default DeleteCardModal;
