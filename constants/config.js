/**
 * Application configuration constants
 * Centralized location for all app-wide configuration values
 */

// API Configuration
export const API_KEYS = {
  DEEPGRAM: process.env.DEEPGRAM_API_KEY || null,
};

export const API_ENDPOINTS = {
  DEEPGRAM: 'https://api.deepgram.com/v1/listen',
  SMS_SERVICE: 'https://riseup-sms-6262.twil.io/welcome',
};

// Audio Recording Configuration
export const AUDIO_CONFIG = {
  RECORDING_DURATION: 5000, // 5 seconds
  FILE_FORMAT: 'm4a',
  CONTENT_TYPE: 'audio/m4a',
};

// Location Configuration
export const LOCATION_CONFIG = {
  ENABLE_HIGH_ACCURACY: true,
  DISTANCE_FILTER: 10,
  TIMEOUT: 15000,
  MAXIMUM_AGE: 10000,
  COORDINATE_PRECISION: 4,
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'danger-zone-alerts',
  CHANNEL_NAME: 'Danger Zone Alerts',
  IMPORTANCE: 4,
  VIBRATE: true,
};

// Default Values
export const DEFAULTS = {
  TRIGGER_WORD: 'help',
  EMERGENCY_CONTACTS: [],
};

// Storage Keys
export const STORAGE_KEYS = {
  EMERGENCY_CONTACTS: '@emergency_contacts',
  TRIGGER_WORD: '@trigger_word',
};

// Permission Types
export const PERMISSIONS = {
  LOCATION: 'ACCESS_FINE_LOCATION',
  MICROPHONE: 'RECORD_AUDIO',
  SMS: 'SEND_SMS',
};
