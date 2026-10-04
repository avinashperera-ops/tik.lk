'use client';

import Link from 'next/link';
import { Ticket, ShieldCheck, LayoutDashboard, User } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Ticket className="w-5 h-5" />
          </div>
          <span>Open<span className="text-indigo-400">Ticket</span></span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/events/cyber-pulse-2026" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Explore Events
          </Link>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <User className="w-4 h-4" />
            My Wallet
          </Link>
          <Link href="/committee" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Committee
          </Link>
          <Link href="/admin" className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            <ShieldCheck className="w-4 h-4" />
            Super Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}