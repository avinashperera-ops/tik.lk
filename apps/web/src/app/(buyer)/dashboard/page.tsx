import { db } from '@open-ticket/database';
import { generateDynamicQRToken } from '@open-ticket/crypto';
import { GlassTicket } from '@/components/GlassTicket';
import { Ticket } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const user = await db.user.findFirst();

  const tickets = user
    ? await db.ticket.findMany({
        where: { ownerId: user.id },
        include: { event: true, tier: true },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const activePass = tickets[0];
  const upcomingPasses = tickets.slice(1);

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 pt-2 px-2">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Active Wallet
          </p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h1>
        </div>
        <div className="w-12 h-12 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-sm text-blue-600 dark:text-blue-400 shadow-md">
          {tickets.length}
        </div>
      </div>

      {/* Glassmorphic Notched Ticket */}
      {activePass ? (
        (() => {
          const liveToken = generateDynamicQRToken(activePass.id);
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(liveToken)}`;

          return (
            <GlassTicket
              eventTitle={activePass.event.title}
              tierName={activePass.tier.name}
              qrUrl={qrUrl}
            />
          );
        })()
      ) : (
        <div className="rounded-[32px] bg-slate-100 dark:bg-slate-900 p-8 text-center text-slate-500 space-y-2 border border-slate-200 dark:border-slate-800">
          <Ticket className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm font-medium">No active passes in wallet</p>
        </div>
      )}

      {/* Upcoming Passes Banner */}
      {upcomingPasses.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              Next Up
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {upcomingPasses[0].event.title}
            </p>
          </div>
          <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {upcomingPasses[0].tier.name}
          </span>
        </div>
      )}

      {/* Week Selector Bar from Dribbble Concept */}
      <div className="pt-2 space-y-3">
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
          <span className="font-bold text-slate-900 dark:text-white">Pass Schedule</span>
          <span>This Week</span>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
            const isSelected = idx === 2;
            return (
              <div
                key={idx}
                className={`py-3 rounded-2xl flex flex-col items-center justify-center space-y-1 transition-all ${
                  isSelected
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg scale-105'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-[10px] opacity-70">{day}</span>
                <span className="text-sm">{idx + 2}</span>
                {isSelected && <span className="w-1 h-1 rounded-full bg-blue-500" />}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}