'use server';

import { revalidatePath } from 'next/cache';
import { sql } from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';

function genCode() {
  return randomBytes(4).toString('hex');
}

export async function createLink(formData: FormData) {
  const destination = (formData.get('destination') as string | null)?.trim();
  const code        = ((formData.get('code') as string | null)?.trim()) || genCode();
  const label       = (formData.get('label') as string | null)?.trim() || null;

  if (!destination?.startsWith('http')) return;

  await sql`
    INSERT INTO links (code, destination, label)
    VALUES (${code}, ${destination}, ${label})
    ON CONFLICT (code) DO UPDATE SET destination = EXCLUDED.destination, label = EXCLUDED.label
  `;
  revalidatePath('/admin');
}

export async function deleteLink(code: string) {
  await sql`DELETE FROM links WHERE code = ${code}`;
  revalidatePath('/admin');
}

export async function signIn(formData: FormData) {
  const key    = formData.get('key') as string;
  const secret = process.env.ADMIN_SECRET ?? 'AdminTrack123!';
  if (key !== secret) return;

  cookies().set('admin_auth', secret, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  redirect('/admin');
}
