// Client-side session state manager for:
// - JWT access token (in memory only)
// - Session expiry tracking
// - httpOnly refresh cookies (backend-managed)
'use server'
import {cookies} from 'next/headers';

export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // expires in a week
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

//  Session Reset
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

// Get Session
export async function getSession() {
  const cookieStore = await cookies();
  if (!cookieStore.has('session')){
    return null;
  }
  return cookieStore.get('session')?.value ?? null;
}

// Has Session
export async function hasSession() {
  const cookieStore = await cookies();
  return cookieStore.has('session');
}