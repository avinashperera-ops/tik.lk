import { db } from '@open-ticket/database';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Ticket, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { issueDemoTicket } from '@/app/actions/ticket';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: { ticketTiers: true, organization: true },
  });

  if (!event) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 pb-16 md:pb-0">
      
      {/* Event Header Banner */}
      <div className="p-6 sm:p-10 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          {event.organization.name}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
          {event.title}
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
          {event.description}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{new Date(event.startDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{event.venueName}, {event.venueAddress}</span>
          </div>
        </div>
      </div>

      {/* Ticket Tier Cards */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-blue-400" />
          Select Gate Pass Tier
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {event.ticketTiers.map((tier) => (
            <div
              key={tier.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-6 hover:border-blue-500/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{tier.name}</h3>
                  <span className="text-base sm:text-lg font-black text-blue-400">
                    LKR {(tier.priceInCents / 100).toLocaleString('en-US')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-300 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dynamic TOTP Gate Verification Included</span>
                </div>
              </div>

              <form action={issueDemoTicket}>
                <input type="hidden" name="tierId" value={tier.id} />
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-98 cursor-pointer"
                >
                  Get Instant Pass & Generate QR
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}