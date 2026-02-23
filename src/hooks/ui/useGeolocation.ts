import { toast } from '@/utils/notifications/toast';
import { useCallback, useState } from 'react';
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  // Detecta se estamos rodando apenas no navegador PC/Mobile
  const isWeb = !Capacitor.isNativePlatform();

  const requestLocation = useCallback(async (): Promise<LocationData | null> => {
    setLoading(true);
    setError(null);
    setPermissionDenied(false);

    try {
      // Verifica estado da permissão atual no Nativo
      let check: PermissionStatus = { location: 'prompt', coarseLocation: 'prompt' };
      try {
        check = await Geolocation.checkPermissions();
      } catch (e) {
        // Fallback p/ web: checkPermissions pode falhar no desktop browser puro em algumas builds do Vite
      }

      if (check.location === 'denied' || check.coarseLocation === 'denied') {
        const msg = isWeb
          ? "Permissão de localização negada. Clique no ícone de cadeado perto da URL para liberar."
          : "Permissão de localização foi negada.";
        setError(msg);
        setPermissionDenied(true);
        toast.error(msg);
        setLoading(false);
        return null;
      }

      // Se precisar, requisitamos ativamente (abre popup)
      if (check.location === 'prompt' || check.location === 'prompt-with-rationale') {
        try {
          const req = await Geolocation.requestPermissions();
          if (req.location === 'denied') {
            const msg = isWeb
              ? "Permissão de localização negada pelo usuário. Use o cadeado do navegador para alterar."
              : "Permissão de localização foi negada pelo usuário.";
            setError(msg);
            setPermissionDenied(true);
            toast.error(msg);
            setLoading(false);
            return null;
          }
        } catch (e) { }
      }

      // Procura ativamente a posição exata, aumento de timeout para dar tempo em popups nativos severos
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      });

      const data = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      };

      setLocation(data);
      setLoading(false);
      return data;

    } catch (err: any) {
      console.error("Geo error:", err);
      let msg = "Erro desconhecido ao obter localização.";

      // Mapeamento de possíveis erros do Capacitor ou Web
      if (err.message?.includes('denied') || err.message?.includes('Permission')) {
        msg = "Permissão de localização negada.";
        setPermissionDenied(true);
      } else if (err.message?.includes('timeout') || err.code === 3) {
        msg = "Tempo limite atingido para obter localização. Tente novamente.";
      } else if (err.message?.includes('unavailable') || err.code === 2) {
        msg = "Sinal de GPS indisponível. Ligue sua localização.";
      }

      setError(msg);
      toast.error(msg);
      setLoading(false);
      return null;
    }
  }, []);

  return {
    location,
    loading,
    error,
    permissionDenied,
    isWeb,
    requestLocation
  };
}
