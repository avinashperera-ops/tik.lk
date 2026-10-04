'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { validateGateScan, ScanResult } from '@/app/actions/scanner';
import { ShieldCheck, CheckCircle, XCircle, Volume2, Camera, RefreshCw } from 'lucide-react';

export function GateScanner() {
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [scannerReady, setScannerReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const playAudioFeedback = (type: 'SUCCESS' | 'ERROR') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'SUCCESS') {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.1);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.frequency.setValueAtTime(1760, ctx.currentTime);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.15);
        }, 120);
      } else {
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
      // Audio fallback
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const result = await validateGateScan(decodedText);
      setLastResult(result);
      setScanCount((prev) => prev + 1);

      if (result.status === 'VALID') {
        playAudioFeedback('SUCCESS');
      } else {
        playAudioFeedback('ERROR');
      }
    } catch (err) {
      playAudioFeedback('ERROR');
      setLastResult({ status: 'INVALID_SIGNATURE', message: 'Error verifying payload' });
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  useEffect(() => {
    setScannerReady(true);

    const timer = setTimeout(() => {
      const element = document.getElementById('reader');
      if (!element) return;

      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const size = Math.floor(minEdge * 0.85);
        return { width: size, height: size };
      };

      const scanner = new Html5QrcodeScanner(
        'reader',
        {
          fps: 15,
          qrbox: qrboxFunction,
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => handleScanSuccess(decodedText),
        () => {}
      );

      scannerRef.current = scanner;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => console.error('Failed to clear scanner:', err));
      }
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto space-y-4">
      {/* Dynamic Visual Result Panel */}
      {lastResult && (
        <div
          className={`p-4 rounded-2xl border text-center transition-all animate-in fade-in zoom-in-95 duration-200 ${
            lastResult.status === 'VALID'
              ? 'bg-emerald-950/80 backdrop-blur-md border-emerald-500/50 text-emerald-200 shadow-xl'
              : 'bg-rose-950/80 backdrop-blur-md border-rose-500/50 text-rose-200 shadow-xl'
          }`}
        >
          <div className="flex justify-center mb-2">
            {lastResult.status === 'VALID' ? (
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-400" />
            )}
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">{lastResult.message}</h2>

          {lastResult.ticket && (
            <div className="mt-2 pt-2 border-t border-white/10 text-xs space-y-0.5">
              <p className="font-bold text-white text-sm">{lastResult.ticket.ownerName}</p>
              <p className="opacity-80">
                {lastResult.ticket.eventTitle} • <span className="font-semibold">{lastResult.ticket.tierName}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Glassmorphism Container */}
      <div className="rounded-3xl bg-white/20 dark:bg-slate-900/40 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 p-4 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs sm:text-sm">
            <Camera className="w-4 h-4 text-blue-500 dark:text-indigo-400 shrink-0" />
            <span className="truncate">Gate Turnstile Camera Scanner</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-900/10 dark:bg-slate-950/60 backdrop-blur-sm border border-slate-900/10 dark:border-slate-800/80 text-[10px] font-mono text-blue-600 dark:text-indigo-400 shrink-0 font-bold">
            Scanned: {scanCount}
          </span>
        </div>

        {/* Viewfinder Target Container */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-black/90 border border-white/20 dark:border-slate-800">
          {!scannerReady && (
            <div className="p-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs font-semibold bg-slate-950">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500 dark:text-indigo-400" />
              <span>Initializing Camera...</span>
            </div>
          )}

          <div
            id="reader"
            className="w-full [&_video]:w-full [&_video]:h-auto [&_video]:object-cover [&_img]:hidden [&_#reader__scan_region]:!bg-transparent [&_#reader__scan_region_svg]:!w-full [&_#reader__scan_region_svg]:!h-full [&_#reader__dashboard]:p-3 [&_#reader__dashboard_control]:text-xs [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-xl [&_button]:bg-blue-600 dark:[&_button]:bg-indigo-600 [&_button]:text-white [&_button]:font-bold [&_button]:text-xs [&_button]:shadow-md [&_select]:bg-slate-900/80 [&_select]:backdrop-blur-md [&_select]:text-white [&_select]:text-xs [&_select]:p-2 [&_select]:rounded-xl [&_select]:border-slate-700 [&_select]:w-full [&_select]:mt-2"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 px-1 font-medium">
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-blue-500 dark:text-indigo-400 shrink-0" />
            <span>Audio Chime</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span>Offline Sync Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}