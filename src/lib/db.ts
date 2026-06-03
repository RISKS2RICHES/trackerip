import { neon } from '@neondatabase/serverless';

// Module-level client, created lazily on first query
let _client: ReturnType<typeof neon> | undefined;

function db() {
  if (!_client) {
    const url =
      process.env.DATABASE_URL ??
      process.env.POSTGRES_URL ??
      process.env.POSTGRES_URL_NON_POOLING ??
      '';
    _client = neon(url);
  }
  return _client;
}

// Tagged template wrapper — compatible with all call sites
export async function sql(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Record<string, unknown>[]> {
  const result = await db()(strings, ...values);
  return result as Record<string, unknown>[];
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      code        TEXT PRIMARY KEY,
      destination TEXT NOT NULL,
      label       TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS captures (
      id               SERIAL PRIMARY KEY,
      code             TEXT,
      timestamp        TIMESTAMPTZ DEFAULT NOW(),
      ip               TEXT,
      x_forwarded_for  TEXT,
      user_agent       TEXT,
      referer          TEXT,
      geo_country      TEXT,
      geo_region       TEXT,
      geo_city         TEXT,
      geo_lat          REAL,
      geo_lon          REAL,
      precise_lat      REAL,
      precise_lon      REAL,
      precise_accuracy REAL,
      js_screen        TEXT,
      js_timezone      TEXT,
      js_platform      TEXT,
      js_language      TEXT,
      js_raw           JSONB,
      headers          JSONB,
      source           TEXT DEFAULT 'redirect'
    )
  `;
}
