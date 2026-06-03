import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const data = await req.json().catch(() => ({}));
    const ip   =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ?? '0.0.0.0';

    await sql`
      UPDATE captures SET
        precise_lat      = ${data.lat      ?? null},
        precise_lon      = ${data.lon      ?? null},
        precise_accuracy = ${data.accuracy ?? null}
      WHERE id = (
        SELECT id FROM captures
        WHERE code = ${params.code} AND ip = ${ip}
        ORDER BY id DESC LIMIT 1
      )
    `;
  } catch { /* non-critical beacon */ }
  return new NextResponse(null, { status: 204 });
}
