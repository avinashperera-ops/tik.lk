'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { validateGateScan, ScanResult } from '@/app/actions/scanner';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Volume2, Camera } from 'lucide-react';

export function GateScanner() {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Web Audio Synthesizer for Turnstile Hardware Beeps
  const playAudioFeedback = (type: 'SUCCESS' | 'ERROR') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'SUCCESS') {
        // High pitch double beep
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.1);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.frequency.setValueAtTime(1760, ctx.currentTime); // A6
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 120);
      } else {
        // Low frequency error buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio context fallback
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const result = await validateGateScan(decodedText);
    setLastResult(result);
    setScanCount((prev) => prev + 1);

    if (result.status === 'VALID') {
      playAudioFeedback('SUCCESS');
    } else {
      playAudioFeedback('ERROR');
    }

    // Cooldown pause before next scan
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
      },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => handleScanSuccess(decodedText),
      () => {}
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Dynamic Visual Flash Panel */}
      {lastResult && (
        <div
          className={`p-6 rounded-3xl border text-center transition-all animate-in fade-in zoom-in-95 duration-200 ${
            lastResult.status === 'VALID'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-2xl shadow-emerald-500/20'
              : 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-2xl shadow-rose-500/20'
          }`}
        >
          <div className="flex justify-center mb-3">
            {lastResult.status === 'VALID' ? (
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-400" />
            )}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">{lastResult.message}</h2>

          {lastResult.ticket && (
            <div className="mt-4 pt-4 border-t border-white/10 text-sm space-y-1">
              <p className="font-bold text-white text-base">{lastResult.ticket.ownerName}</p>
              <p className="text-xs opacity-80">
                {lastResult.ticket.eventTitle} •{' '}
                <span className="font-semibold">{lastResult.ticket.tierName}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Camera Viewport Container */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Camera className="w-4 h-4 text-indigo-400" />
            Gate Turnstile Camera Scanner
          </div>
          <span className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-xs font-mono text-indigo-400">
            Scanned: {scanCount}
          </span>
        </div>

        <div id="reader" className="overflow-hidden rounded-2xl bg-black border border-slate-800" />

        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Audio Chime Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline Cryptographic Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}