'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setRoleSession } from '@/app/actions/auth';
import { QrCode, ArrowRight } from 'lucide-react';

export default function GateLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await setRoleSession('GATE_STAFF');
    router.push('/committee');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Turnstile Gate Operations</h1>
            <p className="text-xs text-slate-400">Role-authenticated live QR validation engine</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gate Pass PIN</label>
            <input
              type="password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Launch Gate Scanner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}