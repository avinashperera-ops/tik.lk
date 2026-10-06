'use client';

import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  Plus, 
  Calendar,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white/20 overflow-hidden bg-slate-800 shadow-2xl flex items-center justify-center">
              {user?.image ? (
                <img src={user.image} alt={user.name || 'Profile'} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-extrabold text-white">
                  {user?.name?.[0] || user?.email?.[0] || 'U'}
                </span>
              )}
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name || 'User Profile'}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 w-fit mx-auto sm:mx-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Account
              </span>
            </div>
            <p className="text-slate-200 text-sm">{user?.email || 'No email connected'}</p>
            <p className="text-xs text-blue-200/80 pt-1">Member since 2026 • Tik.lk Pass Holder</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
              </div>
              <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Edit
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name || 'Not provided'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Display Name</span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {user?.name?.split(' ')[0] || 'User'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gender</span>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Male</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date of Birth</span>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>June 28, 2005</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Contact Details</h2>
              </div>
              <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Update
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{user?.email || 'Not provided'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</span>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+94 77 123 4567</span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Primary Address</span>
                <div className="flex items-start gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <span>Moratuwa, Western Province, Sri Lanka</span>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Payment Details Section */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Saved Payment Methods</h2>
              </div>
              <button className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                <Plus className="w-3.5 h-3.5" />
                Add Card
              </button>
            </div>

            <div className="space-y-3 mt-6">
              {/* Card Item 1 */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                    VISA
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Expires 12/28 • Primary Payment Method</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Default
                </span>
              </div>

              {/* Card Item 2 */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                    MC
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">•••• •••• •••• 8819</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Expires 09/27</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 transition">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Security & Account Status Column */}
        <div className="space-y-6">
          {/* Account Security Box */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Auth</h2>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <KeyRound className="w-4 h-4 text-slate-400" />
                  <span>Password</span>
                </div>
                <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                  Change
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>2-Factor Authentication</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Connected Identity Provider */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm backdrop-blur-md space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Login</h3>
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                G
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Google OAuth 2.0</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Connected via NextAuth</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}