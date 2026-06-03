import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { recordVisit } from '@/lib/capture';
import BBCPage from './BBCPage';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({ params }: { params: { code: string } }) {
  const { code } = params;

  const { rows } = await sql`SELECT destination FROM links WHERE code = ${code}`;
  if (!rows[0]) notFound();

  const destination = rows[0].destination as string;
  await recordVisit(code, 'redirect');

  return <BBCPage code={code} destination={destination} />;
}
