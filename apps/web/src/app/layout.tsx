import type { Metadata } from 'next';
import Link from 'next/link';
import { Ticket, QrCode, LayoutDashboard, PlusCircle } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tik.lk — Dynamic Gate Pass Engine',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col justify-between antialiased">
        <ThemeProvider>
          
          {/* Main Top Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-300/70 dark:border-slate-800/80 bg-white/80 dark:bg-[#070a12]/80 backdrop-blur-xl transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <Ticket className="w-5 h-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  tik<span className="text-blue-500">.lk</span>
                </span>
              </Link>

              <div className="flex items-center gap-4">
                <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
                  <Link href="/" className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                    Events
                  </Link>
                  <Link href="/dashboard" className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition">
                    Wallet
                  </Link>
                  <Link href="/organizer/events/new" className="px-3 py-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 font-bold transition flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    Create Event
                  </Link>
                  <Link href="/committee" className="px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-1">
                    <QrCode className="w-4 h-4" />
                    Gate Scanner
                  </Link>
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content Container */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
            {children}
          </main>

          {/* Mobile Navigation */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-300 dark:border-slate-800 bg-white/90 dark:bg-[#070a12]/95 backdrop-blur-2xl px-4 py-2 flex items-center justify-around">
            <Link href="/" className="flex flex-col items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-500">
              <Ticket className="w-5 h-5" />
              <span>Events</span>
            </Link>
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-500">
              <LayoutDashboard className="w-5 h-5" />
              <span>Wallet</span>
            </Link>
            <Link href="/organizer/events/new" className="flex flex-col items-center gap-1 text-[10px] text-indigo-500 font-bold">
              <PlusCircle className="w-5 h-5" />
              <span>New Event</span>
            </Link>
            <Link href="/committee" className="flex flex-col items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
              <QrCode className="w-5 h-5" />
              <span>Scanner</span>
            </Link>
          </div>

        </ThemeProvider>
      </body>
    </html>
  );
}