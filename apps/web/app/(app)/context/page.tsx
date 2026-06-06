'use client';

import { useState } from 'react';
import { Check, Save } from 'lucide-react';

const FIELDS = [
  {
    key: 'about',
    label: 'About you',
    hint: 'Who you are and what you do — Cluely uses this to tailor every answer.',
    placeholder: 'e.g. I’m the founder of Arcube, a travel-tech startup. I run investor calls and customer interviews.',
    rows: 3,
  },
  {
    key: 'goals',
    label: 'Goals',
    hint: 'What you want the copilot to optimize for.',
    placeholder: 'e.g. Be concise, surface hard numbers, and suggest sharp follow-up questions.',
    rows: 3,
  },
  {
    key: 'instructions',
    label: 'Custom instructions',
    hint: 'Always-on guidance for how Cluely should respond.',
    placeholder: 'e.g. Never use filler. Prefer bullet points. Flag anything that sounds like a commitment.',
    rows: 4,
  },
] as const;

export default function ContextPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-slate-900">Personal Context</h1>
        <p className="mt-2 max-w-xl text-[15px] text-slate-500">
          Give the copilot a memory of who you are. This context is sent with every request so
          answers fit your world.
        </p>
      </header>

      <div className="glass space-y-6 rounded-2xl p-6">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-semibold text-slate-800">{f.label}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{f.hint}</span>
            <textarea
              rows={f.rows}
              value={values[f.key] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-[15px] text-slate-800 placeholder-slate-300 outline-none transition-colors focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            />
          </label>
        ))}

        <div className="flex justify-end">
          <button
            onClick={save}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors ${
              saved ? 'bg-emerald-500' : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? 'Saved' : 'Save context'}
          </button>
        </div>
      </div>
    </div>
  );
}
