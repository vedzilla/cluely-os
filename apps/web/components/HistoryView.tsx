'use client';

import { useState } from 'react';
import { Clock, MessageSquare, Monitor } from 'lucide-react';
import { sessions, type Session } from '@/lib/mock';

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryView({ initialId }: { initialId?: string }) {
  const initial = sessions.find((s) => s.id === initialId) ?? sessions[0];
  const [selected, setSelected] = useState<Session>(initial);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      {/* List */}
      <div className="glass h-fit overflow-hidden rounded-2xl">
        {sessions.map((s) => {
          const active = s.id === selected.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`block w-full border-b border-slate-200/70 px-4 py-3.5 text-left transition-colors last:border-0 ${
                active ? 'bg-white' : 'hover:bg-white/60'
              }`}
            >
              <div className="truncate text-sm font-medium text-slate-800">{s.title}</div>
              <div className="mt-0.5 text-xs text-slate-400">{fmtDateTime(s.date)}</div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-serif text-3xl text-slate-900">{selected.title}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <Monitor size={14} /> {selected.app}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} /> {selected.durationMin} min
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare size={14} /> {selected.questions} questions
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-gradient-to-br from-sky-50 to-indigo-50 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Summary</div>
          <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">{selected.summary}</p>
        </div>

        <div className="mt-6">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Transcript
          </div>
          <div className="space-y-4">
            {selected.transcript.map((line, i) => (
              <div key={i} className="flex gap-3">
                <span
                  className={`mt-0.5 w-12 shrink-0 text-sm font-semibold ${
                    line.speaker === 'You' ? 'text-sky-600' : 'text-indigo-600'
                  }`}
                >
                  {line.speaker}
                </span>
                <p className="text-[15px] leading-relaxed text-slate-700">{line.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
