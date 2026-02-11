import { toast } from '@/utils/notifications/toast';
import { useCallback, useState } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Geolocalização não é suportada neste dispositivo.";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setLocation(data);
          setLoading(false);
          resolve(data);
        },
        (err) => {
          console.error("Geo error:", err);
          let msg = "Erro desconhecido de localização.";
          if (err.code === 1) msg = "Permissão de localização negada.";
          else if (err.code === 2) msg = "Localização indisponível.";
          else if (err.code === 3) msg = "Tempo limite para obter localização.";
          
          setError(msg);
          toast.error(msg);
          setLoading(false);
          resolve(null); // Resolve null instead of reject to handle gracefully
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation
  };
}
