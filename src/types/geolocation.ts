export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export type GeolocationPermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';
