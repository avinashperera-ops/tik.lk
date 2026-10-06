'use server';

import { db } from '@open-ticket/database';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function loginBuyer(email: string, password?: string) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // 1. Find user in PostgreSQL database via Prisma
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 2. Validate password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // 3. Set authenticated session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'user_session',
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role || 'BUYER',
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected authentication error occurred.' };
  }
}