import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import AdminShell from './AdminShell';
import { signIn } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  const jar = await cookies();
  const secret = process.env.ADMIN_SECRET ?? 'changeme';
  const authed = jar.get('admin_auth')?.value === secret;

  if (!authed) {
    return (
      <html>
        <body style={{ background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui,sans-serif' }}>
          <div style={{ background: '#111', border: '1px solid #222', borderRadius: 6, padding: '32px 28px', width: 320 }}>
            <h1 style={{ color: '#fff', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Tracker Admin</h1>
            <form action={signIn}>
              <label style={{ color: '#666', fontSize: 11, textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 }}>Admin Secret</label>
              <input name="key" type="password" placeholder="Enter admin secret" autoFocus
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '8px 10px', color: '#e0e0e0', fontSize: 14, outline: 'none', marginBottom: 14, display: 'block' }} />
              <button type="submit"
                style={{ width: '100%', background: '#1f3a28', border: '1px solid #2e5c3a', color: '#6dcc82', padding: 9, borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Sign in
              </button>
            </form>
          </div>
        </body>
      </html>
    );
  }

  const filterCode = searchParams.code ?? null;
  const { rows: allLinks } = await sql`SELECT * FROM links ORDER BY created_at DESC`;

  const captureResult = filterCode
    ? await sql`SELECT * FROM captures WHERE code = ${filterCode} ORDER BY id DESC LIMIT 500`
    : await sql`SELECT * FROM captures ORDER BY id DESC LIMIT 500`;
  const captures = captureResult.rows;

  const { rows: statsRows } = filterCode
    ? await sql`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(DISTINCT ip)                                    AS unique_ips,
          COUNT(DISTINCT geo_country)
            FILTER (WHERE geo_country IS NOT NULL)              AS countries,
          COUNT(*) FILTER (WHERE precise_lat IS NOT NULL)       AS with_gps
        FROM captures
        WHERE code = ${filterCode}
      `
    : await sql`
        SELECT
          COUNT(*)                                              AS total,
          COUNT(DISTINCT ip)                                    AS unique_ips,
          COUNT(DISTINCT geo_country)
            FILTER (WHERE geo_country IS NOT NULL)              AS countries,
          COUNT(*) FILTER (WHERE precise_lat IS NOT NULL)       AS with_gps
        FROM captures
      `;

  return (
    <AdminShell
      allLinks={allLinks as never}
      captures={captures as never}
      stats={statsRows[0] as never}
      filterCode={filterCode}
    />
  );
}
