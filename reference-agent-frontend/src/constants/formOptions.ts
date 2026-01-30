/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* START GENAI */
// Form options constants
// These are static data arrays that don't change and don't belong in Redux state

import { getCurrencyOptions } from "@/utils/currencyUtils";

export const mandateCategoryOptions = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing & Fashion' },
  { value: 'books', label: 'Books & Media' },
  { value: 'food', label: 'Food & Restaurants' },
  { value: 'travel', label: 'Travel & Transportation' },
  { value: 'health', label: 'Health & Beauty' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'sports', label: 'Sports & Recreation' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' }
];

export const currencyOptions = getCurrencyOptions();

export const countryCodeOptions = [
  { value: 'US', label: 'US - United States' },
  { value: 'CA', label: 'CA - Canada' },
  { value: 'GB', label: 'GB - United Kingdom' },
  { value: 'DE', label: 'DE - Germany' },
  { value: 'FR', label: 'FR - France' },
  { value: 'ES', label: 'ES - Spain' },
  { value: 'IT', label: 'IT - Italy' },
  { value: 'NL', label: 'NL - Netherlands' },
  { value: 'AU', label: 'AU - Australia' },
  { value: 'JP', label: 'JP - Japan' },
  { value: 'KR', label: 'KR - South Korea' },
  { value: 'SG', label: 'SG - Singapore' },
  { value: 'HK', label: 'HK - Hong Kong' },
  { value: 'IN', label: 'IN - India' },
  { value: 'BR', label: 'BR - Brazil' },
  { value: 'MX', label: 'MX - Mexico' }
];

export const frequencyOptions = [
  { value: 'one-time', label: 'One Time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' }
];

export const recurringFrequencyOptions = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
];
/* END GENAI */
