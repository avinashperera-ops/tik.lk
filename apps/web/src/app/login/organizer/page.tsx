'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setRoleSession } from '@/app/actions/auth';
import { Layers, ArrowRight } from 'lucide-react';

export default function OrganizerLoginPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await setRoleSession('ORGANIZER');
    router.push('/organizer/events/new');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Organizer Portal</h1>
            <p className="text-xs text-slate-400">Event management & dynamic inventory creation</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Organizer Access Key</label>
            <input
              type="password"
              required
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
          >
            <span>Open Organizer Console</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}