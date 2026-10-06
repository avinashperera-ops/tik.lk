'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Ticket, QrCode, PlusCircle, User, LayoutDashboard, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  role?: string | null;
}

export function Header({ role }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide the entire header on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
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
            <Link
              href="/"
              className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              Events
            </Link>

            {/* Role Specific Navigation */}
            {role === 'BUYER' && (
              <Link
                href="/dashboard"
                className="px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                Wallet
              </Link>
            )}

            {role === 'ORGANIZER' && (
              <Link
                href="/organizer/events/new"
                className="px-3 py-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-bold transition flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Create Event
              </Link>
            )}

            {role === 'GATE_STAFF' && (
              <Link
                href="/committee"
                className="px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-white transition flex items-center gap-1"
              >
                <QrCode className="w-4 h-4" />
                Turnstile Scanner
              </Link>
            )}
          </nav>

          <ThemeToggle />

          {/* Profile Circle Avatar / Auth Dropdown */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 transition hover:border-blue-500 focus:outline-none"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-slate-800 dark:text-white">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
                  <div className="border-b border-slate-200 dark:border-slate-800 px-3 py-2 text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {session.user.name || 'User'}
                    </p>
                    <p className="truncate text-slate-500 dark:text-slate-400">
                      {session.user.email}
                    </p>
                  </div>

                  <div className="mt-1 flex flex-col gap-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-md shadow-blue-500/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}