import Bowser from 'bowser';

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
    const parsed = Bowser.parse(navigator.userAgent);

    return {
      browser: {
        name: parsed.browser.name,
        version: parsed.browser.version
      },
      os: {
        name: parsed.os.name,
        version: parsed.os.version
      },
      device: {
        vendor: parsed.platform.vendor,
        model: parsed.platform.model,
        type: parsed.platform.type
      },
      engine: {
        name: parsed.engine.name,
        version: parsed.engine.version
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
   * Bowser platform types: desktop, mobile, tablet, tv
   * If device.type is undefined/null, defaults to "Desktop"
   */
  export const mapDeviceInfoForVIC = (deviceInfo: DeviceInfo): VICDeviceData => {
    // Use device type as-is from Bowser, or default to "Desktop" if undefined/null
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

