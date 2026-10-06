import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import { Header } from '@/components/Header';
import { getRoleSession } from '@/app/actions/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tik.lk — Dynamic Gate Pass Engine',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const role = await getRoleSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <Providers>
          {/* Main Top Header Component */}
          <Header role={role} />

          {/* Page Content Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}