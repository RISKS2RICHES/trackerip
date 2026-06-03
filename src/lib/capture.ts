import { headers } from 'next/headers';
import { sql } from './db';

export async function recordVisit(code: string, source = 'redirect'): Promise<number | null> {
  const h = await headers();

  const xff = h.get('x-forwarded-for') ?? '';
  const ip = xff ? xff.split(',')[0].trim() : (h.get('x-real-ip') ?? '0.0.0.0');

  // Vercel injects precise geo headers at the edge — no external API needed
  const country = h.get('x-vercel-ip-country') ?? null;
  const region  = h.get('x-vercel-ip-country-region') ?? null;
  const rawCity = h.get('x-vercel-ip-city') ?? '';
  const city    = rawCity ? decodeURIComponent(rawCity) : null;
  const lat     = parseFloat(h.get('x-vercel-ip-latitude')  ?? '') || null;
  const lon     = parseFloat(h.get('x-vercel-ip-longitude') ?? '') || null;

  const headersObj: Record<string, string> = {};
  h.forEach((v, k) => { headersObj[k] = v; });

  const result = await sql`
    INSERT INTO captures
      (code, ip, x_forwarded_for, user_agent, referer,
       geo_country, geo_region, geo_city, geo_lat, geo_lon,
       headers, source)
    VALUES (
      ${code}, ${ip}, ${xff || null},
      ${h.get('user-agent') ?? null},
      ${h.get('referer') ?? null},
      ${country}, ${region}, ${city}, ${lat}, ${lon},
      ${JSON.stringify(headersObj)},
      ${source}
    )
    RETURNING id
  `;
  return (result.rows[0]?.id as number) ?? null;
}
