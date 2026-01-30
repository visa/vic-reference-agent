/* © 2026 Visa.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  browser: {
    name?: string;
    version?: string;
  };
  os: {
    name?: string;
    version?: string;
  };
  device: {
    vendor?: string;
    model?: string;
    type?: string;
  };
  engine: {
    name?: string;
    version?: string;
  };
  system: {
    timezone: string;
    language: string;
    userAgent: string;
  };
}

export interface VICDeviceData {
  type: string;
  brand: string;
  manufacturer?: string;
  model?: string;
}

export const getClientDeviceId = () => {
  const storedDeviceId = localStorage.getItem('clientDeviceId');
  if (storedDeviceId) {
    return storedDeviceId;
  }
  const newDeviceId = crypto.randomUUID(); // Generate a new UUID
  localStorage.setItem('clientDeviceId', newDeviceId); // Store it in localStorage
  return newDeviceId;
};

 export const getDeviceInfo = (): DeviceInfo => {
    const parser = new UAParser();
    const result = parser.getResult();
    
    return {
      browser: {
        name: result.browser.name,
        version: result.browser.version
      },
      os: {
        name: result.os.name,
        version: result.os.version
      },
      device: {
        vendor: result.device.vendor,
        model: result.device.model,
        type: result.device.type
      },
      engine: {
        name: result.engine.name,
        version: result.engine.version
      },
      system: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        userAgent: navigator.userAgent
      }
    };
  };

  /**
   * Maps device info to VIC endpoint deviceData format.
   *
   * VIC deviceData requires:
   * - type (required): Type of device
   * - brand (required): Brand name of the device
   * - manufacturer (optional): Manufacturer of the device
   * - model (optional): Specific model of the device
   *
   * All fields are strings with max 255 characters matching pattern: (?!^[*.,'#_/-]+$)(?!.*\./.*)^.*$
   *
   * UAParser device types: console, embedded, mobile, smarttv, tablet, wearable, xr
   * If device.type is undefined/null, defaults to "Desktop"
   */
  export const mapDeviceInfoForVIC = (deviceInfo: DeviceInfo): VICDeviceData => {
    // Use device type as-is from UAParser, or default to "Desktop" if undefined/null
    const deviceType = deviceInfo.device.type || 'Desktop';

    // Extract brand (vendor), defaulting to OS name or "Unknown"
    const brand = deviceInfo.device.vendor || deviceInfo.os.name || 'Unknown';

    // Extract manufacturer (same as vendor in most cases)
    const manufacturer = deviceInfo.device.vendor;

    // Extract model
    const model = deviceInfo.device.model;

    // Build the deviceData object with only VIC-required fields
    const result: {
      type: string;
      brand: string;
      manufacturer?: string;
      model?: string;
    } = {
      type: deviceType,
      brand: brand
    };

    // Add optional fields only if they have values
    if (manufacturer) {
      result.manufacturer = manufacturer;
    }
    if (model) {
      result.model = model;
    }

    return result;
  };

