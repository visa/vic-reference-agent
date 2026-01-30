/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { AuthenticateMessage, AuthenticationContext, AuthSessionMessage, ReferenceMap } from "@/types";
import { COMMANDS, completeWithError } from "@/features/passkey/slices/passkeySlice";

/**
 * Extracts a query parameter value from a URL
 * @param {string} url - The URL to parse
 * @param {string} param - The parameter name to extract
 * @returns {string|null} The parameter value or null if not found
 */
export const getQueryParam = (url: string, param: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get(param);
  } catch {
    return null;
  }
};

/**
 * Decodes a base64url encoded string to a JavaScript object
 * @param {string} str - The base64url encoded string
 * @returns {Object} The decoded JavaScript object
 */
export const base64UrlDecode = (str: string): object => {
  // Replace URL-safe characters and add padding
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  
  return JSON.parse(atob(base64 + padding));
};

/**
 * Retrieves or creates a persistent clientReferenceId for a given cardId
 * @param {string} cardId - The card identifier
 * @returns {string} The clientReferenceId
 */
export const getClientReferenceId = (cardId: string): string => {
  if (!cardId) return crypto.randomUUID();
  
  try {
    // Try to get existing mapping from localStorage
    const storageKey = 'passkeyClientReferenceIds';
    let referenceMap: ReferenceMap = {};
    
    const storedMap = localStorage.getItem(storageKey);
    if (storedMap) {
      referenceMap = JSON.parse(storedMap);
    }
    
    // If we already have a clientReferenceId for this card, use it
    if (referenceMap[cardId]) {
      return referenceMap[cardId];
    }
    
    // Otherwise generate a new one and store it
    const newReferenceId = crypto.randomUUID();
    referenceMap[cardId] = newReferenceId;
    localStorage.setItem(storageKey, JSON.stringify(referenceMap));
    
    return newReferenceId;
  } catch (error) {
    // If localStorage fails (private browsing, etc.), fallback to random ID
    console.error('Failed to access localStorage:', error);
    return crypto.randomUUID();
  }
};

/**
 * Clears the stored clientReferenceId for a given cardId
 * @param {string} cardId - The card identifier
 */
export const clearClientReferenceId = (cardId: string) => {
  if (!cardId) return;
  
  try {
    const storageKey = 'passkeyClientReferenceIds';
    const storedMap = localStorage.getItem(storageKey);
    if (storedMap) {
      const referenceMap = JSON.parse(storedMap);
      if (referenceMap[cardId]) {
        delete referenceMap[cardId];
        localStorage.setItem(storageKey, JSON.stringify(referenceMap));
      }
    }
  } catch (error) {
    console.error('Failed to access localStorage:', error);
  }
};

/**
 * Creates an auth session message for passkey authentication
 * @param {any} authReadyResponse - The auth ready response containing requestID
 * @param {string} clientReferenceId - The client reference ID
 * @returns {object} The auth session message
 */
export const createAuthSessionMessage = (authReadyResponse: any, dispatch: any, clientReferenceId: string | null): AuthSessionMessage => {

  if (!clientReferenceId) {
      dispatch(completeWithError("Missing clientReferenceId for auth session message"));
      throw new Error("Missing clientReferenceId for auth session message");
  }
  
  return {
      type: COMMANDS.CREATE_AUTH_SESSION,
      requestID: authReadyResponse.requestID,
      version: "1",
      client: {
          id: clientReferenceId
      }
  };
};

/**
 * Creates an authenticate message for passkey authentication
 * @param {any} authReadyResponse - The auth ready response containing requestID
 * @param {AuthenticationContext} authContext - The authentication context
 * @returns {AuthenticateMessage} The authenticate message
 */
export const createAuthenticateMessage = (authReadyResponse: any, authContext: AuthenticationContext, dispatch: any): AuthenticateMessage => {
    if (!authContext) {
        dispatch(completeWithError("Missing authContext for authenticate message"));
        throw new Error("Missing authContext for authenticate message");
    }
    
    return {
        type: COMMANDS.AUTHENTICATE,
        requestID: authReadyResponse.requestID,
        version: "1",
        authenticationContext: authContext
    };
};