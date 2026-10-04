'use client';

import { ShieldCheck, QrCode } from 'lucide-react';

interface GlassTicketProps {
  eventTitle: string;
  tierName: string;
  qrUrl: string;
}

export function GlassTicket({ eventTitle, tierName, qrUrl }: GlassTicketProps) {
  return (
    <div 
      className="relative w-full max-w-[360px] mx-auto my-6 p-6 rounded-[36px] overflow-hidden text-white shadow-2xl"
      style={{
        background: 'linear-gradient(180deg, #2a134e 0%, #1a1136 50%, #0d0920 100%)',
      }}
    >
      {/* 3D Background Spheres */}
      <div className="absolute top-3 left-3 w-28 h-28 rounded-full bg-pink-500/80 blur-sm pointer-events-none" />
      <div className="absolute top-1/3 -right-6 w-32 h-32 rounded-full bg-purple-500/80 blur-sm pointer-events-none" />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full bg-indigo-500/80 blur-sm pointer-events-none" />

      {/* Main Glass Pass Container */}
      <div 
        className="relative z-10 w-full rounded-[28px] p-5 text-white space-y-4 shadow-lg border border-white/30"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        {/* Pass Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[10px] font-bold tracking-wider uppercase text-purple-100 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Digital Pass</span>
          </div>
          <span className="text-xs font-mono font-bold text-purple-200">{tierName}</span>
        </div>

        {/* Event Title */}
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight text-white leading-tight">
            {eventTitle}
          </h3>
          <p className="text-[11px] text-purple-200/80 font-medium">Scan token at entrance turnstile</p>
        </div>

        {/* Dynamic QR Display */}
        <div className="p-4 rounded-2xl bg-white text-slate-900 shadow-inner flex flex-col items-center justify-center space-y-2">
          <img
            src={qrUrl}
            alt="Dynamic Gate QR"
            width={160}
            height={160}
            className="rounded-lg max-w-[150px] h-auto"
          />
          <span className="text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dynamic HMAC TOTP
          </span>
        </div>

        {/* Side Semi-Circular Notches & Perforated Cut Line */}
        <div className="relative flex items-center justify-center my-4">
          <div className="absolute -left-8 w-6 h-6 rounded-full bg-[#1b1238] border-r border-white/30" />
          <div className="w-full border-t-2 border-dashed border-white/40" />
          <div className="absolute -right-8 w-6 h-6 rounded-full bg-[#1b1238] border-l border-white/30" />
        </div>

        {/* Expand Action Button */}
        <button
          type="button"
          className="w-full py-2.5 px-4 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-purple-200" />
          <span>Tap to Expand Pass</span>
        </button>

      </div>
    </div>
  );
}