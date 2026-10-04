'use client';

import { useEffect, useState } from 'react';
import { generateDynamicQRToken, renderQRDataURI } from '@open-ticket/crypto';
import { ShieldCheck, RefreshCw, Zap } from 'lucide-react';

interface DynamicPassProps {
  signedHmacPayload: string;
  ticketId: string;
  eventTitle: string;
  tierName: string;
  ownerName: string;
}

export function DynamicPass({
  signedHmacPayload,
  ticketId,
  eventTitle,
  tierName,
  ownerName,
}: DynamicPassProps) {
  const [qrUri, setQrUri] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const updateQR = async () => {
      const dynamicToken = generateDynamicQRToken(signedHmacPayload, 30);
      const uri = await renderQRDataURI(dynamicToken);
      setQrUri(uri);
    };

    updateQR();

    const interval = setInterval(() => {
      const secondsInWindow = Math.floor(Date.now() / 1000) % 30;
      const remaining = 30 - secondsInWindow;
      setTimeLeft(remaining);

      if (remaining === 30) {
        updateQR();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [signedHmacPayload]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider">
            {tierName} Pass
          </span>
          <h3 className="text-xl font-black text-white mt-2">{eventTitle}</h3>
        </div>
        <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
          <Zap className="w-5 h-5" />
        </div>
      </div>

      {/* QR Display Frame */}
      <div className="relative flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
        {qrUri ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrUri} alt="Dynamic QR Ticket Pass" className="w-56 h-56 object-contain" />
        ) : (
          <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-sm">
            Generating Pass...
          </div>
        )}

        {/* Dynamic OTP Live Indicator */}
        <div className="mt-2 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono">
          <RefreshCw className="w-3 h-3 text-indigo-400 animate-spin" />
          <span>Refreshes in {timeLeft}s</span>
        </div>
      </div>

      {/* Ticket Details Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
        <div>
          <p className="text-[10px] uppercase font-semibold text-slate-500">Pass Holder</p>
          <p className="font-bold text-slate-200 mt-0.5">{ownerName}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-semibold text-slate-500">Ticket Ref</p>
          <p className="font-mono text-indigo-400 mt-0.5">#{ticketId.substring(0, 8)}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
        <ShieldCheck className="w-3 h-3 text-emerald-400" />
        <span>Dynamic Anti-Screenshot Security Active</span>
      </div>
    </div>
  );
}