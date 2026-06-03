import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { recordVisit } from '@/lib/capture';

const GIF = Buffer.from(
  '47494638396101000100800000ffffffff00002100040100000000' +
  '2c00000000010001000002024401003b',
  'hex',
);

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { rows } = await sql`SELECT code FROM links WHERE code = ${params.code}`;
    if (rows[0]) await recordVisit(params.code, 'pixel');
  } catch { /* serve pixel regardless */ }

  return new NextResponse(GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
