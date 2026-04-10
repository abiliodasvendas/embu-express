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
      
      // 2. If it's prompt or unknown on Native, try to request
      if (!isWeb && (state === 'prompt' || state === 'unknown')) {
        try {
          const req = await Geolocation.requestPermissions();
          state = (req.location === 'granted' || req.coarseLocation === 'granted') ? 'granted' : 'denied';
        } catch (e) {
          console.error("Native request permission error:", e);
        }
      }

      setPermissionStatus(state);

      // 3. If denied, stop here
      if (state === 'denied') {
        setError(getMessage('geolocation.erro.permissaoNegada'));
        setLoading(false);
        return null;
      }

      // 4. Try to get position
      // In Android, enableHighAccuracy: true triggers the system prompt to enable GPS precision
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000, // Reduced slightly for better UX
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

    } catch (err: any) {
      console.error("Geolocation error detail:", err);
      const errorMessage = err?.message?.toLowerCase() || "";
      
      // Check current state again to be sure if it's a permission issue
      const currentState = await checkPermissionState();
      setPermissionStatus(currentState);

      let msg = getMessage('geolocation.erro.desconhecido');

      // Specific error mapping for native and web
      if (currentState === 'denied' || errorMessage.includes('denied') || errorMessage.includes('permission')) {
        msg = getMessage('geolocation.erro.permissaoNegada');
        setPermissionStatus('denied');
      } else if (errorMessage.includes('location unavailable') || errorMessage.includes('gps') || err?.code === 2) {
        // This is the CASE: GPS is OFF or no signal. 
        // We keep permission as granted (if it is) but show "unavailable" error.
        msg = getMessage('geolocation.erro.indisponivel');
      } else if (errorMessage.includes('timeout') || err?.code === 3) {
        msg = getMessage('geolocation.erro.timeout');
      }

      setError(msg);
      setLoading(false);
      return null;
    }
  }, [checkPermissionState, isWeb]);

  return {
    location,
    loading,
    error,
    permissionStatus,
    isWeb,
    requestLocation
  };
}
