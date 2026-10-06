'use server';

import { cookies } from 'next/headers';

export type UserRole = 'BUYER' | 'ORGANIZER' | 'GATE_STAFF';

export async function setRoleSession(role: UserRole) {
  const cookieStore = await cookies();
  cookieStore.set('tik_user_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  return { success: true };
}

export async function getRoleSession(): Promise<UserRole> {
  const cookieStore = await cookies();
  const role = cookieStore.get('tik_user_role')?.value;
  return (role as UserRole) || 'BUYER';
}

export async function clearRoleSession() {
  const cookieStore = await cookies();
  cookieStore.delete('tik_user_role');
}