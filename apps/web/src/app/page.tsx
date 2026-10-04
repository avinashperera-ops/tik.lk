import { db } from '@open-ticket/database';
import Link from 'next/link';
import { Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EventsListPage() {
  const events = await db.event.findMany({
    include: { organization: true, ticketTiers: true },
    orderBy: { startDate: 'asc' },
  });

  return (
    <div className="space-y-8 sm:space-y-12 pb-20 md:pb-0">
      <div className="max-w-2xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Sri Lanka Dynamic Turnstile Passes
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Explore Live Events
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Select an event to issue dynamic TOTP passes to your wallet.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-[32px] bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-500">
          No upcoming events found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.slug}`}
              className="group rounded-[32px] bg-slate-100 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 p-6 flex flex-col justify-between space-y-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                  {event.organization.name}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors line-clamp-2">
                  {event.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="truncate">
                      {new Date(event.startDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="truncate">{event.venueName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500 font-medium">Get Pass</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Tiers <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}