import { getDistance } from 'geolib';
import { getDangerZones } from '../data/dangerZones';

/**
 * Check if user is within any danger zone
 * @param {number} userLatitude - User's latitude
 * @param {number} userLongitude - User's longitude
 * @returns {Object|null} Danger zone object if within zone, null otherwise
 */
export const checkDangerZone = (userLatitude, userLongitude) => {
  const zones = getDangerZones();
  
  for (const zone of zones) {
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
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
};

/**
 * Format coordinates for display
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} precision - Number of decimal places (default: 4)
 * @returns {string} Formatted coordinates string
 */
export const formatCoordinates = (latitude, longitude, precision = 4) => {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};
