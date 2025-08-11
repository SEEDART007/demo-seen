import { getDistance } from 'geolib';
import { getDangerZones } from '../data/dangerZones';

/**
 * Check if user is within any danger zone
 * @param {number} userLatitude - User's latitude
 * @param {number} userLongitude - User's longitude
 * @returns {Object|null} Danger zone object if within zone, null otherwise
 */
export const checkDangerZone = (userLatitude, userLongitude) => {
  if (typeof userLatitude !== 'number' || typeof userLongitude !== 'number') {
    return null;
  }
  
  if (userLatitude < -90 || userLatitude > 90 || userLongitude < -180 || userLongitude > 180) {
    return null;
  }
  
  const zones = getDangerZones();
  
  for (const zone of zones) {
    if (!zone.latitude || !zone.longitude || !zone.radius) {
      continue;
    }
    
    const distance = getDistance(
      { latitude: userLatitude, longitude: userLongitude },
      { latitude: zone.latitude, longitude: zone.longitude }
    );
    
    if (distance <= zone.radius) {
      return zone;
    }
  }
  
  return null;
};

/**
 * Calculate distance from user to specific zone
 * @param {number} userLatitude - User's latitude
 * @param {number} userLongitude - User's longitude
 * @param {Object} zone - Zone object with coordinates
 * @returns {number} Distance in meters
 */
export const calculateDistanceToZone = (userLatitude, userLongitude, zone) => {
  if (typeof userLatitude !== 'number' || typeof userLongitude !== 'number') {
    return null;
  }
  
  if (!zone || typeof zone.latitude !== 'number' || typeof zone.longitude !== 'number') {
    return null;
  }
  
  return getDistance(
    { latitude: userLatitude, longitude: userLongitude },
    { latitude: zone.latitude, longitude: zone.longitude }
  );
};

/**
 * Generate Google Maps URL for given coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {string} Google Maps URL
 */
export const generateMapsUrl = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }
  
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }
  
  return `https://www.google.com/maps?q=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}`;
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude, precision = 4) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    return 'Invalid coordinates';
  }
  
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return 'Invalid coordinates';
  }
  
  const safePrecision = Math.max(0, Math.min(10, Math.floor(precision || 4)));
  return `${latitude.toFixed(safePrecision)}, ${longitude.toFixed(safePrecision)}`;
};
