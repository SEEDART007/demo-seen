/**
 * Danger zones configuration
 * Contains predefined danger zones with their coordinates, radius, and names
 */

const DANGER_ZONES = [
  {
    id: 1,
    latitude: 37.7749,
    longitude: -122.4194,
    radius: 200,
    name: "Restricted Area 1",
    type: "restricted",
    severity: "high"
  },
  {
    id: 2,
    latitude: 37.7800,
    longitude: -122.4200,
    radius: 150,
    name: "High Crime Area",
    type: "crime",
    severity: "high"
  },
  {
    id: 3,
    latitude: 37.421998,
    longitude: -122.084000,
    radius: 150,
    name: "High Crime Area",
    type: "crime",
    severity: "high"
  }
];

/**
 * Get all danger zones
 * @returns {Array} Array of danger zone objects
 */
export const getDangerZones = () => DANGER_ZONES;

/**
 * Get danger zone by ID
 * @param {number} id - The zone ID
 * @returns {Object|null} Danger zone object or null if not found
 */
export const getDangerZoneById = (id) => {
  if (typeof id !== 'number' && typeof id !== 'string') {
    return null;
  }
  return DANGER_ZONES.find(zone => zone.id === id) || null;
};

/**
 * Get danger zones by type
 * @param {string} type - Zone type (restricted, crime, etc.)
 * @returns {Array} Array of matching danger zones
 */
export const getDangerZonesByType = (type) => {
  if (typeof type !== 'string' || !type.trim()) {
    return [];
  }
  const validTypes = ['restricted', 'crime', 'construction', 'emergency'];
  if (!validTypes.includes(type)) {
    return [];
  }
  return DANGER_ZONES.filter(zone => zone.type === type);
};

/**
 * Get danger zones by severity
 * @param {string} severity - Severity level (high, medium, low)
 * @returns {Array} Array of matching danger zones
 */
export const getDangerZonesBySeverity = (severity) => {
  if (typeof severity !== 'string' || !severity.trim()) {
    return [];
  }
  const validSeverities = ['low', 'medium', 'high'];
  if (!validSeverities.includes(severity)) {
    return [];
  }
  return DANGER_ZONES.filter(zone => zone.severity === severity);
};
