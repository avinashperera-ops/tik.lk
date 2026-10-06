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
    const { firstName, lastName, email, phone, dob, nic, password } = formData;

    if (!email || !password || !firstName || !lastName) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Neon DB
    const newUser = await db.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email: email.toLowerCase().trim(),
        phone,
        dob: dob ? new Date(dob) : null,
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
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to create account. Please try again.' };
  }
}