export function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function formatKm(km: number | null | undefined) {
  if (km == null) return '—';
  return `${km.toFixed(1)} km`;
}
