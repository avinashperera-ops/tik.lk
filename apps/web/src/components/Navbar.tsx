'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Ticket, ShieldCheck, LayoutDashboard, User, LogOut } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // Do not render Navbar on login and signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Ticket className="w-5 h-5" />
          </div>
          <span>
            Open<span className="text-indigo-400">Ticket</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/events/cyber-pulse-2026"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Explore Events
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <User className="w-4 h-4" />
            My Wallet
          </Link>
          <Link
            href="/committee"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Committee
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Super Admin
          </Link>

          {/* User Profile Circle or Sign In Options */}
          {session?.user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-slate-700 bg-slate-800 transition hover:border-indigo-500 focus:outline-none"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User Profile'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-2 shadow-2xl z-50">
                  <div className="border-b border-slate-800 px-3 py-2 text-xs">
                    <p className="font-semibold text-white">
                      {session.user.name || 'User'}
                    </p>
                    <p className="truncate text-slate-400">{session.user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                  >
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}