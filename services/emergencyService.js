import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { Alert } from 'react-native';
import { API_ENDPOINTS, LOCATION_CONFIG } from '../constants/config';
import { generateMapsUrl } from '../utils/locationUtils';

/**
 * Emergency Service
 * Handles emergency SMS sending and location-based alerts
 */
class EmergencyService {
  /**
   * Send emergency SMS to contacts with location
   * @param {Array} contacts - Array of contact numbers
   * @param {string} triggerWord - The detected trigger word
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   */
  static sendEmergencySMS = async (contacts, triggerWord, onSuccess, onError) => {
    if (!contacts || contacts.length === 0) {
      Alert.alert('No Contacts', 'Please add at least one contact.');
      return;
    }

    try {
      console.log('Getting location for emergency SMS...');
      
      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const mapsUrl = generateMapsUrl(latitude, longitude);
            const message = `Emergency! Trigger word "${triggerWord}" detected.\nLocation: ${mapsUrl}`;

            console.log('Sending emergency SMS...');
            const response = await axios.post(API_ENDPOINTS.SMS_SERVICE, {
              to: contacts,
              message: message,
            });

            console.log('SMS service response:', response.data);

            if (response.data.success) {
              Alert.alert('SMS Sent', 'Emergency SMS with location has been sent.');
              onSuccess && onSuccess(response.data);
            } else {
              Alert.alert('Failed', 'Server could not send SMS.');
              onError && onError(new Error('SMS service failed'));
            }
          } catch (error) {
            console.error('Error sending SMS:', error.message);
            Alert.alert('Error', 'Failed to contact SMS server.');
            onError && onError(error);
          }
        },
        (error) => {
          console.error('Location error:', error.message);
          Alert.alert('Location Error', 'Could not get GPS location.');
          onError && onError(error);
        },
        {
          enableHighAccuracy: LOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
          timeout: LOCATION_CONFIG.TIMEOUT,
          maximumAge: LOCATION_CONFIG.MAXIMUM_AGE
        }
      );
    } catch (error) {
      console.error('Emergency SMS error:', error.message);
      Alert.alert('Error', 'Failed to initiate emergency SMS.');
      onError && onError(error);
    }
  };

  /**
   * Get current location
   * @param {Function} onSuccess - Success callback with position
   * @param {Function} onError - Error callback
   */
  static getCurrentLocation = (onSuccess, onError) => {
    Geolocation.getCurrentPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: LOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
        timeout: LOCATION_CONFIG.TIMEOUT,
        maximumAge: LOCATION_CONFIG.MAXIMUM_AGE
      }
    );
  };

  /**
   * Watch position changes
   * @param {Function} onPositionChange - Callback for position updates
   * @param {Function} onError - Error callback
   * @returns {number} Watch ID for clearing the watch
   */
  static watchPosition = (onPositionChange, onError) => {
    return Geolocation.watchPosition(
      onPositionChange,
      onError,
      {
        enableHighAccuracy: LOCATION_CONFIG.ENABLE_HIGH_ACCURACY,
        distanceFilter: LOCATION_CONFIG.DISTANCE_FILTER
      }
    );
  };

  /**
   * Clear position watch
   * @param {number} watchId - Watch ID to clear
   */
  static clearWatch = (watchId) => {
    Geolocation.clearWatch(watchId);
  };
}

export default EmergencyService;
