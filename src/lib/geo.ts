export function jitterLatLng(lat: number, lng: number, meters = 300) {
  const latMeter = 1 / 111_320;
  const lngMeter = 1 / (111_320 * Math.cos((lat * Math.PI) / 180));
  const r = meters * (0.5 + Math.random()); // ~150–450m
  const theta = Math.random() * 2 * Math.PI;
  const dLat = r * Math.cos(theta) * latMeter;
  const dLng = r * Math.sin(theta) * lngMeter;
  return { lat: lat + dLat, lng: lng + dLng };
}

export async function getGeoApprox(): Promise<{ lat: number; lng: number; method: 'gps' | 'ip' } | null> {
  // 1) GPS
  if ('geolocation' in navigator) {
    const pos = await new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p),
        () => resolve(null),
        { enableHighAccuracy: false, maximumAge: 60_000, timeout: 6_000 }
      );
    });
    if (pos) {
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, method: 'gps' };
    }
  }

  // 2) IP (servidor tenta múltiplos provedores e tem fallback SP)
  try {
    const r = await fetch('/api/geoip', { cache: 'no-store' });
    if (r.ok) {
      const j = await r.json();
      if (typeof j?.lat === 'number' && typeof j?.lng === 'number') {
        return { lat: j.lat, lng: j.lng, method: 'ip' };
      }
    }
  } catch {}

  // 3) fallback SP (nunca retorna null)
  return { lat: -23.5505, lng: -46.6333, method: 'ip' };
}
