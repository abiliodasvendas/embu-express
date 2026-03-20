import { getMessage } from '@/constants/messages';
import { GeolocationPermissionState, LocationData } from '@/types/geolocation';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { useCallback, useState } from 'react';

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<GeolocationPermissionState>('unknown');
  
  const isWeb = !Capacitor.isNativePlatform();

  const checkPermissionState = useCallback(async (): Promise<GeolocationPermissionState> => {
    if (isWeb) {
      try {
        // @ts-ignore - navigator.permissions might not be fully typed in all environments
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state as GeolocationPermissionState;
      } catch (e) {
        return 'unknown';
      }
    } else {
      try {
        const status = await Geolocation.checkPermissions();
        if (status.location === 'granted' || status.coarseLocation === 'granted') return 'granted';
        if (status.location === 'denied' || status.coarseLocation === 'denied') return 'denied';
        return 'prompt';
      } catch (e) {
        return 'unknown';
      }
    }
  }, [isWeb]);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    try {
      // 1. Check current status
      let state = await checkPermissionState();
      setPermissionStatus(state);

      // 2. If it's prompt, try to request
      if (state === 'prompt' || state === 'unknown') {
        try {
          const req = await Geolocation.requestPermissions();
          state = (req.location === 'granted' || req.coarseLocation === 'granted') ? 'granted' : 'denied';
          setPermissionStatus(state);
        } catch (e) {
          console.error("Request permission error:", e);
        }
      }

      // 3. If denied, stop here
      if (state === 'denied') {
        const msg = getMessage('geolocation.erro.permissaoNegada');
        setError(msg);
        setLoading(false);
        return null;
      }

      // 4. Try to get position
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });

      const data: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(data);
      setLoading(false);
      return data;

    } catch (err: unknown) {
      const error = err as Error;
      
      const currentState = await checkPermissionState();
      setPermissionStatus(currentState);

      let msg = getMessage('geolocation.erro.desconhecido');

      // Check if it's actually a permission denial
      if (error.message?.includes('denied') || error.message?.includes('Permission') || currentState === 'denied') {
        msg = getMessage('geolocation.erro.permissaoNegada');
        setPermissionStatus('denied');
      } else if (error.message?.includes('timeout') || (error as any).code === 3) {
        msg = getMessage('geolocation.erro.timeout');
      } else if (error.message?.includes('unavailable') || (error as any).code === 2) {
        msg = getMessage('geolocation.erro.indisponivel');
      }

      setError(msg);
      setLoading(false);
      return null;
    }
  }, [checkPermissionState]);

  return {
    location,
    loading,
    error,
    permissionStatus,
    isWeb,
    requestLocation
  };
}
