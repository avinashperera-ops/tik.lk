import { db } from '@open-ticket/database';
import { notFound } from 'next/navigation';
import { Calendar, MapPin, Ticket, ShieldCheck } from 'lucide-react';
import { issueDemoTicket } from '@/app/actions/ticket';

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    include: {
      ticketTiers: true,
      organization: true,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Event Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          {event.organization.name}
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">{event.title}</h1>
        <p className="text-slate-400 text-base leading-relaxed">{event.description}</p>

        <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>{new Date(event.startDate).toLocaleDateString('en-US', { dateStyle: 'full' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            <span>{event.venueName}, {event.venueAddress}</span>
          </div>
        </div>
      </div>

      {/* Ticket Tiers Selection */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Ticket className="w-5 h-5 text-indigo-400" />
          Select Your Pass
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.ticketTiers.map((tier) => (
            <div
              key={tier.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <span className="text-lg font-black text-indigo-400">
                    ${(tier.priceInCents / 100).toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">{tier.description}</p>
              </div>

              <form action={issueDemoTicket}>
                <input type="hidden" name="tierId" value={tier.id} />
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-98 cursor-pointer"
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