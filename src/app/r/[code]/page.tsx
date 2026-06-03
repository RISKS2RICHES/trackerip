import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { recordVisit } from '@/lib/capture';
import BBCPage from './BBCPage';

export const dynamic = 'force-dynamic';

export default async function TrackingPage({ params }: { params: { code: string } }) {
  const rows = await sql`SELECT destination FROM links WHERE code = ${params.code}`;
  if (!rows[0]) notFound();

  const destination = rows[0].destination as string;
  await recordVisit(params.code, 'redirect');

  return <BBCPage code={params.code} destination={destination} />;
}
