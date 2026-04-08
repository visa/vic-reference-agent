/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import currencyData from '@/assets/iso4217.json'

export type Currency = {
  CtryNm: string;
  CcyNm: string | { _IsFund: string; __text: string };
  Ccy: string;
  CcyNbr: string;
  CcyMnrUnts?: string; 
}

/**
 * Get all unique currencies from ISO 4217 data
 * Filters out entries without currency codes and removes duplicates
 * (multiple countries can use the same currency)
 * @returns Array of unique Currency objects with normalized currency names
 */
export function getAllCurrencies(): Array<Omit<Currency, 'CcyNm'> & { CcyNm: string }> {
  const seen = new Set<string>();
  const currencies = currencyData.ISO_4217.CcyTbl.CcyNtry
    .filter((currency) => {
      // Skip entries without a currency code
      if (!currency.Ccy) {
        return false;
      }
      
      // Skip duplicates (same currency used by multiple countries)
      if (seen.has(currency.Ccy)) {
        return false;
      }
      
      seen.add(currency.Ccy);
      return true;
    })
    .map((currency) => ({
      CtryNm: currency.CtryNm,
      Ccy: currency.Ccy!,
      CcyNbr: currency.CcyNbr!,
      CcyMnrUnts: currency.CcyMnrUnts,
      // Normalize CcyNm to always be a string
      CcyNm: typeof currency.CcyNm === 'string' 
        ? currency.CcyNm 
        : currency.CcyNm.__text
    }));
  
  return currencies;
}

/**
 * Dynamically generate currency code map from ISO 4217 data
 * Maps alphabetic codes (USD) to numeric codes (840)
 */
export const CURRENCY_CODE_MAP: Record<string, string> = getAllCurrencies().reduce((map, currency) => {
  map[currency.Ccy] = currency.CcyNbr;
  return map;
}, {} as Record<string, string>);

/**
 * Converts alphabetic currency code to numeric ISO 4217 code
 * @param code - Alphabetic currency code (e.g., 'USD') or numeric code (e.g., '840')
 * @returns Numeric currency code (e.g., '840')
 */
export function convertToNumericCurrencyCode(code: string | null | undefined): string {
  if (!code) {
    return '840'; // Default to USD
  }

  // If already numeric (3 digits), return as-is
  if (/^\d{3}$/.test(code)) {
    return code;
  }

  // Convert alphabetic to numeric
  const numericCode = CURRENCY_CODE_MAP[code.toUpperCase()];

  if (!numericCode) {
    console.warn(`Unknown currency code: ${code}, defaulting to USD (840)`);
    return '840';
  }

  return numericCode;
}

/**
 * Get currency options formatted for dropdown components
 * Returns array of { value, label } objects sorted alphabetically
 * @returns Array of currency options for Select components
 */
export function getCurrencyOptions(): Array<{ value: string; label: string }> {
  return getAllCurrencies()
    .map((currency) => ({
      value: currency.Ccy,
      label: `${currency.Ccy} - ${currency.CcyNm}`
    }))
    .sort((a, b) => a.value.localeCompare(b.value));
}

/**
 * Get currency information by alphabetic code
 * @param code - Alphabetic currency code (e.g., 'USD', 'EUR')
 * @returns Currency object or undefined if not found
 */
export function getCurrencyByCode(code: string): (Omit<Currency, 'CcyNm'> & { CcyNm: string }) | undefined {
  return getAllCurrencies().find(
    (currency) => currency.Ccy.toUpperCase() === code.toUpperCase()
  );
}

/**
 * Get currency information by numeric ISO 4217 code
 * @param numericCode - Numeric currency code (e.g., '840', '978')
 * @returns Currency object or undefined if not found
 */
export function getCurrencyByNumericCode(numericCode: string): (Omit<Currency, 'CcyNm'> & { CcyNm: string }) | undefined {
  return getAllCurrencies().find(
    (currency) => currency.CcyNbr === numericCode
  );
}

/**
 * Convert numeric currency code to alphabetic code
 * @param numericCode - Numeric currency code (e.g., '840')
 * @returns Alphabetic currency code (e.g., 'USD') or numeric code if not found
 */
export function convertToAlphabeticCurrencyCode(numericCode: string): string {
  const currency = getCurrencyByNumericCode(numericCode);
  return currency ? currency.Ccy : numericCode;
}

/**
 * Format currency display string from code
 * @param code - Alphabetic or numeric currency code
 * @returns Formatted string like "USD - US Dollar" or just the code if not found
 */
export function formatCurrencyDisplay(code: string): string {
  // Try alphabetic lookup first
  let currency = getCurrencyByCode(code);
  
  // If not found, try numeric lookup
  if (!currency && /^\d{3}$/.test(code)) {
    currency = getCurrencyByNumericCode(code);
  }
  
  return currency ? `${currency.Ccy} - ${currency.CcyNm}` : code;
}

/**
 * Get the currency name from code
 * @param code - Alphabetic or numeric currency code
 * @returns Currency name (e.g., "US Dollar") or code if not found
 */
export function getCurrencyName(code: string): string {
  // Try alphabetic lookup first
  let currency = getCurrencyByCode(code);
  
  // If not found, try numeric lookup
  if (!currency && /^\d{3}$/.test(code)) {
    currency = getCurrencyByNumericCode(code);
  }
  
  return currency ? currency.CcyNm : code;
}
