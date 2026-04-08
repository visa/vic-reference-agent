/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '@/lib/api';
import { setCards, setCardsLoading, setCardsError, clearCardsError, clearCards as clearCardsAction } from '@/features/cards/slices/cardsSlice';
import { RootState } from '@/store/index';
import {
  Card,
  CardWithArt,
  AddCardFormData,
  AddCardData,
  ProvisionTokenRequest,
  ProvisionTokenData
} from '@/types';

interface CardArtResponse {
  imageUrl: string;
}

/**
 * Fetches all user cards with card art images
 */
export const fetchCards = createAsyncThunk<CardWithArt[], void>(
  'cards/fetchCards',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setCardsLoading(true));
      dispatch(clearCardsError());

      const response: Card[] = await ApiService.getCards();

      const cardArt = response.map(({cardId}) => ApiService.getCardArt(cardId));
      const cardArtResponse = await Promise.allSettled(cardArt);

      const cardsWithArt: CardWithArt[] = response.map((card, i) => ({
          ...card,
          cardArtUrl: cardArtResponse[i].status === 'fulfilled' ? (cardArtResponse[i] as PromiseFulfilledResult<CardArtResponse>).value.imageUrl : null
      }));

      dispatch(setCards(cardsWithArt));

      return cardsWithArt;
    } catch (error: unknown) {
      console.error('Error loading cards:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch cards';
      dispatch(setCardsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCardsLoading(false));
    }
  }
);

export const fetchCard = createAsyncThunk<CardWithArt, string>(
  'cards/fetchCard',
  async (cardId, { rejectWithValue }) => {
    try {
      const card: Card = await ApiService.getCard(cardId);
      const cardArtResponse: CardArtResponse = await ApiService.getCardArt(cardId);

      const cardWithArt: CardWithArt = {
        ...card,
        cardArtUrl: cardArtResponse.imageUrl
      };

      return cardWithArt;
    } catch (error: unknown) {
      console.error('Error loading card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch card';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Clears all cards and revokes card art object URLs to prevent memory leaks
 */
export const clearCards = createAsyncThunk<boolean, void>(
  'cards/clearCards',
  async (_, { dispatch, getState }) => {
    try {
      const { cards } = (getState() as RootState).cards;
      cards.forEach(({cardArtUrl}: CardWithArt) => cardArtUrl && URL.revokeObjectURL(cardArtUrl));

      dispatch(clearCardsAction());

      return true;
    } catch (error: unknown) {
      console.error('Error clearing cards:', error);
      dispatch(clearCardsAction());
      return true;
    }
  }
);

/**
 * Deletes a card and refreshes the card list
 */
export const deleteCard = createAsyncThunk<string, string>(
  'cards/deleteCard',
  async (cardId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setCardsLoading(true));
      dispatch(clearCardsError());

      await ApiService.deleteCard(cardId);

      await dispatch(fetchCards());

      return cardId;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete card';
      dispatch(setCardsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCardsLoading(false));
    }
  }
);

/**
 * Adds a new card and refreshes the card list
 */
export const addCard = createAsyncThunk<AddCardData, AddCardFormData>(
  'cards/addCard',
  async (cardDetails, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setCardsLoading(true));
      dispatch(clearCardsError());
      console.log(cardDetails)
      const response: AddCardData = await ApiService.addCard(cardDetails);

      await dispatch(fetchCards());

      return response;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add card';
      dispatch(setCardsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCardsLoading(false));
    }
  }
);

/**
 * Provisions a token for cards that don't have a tokenId
 */
export const provisionToken = createAsyncThunk<ProvisionTokenData, Card>(
  'cards/provisionToken',
  async (card, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setCardsLoading(true));
      dispatch(clearCardsError());

      const provisionPayload: ProvisionTokenRequest = {
        cardId: card.cardId
      };

      const response: ProvisionTokenData = await ApiService.provisionToken(provisionPayload);

      await dispatch(fetchCards());

      return response;
    } catch (error: unknown) {
      console.error("Provision token API error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to provision token';
      dispatch(setCardsError(errorMessage));
      return rejectWithValue(errorMessage);
    } finally {
      dispatch(setCardsLoading(false));
    }
  }
);
