import { db } from '@open-ticket/database';
import { generateDynamicQRToken } from '@open-ticket/crypto';

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Digital Ticket Wallet</h1>
        <p className="text-slate-400 text-sm">Real-time HMAC dynamic turnstile gate passes.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
          No active passes in wallet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket) => {
            const liveToken = generateDynamicQRToken(ticket.id);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
              liveToken
            )}`;

            return (
              <div
                key={ticket.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 flex flex-col items-center text-center"
              >
                <div className="w-full text-left space-y-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                    {ticket.tier.name}
                  </span>
                  <h2 className="text-xl font-bold text-white">{ticket.event.title}</h2>
                </div>

                <div className="p-4 bg-white rounded-2xl border-4 border-indigo-500/30">
                  <img
                    src={qrUrl}
                    alt="Live Gate Pass QR Code"
                    width={180}
                    height={180}
                    className="rounded-lg"
                  />
                </div>

                <div className="w-full pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                      {ticket.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ticket ID</span>
                    <span className="font-mono text-slate-300">{ticket.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}