import { GateScanner } from '@/components/GateScanner';
import { LayoutDashboard } from 'lucide-react';
import { db, TicketStatus } from '@open-ticket/database';

export default async function CommitteeDashboardPage() {
  const totalTickets = await db.ticket.count();
  const checkedInTickets = await db.ticket.count({
    where: {
      status: TicketStatus.CHECKED_IN,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Gate Operations Mode
          </div>
          <h1 className="text-3xl font-extrabold text-white">Turnstile Scanner Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time optical scanner & dynamic TOTP verification engine.
          </p>
        </div>

        {/* Real-time Turnstile Stats */}
        <div className="flex gap-4">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Total Passes</p>
            <p className="text-xl font-bold text-white mt-0.5">{totalTickets}</p>
          </div>
          <div className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800">
            <p className="text-[10px] font-semibold text-slate-500 uppercase">Checked In</p>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">{checkedInTickets}</p>
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <GateScanner />
    </div>
  );
}