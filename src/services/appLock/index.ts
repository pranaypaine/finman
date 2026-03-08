/**
 * App Lock Service
 * Biometric authentication and PIN protection
 */

import ReactNativeBiometrics, {BiometryTypes} from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const rnBiometrics = new ReactNativeBiometrics({allowDeviceCredentials: true});

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: '@fintrack/biometric_enabled',
  PIN_CODE: '@fintrack/pin_code',
  LOCK_TIMEOUT: '@fintrack/lock_timeout',
  LAST_ACTIVE: '@fintrack/last_active',
};

export interface BiometricCapability {
  available: boolean;
  biometryType?: string;
}

export interface LockSettings {
  biometricEnabled: boolean;
  pinCode?: string;
  lockTimeout: number; // in minutes
}

/**
 * Check if device supports biometrics
 */
export async function checkBiometricCapability(): Promise<BiometricCapability> {
  try {
    const {available, biometryType} = await rnBiometrics.isSensorAvailable();
    return {available, biometryType};
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return {available: false};
  }
}

/**
 * Get friendly name for biometry type
 */
export function getBiometryTypeName(type?: string): string {
  switch (type) {
    case 'FaceID':
    case BiometryTypes.FaceID:
      return 'Face ID';
    case 'TouchID':
    case BiometryTypes.TouchID:
      return 'Touch ID';
    case 'Biometrics':
    case BiometryTypes.Biometrics:
      return 'Biometrics';
    default:
      return 'Biometric Authentication';
  }
}

/**
 * Authenticate with biometrics
 */
export async function authenticateWithBiometrics(
  promptMessage: string = 'Authenticate to access FinTrack AI',
): Promise<{success: boolean; error?: string}> {
  try {
    const {success, error} = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    return {success, error};
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {success: false, error: error.message || 'Authentication failed'};
  }
}

/**
 * Enable biometric authentication
 */
export async function enableBiometric(): Promise<boolean> {
  try {
    const {available} = await checkBiometricCapability();
    if (!available) {
      return false;
    }

    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    return true;
  } catch (error) {
    console.error('Error enabling biometric:', error);
    return false;
  }
}

/**
 * Disable biometric authentication
 */
export async function disableBiometric(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
}

/**
 * Check if biometric is enabled
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
}

/**
 * Set PIN code
 */
export async function setPinCode(pin: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PIN_CODE, pin);
}

/**
 * Verify PIN code
 */
export async function verifyPinCode(pin: string): Promise<boolean> {
  try {
    const storedPin = await AsyncStorage.getItem(STORAGE_KEYS.PIN_CODE);
    return storedPin === pin;
  } catch (error) {
    return false;
  }
}

/**
 * Check if PIN is set
 */
export async function hasPinCode(): Promise<boolean> {
  try {
    const pin = await AsyncStorage.getItem(STORAGE_KEYS.PIN_CODE);
    return pin !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Remove PIN code
 */
export async function removePinCode(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.PIN_CODE);
}

/**
 * Set lock timeout (in minutes)
 */
export async function setLockTimeout(minutes: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LOCK_TIMEOUT, minutes.toString());
}

/**
 * Get lock timeout (in minutes)
 */
export async function getLockTimeout(): Promise<number> {
  try {
    const timeout = await AsyncStorage.getItem(STORAGE_KEYS.LOCK_TIMEOUT);
    return timeout ? parseInt(timeout, 10) : 5; // Default 5 minutes
  } catch (error) {
    return 5;
  }
}

/**
 * Update last active timestamp
 */
export async function updateLastActive(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, Date.now().toString());
}

/**
 * Check if app should be locked based on timeout
 */
export async function shouldLockApp(): Promise<boolean> {
  try {
    const biometricEnabled = await isBiometricEnabled();
    const hasPin = await hasPinCode();

    // If no security is enabled, don't lock
    if (!biometricEnabled && !hasPin) {
      return false;
    }

    const lastActive = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
    if (!lastActive) {
      return true; // First time, should authenticate
    }

    const timeout = await getLockTimeout();
    const lastActiveTime = parseInt(lastActive, 10);
    const now = Date.now();
    const minutesPassed = (now - lastActiveTime) / (1000 * 60);

    return minutesPassed >= timeout;
  } catch (error) {
    console.error('Error checking lock status:', error);
    return false;
  }
}

/**
 * Get current lock settings
 */
export async function getLockSettings(): Promise<LockSettings> {
  const biometricEnabled = await isBiometricEnabled();
  const hasPin = await hasPinCode();
  const lockTimeout = await getLockTimeout();

  return {
    biometricEnabled,
    pinCode: hasPin ? '****' : undefined,
    lockTimeout,
  };
}

/**
 * Authenticate (tries biometric first, then PIN fallback)
 */
export async function authenticate(): Promise<{success: boolean; error?: string}> {
  const biometricEnabled = await isBiometricEnabled();

  if (biometricEnabled) {
    const {available} = await checkBiometricCapability();
    if (available) {
      return authenticateWithBiometrics();
    }
  }

  // If biometric not available or not enabled, app should prompt for PIN
  return {success: false, error: 'PIN required'};
}
