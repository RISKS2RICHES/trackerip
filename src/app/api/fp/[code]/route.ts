import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const data = await req.json().catch(() => ({}));
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      '0.0.0.0';

    await sql`
      UPDATE captures SET
        js_screen   = ${data.screen   ?? null},
        js_timezone = ${data.timezone ?? null},
        js_platform = ${data.platform ?? null},
        js_language = ${data.language ?? null},
        js_raw      = ${JSON.stringify(data)}::jsonb
      WHERE id = (
        SELECT id FROM captures
        WHERE code = ${params.code} AND ip = ${ip}
        ORDER BY id DESC LIMIT 1
      )
    `;
  } catch { /* non-critical beacon */ }
  return new NextResponse(null, { status: 204 });
}
