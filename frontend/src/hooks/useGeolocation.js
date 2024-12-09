import { useState, useEffect } from 'react';
import { getCurrentPosition } from '../utils/geolocation';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getLocation = async () => {
      try {
        const position = await getCurrentPosition();
        if (mounted) {
          setLocation(position);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setLocation(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getLocation();

    if (options.watch) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (mounted) {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            });
            setError(null);
          }
        },
        (err) => {
          if (mounted) {
            setError(err.message);
          }
        },
        {
          enableHighAccuracy: true,
          ...options,
        }
      );

      return () => {
        mounted = false;
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => {
      mounted = false;
    };
  }, [options.watch]);

  return { location, error, loading };
};