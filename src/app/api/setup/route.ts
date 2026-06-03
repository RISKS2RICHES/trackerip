import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

// GET /api/setup  — run once after deployment to create tables
export async function GET() {
  try {
    await initDb();
    return NextResponse.json({ ok: true, message: 'Tables created.' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
