import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Logo from '@/components/Logo';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass w-full max-w-sm rounded-3xl p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={40} />
          <h1 className="mt-5 font-serif text-4xl tracking-tight text-slate-900">Welcome to Cluely OS</h1>
          <p className="mt-2 text-[15px] text-slate-500">Sign in to view your sessions and settings.</p>
        </div>

        <div className="mt-8 space-y-3">
          <input
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-800 placeholder-slate-300 outline-none transition-colors focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          />
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Continue <ArrowRight size={16} />
          </Link>
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
          >
            Continue with Google
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to keep being awesome.
        </p>
      </div>
    </div>
  );
}
