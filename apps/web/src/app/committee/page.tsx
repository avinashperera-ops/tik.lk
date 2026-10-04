'use client';

import { useState } from 'react';
import { GateScanner } from '@/components/GateScanner';
import { validateGateScan, ScanResult } from '@/app/actions/scanner';
import { ShieldCheck, Camera, RefreshCw, CheckCircle2, XCircle, Keyboard } from 'lucide-react';

export default function TurnstileScannerPage() {
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [useManualInput, setUseManualInput] = useState(false);

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    setLoading(true);
    setScanResult(null);

    const result = await validateGateScan(manualCode.trim());
    setScanResult(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[32px] bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-2 shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          Turnstile Operator Portal
        </div>
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white">Gate Pass Scanner</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Verify TOTP pass payloads synchronously at entry turnstiles.
        </p>
      </div>

      {/* Mode Switcher Button */}
      <div className="flex justify-end px-1">
        <button
          type="button"
          onClick={() => setUseManualInput(!useManualInput)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          {useManualInput ? (
            <>
              <Camera className="w-4 h-4" /> Switch to Camera Viewfinder
            </>
          ) : (
            <>
              <Keyboard className="w-4 h-4" /> Switch to Manual Input
            </>
          )}
        </button>
      </div>

      {/* Camera Viewfinder vs Manual Fallback */}
      {!useManualInput ? (
        <GateScanner />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {scanResult && (
            <div
              className={`p-4 sm:p-6 rounded-2xl sm:rounded-[28px] border flex flex-col items-center text-center space-y-2 sm:space-y-3 ${
                scanResult.status === 'VALID'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {scanResult.status === 'VALID' ? (
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-500" />
              ) : (
                <XCircle className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500" />
              )}

              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-wide uppercase">{scanResult.message}</h2>
                {scanResult.ticket && (
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Attendee: <strong className="text-slate-900 dark:text-white">{scanResult.ticket.ownerName}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[32px] bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              <Keyboard className="w-4 h-4 text-blue-500" />
              <span>Manual Payload Input</span>
            </div>

            <form onSubmit={handleScanSubmit} className="space-y-4">
              <textarea
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Paste dynamic token payload..."
                className="w-full h-28 sm:h-32 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Validate Pass</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}