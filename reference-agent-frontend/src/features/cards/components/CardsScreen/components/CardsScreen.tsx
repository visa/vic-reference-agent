/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import React, { useCallback, useEffect } from 'react';
import { VisaDeleteTiny, VisaChevronRightTiny, VisaAddTiny } from '@visa/nova-icons-react'
import { useDispatch, useSelector } from 'react-redux';
import { openModal } from '@/features/layout/slices/modalSlice';
import { handleSetUpPasskey } from '@/features/cards/thunks/enrollmentThunks';
import { provisionToken } from '@/features/cards/thunks/cardsThunks';
import {
    ContentCard,
    ContentCardBody,
    ContentCardImage,
    Button,
    Badge,
    Divider,
    Typography,
    SectionMessage,
    SectionMessageContent,
    SectionMessageIcon,
    Surface
} from '@visa/nova-react'
import styles from './CardsScreen.module.css';
import defaultCardArt from '@/assets/card-art.png';
import { clearCardsError } from '@/features/cards/slices/cardsSlice';
import type { RootState, AppDispatch } from '@/store';
import type { CardWithArt } from '@/types';

const CardsScreen: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const cards = useSelector((state: RootState) => state.cards.cards) as CardWithArt[];
    const loading = useSelector((state: RootState) => state.cards.isLoadingCards);
    const error = useSelector((state: RootState) => state.cards.cardsError);
    const enrollingCardId = useSelector((state: RootState) => state.cards.enrollingCardId);

    const openAddCardModal = useCallback(() => {
        console.log("Opening add card modal");
        dispatch(openModal({ modalType: 'addCard' }));
    }, [dispatch]);

    const openDeleteCardModal = useCallback((cardToDelete: CardWithArt) => {
        dispatch(openModal({ 
            modalType: 'deleteCard',
            props: {
                card: cardToDelete
            }
        }));
    }, [dispatch]);

    const handleSetUpPasskeyClick = useCallback((card: CardWithArt) => {
        dispatch(handleSetUpPasskey(card));
    }, [dispatch]);

    const handleProvisionTokenClick = useCallback((card: CardWithArt) => {
        dispatch(provisionToken(card));
    }, [dispatch]);

    // Clear any existing error when component mounts
    useEffect(() => {
        dispatch(clearCardsError());
    }, [dispatch]);

    return (
        <Surface className="v-flex v-flex-col v-align-items-start" style={{ width: '100%', padding: '20px', gap: 'var(--size-scalable-24)' }}>
            <Typography variant="headline-2" tag="h2">
                Your Cards
            </Typography>

            {error && (
                <SectionMessage messageType="error" style={{ width: '100%' }}>
                    <SectionMessageIcon />
                    <SectionMessageContent>{error}</SectionMessageContent>
                </SectionMessage>
            )}

            {loading ? (
                <Typography variant="body-2">Loading cards...</Typography>
            ) : cards.length === 0 ? (
                <Typography variant="body-2">No cards found. Please add a card.</Typography>
            ) : (
                <div className="v-flex v-flex-row v-flex-wrap v-align-items-start" style={{ gap: 'var(--size-scalable-20)', width: '100%' }}>
                    {cards.map((card: CardWithArt, index: number) => (
                        <ContentCard key={index} style={{ width: '300px' }}>
                            <ContentCardBody>
                                <ContentCardImage className={styles.cardImageWrapper}>
                                    <img
                                        className={styles.cardArt}
                                        src={card.cardArtUrl || defaultCardArt}
                                        alt={`Card Art for card ending in ${card.last4}`}
                                    />
                                </ContentCardImage>
                                <Divider dividerType='decorative' style={{ marginTop: 'var(--size-scalable-8)', marginBottom: 'var(--size-scalable-8)' }}/>

                                <div className="v-flex v-flex-row v-justify-content-between v-align-items-start" style={{ marginBottom: 'var(--size-scalable-12)' }}>
                                    <Typography variant="body-2-medium">
                                        •••• •••• •••• {card.last4}
                                    </Typography>
                                    <Badge badgeType={
                                        !card.tokenId ? "warning" :
                                        card.status === "ACTIVE" ? "stable" :
                                        "neutral"
                                    }>
                                        {!card.tokenId ? "UNPROVISIONED" : card.status}
                                    </Badge>
                                </div>

                                <div className="v-flex v-flex-row v-justify-content-between v-align-items-center" style={{ gap: 'var(--size-scalable-12)' }}>
                                    {!card.tokenId ? (
                                        <Button onClick={() => handleProvisionTokenClick(card)}>
                                            Provision Token
                                        </Button>
                                    ) : card.status === 'PENDING' && (
                                        <Button
                                            onClick={() => handleSetUpPasskeyClick(card)}
                                            disabled={enrollingCardId === card.cardId}
                                        >
                                            {enrollingCardId === card.cardId
                                                ? 'Setting up...'
                                                : 'Set Up Passkey'}
                                            {enrollingCardId !== card.cardId && <VisaChevronRightTiny />}
                                        </Button>
                                    )}
                                    <Button
                                        destructive
                                        colorScheme="secondary"
                                        aria-label="Delete Card"
                                        disabled={loading}
                                        onClick={() => openDeleteCardModal(card)}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        <VisaDeleteTiny />
                                        Delete
                                    </Button>
                                </div>
                            </ContentCardBody>
                        </ContentCard>
                    ))}
                </div>
            )}

            <Button onClick={openAddCardModal}>
                <VisaAddTiny />
                Add Card
            </Button>
        </Surface>
    );
};

export default React.memo(CardsScreen);
