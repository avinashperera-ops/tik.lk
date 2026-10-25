import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db } from '@open-ticket/database';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    // Make sure every Google sign-in has a matching row in our User table
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google' || !user.email) return false;

      try {
        const email = user.email.toLowerCase();
        const existing = await db.user.findUnique({ where: { email } });

        if (!existing) {
          const parts = (user.name ?? '').trim().split(/\s+/).filter(Boolean);
          const p = profile as { given_name?: string; family_name?: string } | undefined;

          await db.user.create({
            data: {
              email,
              firstName: p?.given_name || parts[0] || 'Guest',
              lastName: p?.family_name || parts.slice(1).join(' ') || '-',
              role: 'BUYER',
            },
          });
        }
        return true;
      } catch (error) {
        console.error('Sign-in error:', error);
        return false;
      }
    },

    // Put the database user id and role into the token
    async jwt({ token }) {
      if (token.email && !token.uid) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email.toLowerCase() },
          select: { id: true, role: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = (token.uid as string) ?? (token.sub as string);
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
});