/**
 * @file Custom hook for accessing the user's geolocation.
 * @version 1.0.0
 * @since 2024-07-26
 */
import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: GeolocationPositionError | null;
  isLoading: boolean;
}

const defaultState: GeolocationState = {
  latitude: null,
  longitude: null,
  accuracy: null,
  error: null,
  isLoading: true,
};

/**
 * A custom hook to get the user's current geolocation.
 * It handles loading states, errors, and provides the location data.
 *
 * @returns {GeolocationState & { refetch: () => void }} The geolocation state and a function to refetch the location.
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>(defaultState);

  const refetch = () => {
    setState(defaultState);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        });
      },
      (error) => {
        setState({
          latitude: null,
          longitude: null,
          accuracy: null,
          error,
          isLoading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: new Error('Geolocation is not supported by your browser.') as any, isLoading: false }));
      return;
    }
    refetch();
  }, []);

  return { ...state, refetch };
};
