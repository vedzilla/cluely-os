import Link from 'next/link';
import { ArrowUpRight, Clock, MessageSquare, EyeOff, Activity } from 'lucide-react';
import { account, stats, sessions } from '@/lib/mock';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const STATCARDS = [
  { label: 'Sessions this week', value: stats.sessionsThisWeek, icon: Activity, tint: 'text-sky-500' },
  { label: 'Minutes transcribed', value: stats.minutesTranscribed, icon: Clock, tint: 'text-indigo-500' },
  { label: 'Questions asked', value: stats.questionsAsked, icon: MessageSquare, tint: 'text-orange-500' },
  {
    label: 'Stealth mode',
    value: stats.stealthOn ? 'On' : 'Off',
    icon: EyeOff,
    tint: 'text-emerald-500',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-medium text-slate-400">Welcome back</p>
        <h1 className="mt-1 font-serif text-5xl tracking-tight text-slate-900">
          Good to see you, {account.name}.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
          Everything your Cluely OS copilot captured, in one place. Your sessions and transcripts
          stay private until you choose to sync them here.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATCARDS.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <Icon size={20} className={tint} />
            <div className="mt-4 font-serif text-4xl text-slate-900">{value}</div>
            <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {label}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-slate-900">Recent sessions</h2>
          <Link href="/history" className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700">
            View all <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="glass divide-y divide-slate-200/70 overflow-hidden rounded-2xl">
          {sessions.map((s) => (
            <Link
              key={s.id}
              href={`/history?s=${s.id}`}
              className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-white/60"
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-slate-800">{s.title}</div>
                <div className="mt-0.5 text-sm text-slate-400">
                  {s.app} · {s.durationMin} min · {s.questions} questions
                </div>
              </div>
              <div className="shrink-0 text-sm text-slate-400">{fmtDate(s.date)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
