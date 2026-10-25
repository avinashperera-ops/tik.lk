'use server';

import { db } from '@open-ticket/database';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function registerBuyer(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  nic: string;
  password: string;
}) {
  try {
    const firstName = formData.firstName?.trim();
    const lastName = formData.lastName?.trim();
    const email = formData.email?.toLowerCase().trim();
    const phone = formData.phone?.trim() || null;
    const nic = formData.nic?.trim() || null;
    const { dob, password } = formData;

    if (!email || !password || !firstName || !lastName) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters.' };
    }

    let dateOfBirth: Date | null = null;
    if (dob) {
      dateOfBirth = new Date(dob);
      if (Number.isNaN(dateOfBirth.getTime())) {
        return { success: false, error: 'Please enter a valid date of birth.' };
      }
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in Neon DB
    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber: phone,
        dateOfBirth,
        nic,
        passwordHash,
        role: 'BUYER',
      },
    });

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'user_session',
      value: JSON.stringify({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      }),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    // Unique constraint hit (e.g. two signups at once, or a duplicate NIC)
    if ((error as { code?: string })?.code === 'P2002') {
      return { success: false, error: 'An account with these details already exists.' };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}