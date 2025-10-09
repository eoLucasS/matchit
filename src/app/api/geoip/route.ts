import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

async function fetchJSON(url: string, timeoutMs = 3500) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, { signal: ctrl.signal, cache: 'no-store' as RequestCache });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function GET() {
  try {
    // Next 15: headers() é assíncrono
    const h = await headers();
    const lat = h.get('x-vercel-ip-latitude');
    const lng = h.get('x-vercel-ip-longitude');
    if (lat && lng) {
      return NextResponse.json({ lat: parseFloat(lat), lng: parseFloat(lng), source: 'vercel' });
    }

    // 1) ipapi.co
    const ipapi = await fetchJSON('https://ipapi.co/json/');
    if (ipapi?.latitude && ipapi?.longitude) {
      return NextResponse.json({ lat: Number(ipapi.latitude), lng: Number(ipapi.longitude), source: 'ipapi' });
    }

    // 2) ipwho.is
    const ipwho = await fetchJSON('https://ipwho.is/');
    if (ipwho?.success !== false && ipwho?.latitude && ipwho?.longitude) {
      return NextResponse.json({ lat: Number(ipwho.latitude), lng: Number(ipwho.longitude), source: 'ipwho' });
    }

    // 3) freeipapi.com
    const freeip = await fetchJSON('https://freeipapi.com/api/json/');
    if (freeip?.latitude && freeip?.longitude) {
      return NextResponse.json({ lat: Number(freeip.latitude), lng: Number(freeip.longitude), source: 'freeipapi' });
    }

    // 4) fallback hardcoded (São Paulo)
    return NextResponse.json({ lat: -23.5505, lng: -46.6333, source: 'fallback-sp' });
  } catch {
    // fallback hardcoded (São Paulo)
    return NextResponse.json({ lat: -23.5505, lng: -46.6333, source: 'fallback-sp' });
  }
}
