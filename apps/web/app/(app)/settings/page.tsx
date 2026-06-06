'use client';

import { useState } from 'react';
import { account } from '@/lib/mock';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? 'bg-sky-500' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-[22px]' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [stealth, setStealth] = useState(true);
  const [sync, setSync] = useState(false);
  const [storeShots, setStoreShots] = useState(false);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-[15px] text-slate-500">Manage your account and how Cluely OS behaves.</p>
      </header>

      {/* Account */}
      <section className="glass rounded-2xl p-6">
        <h2 className="font-serif text-2xl text-slate-900">Account</h2>
        <dl className="mt-4 divide-y divide-slate-200/70 text-sm">
          {[
            ['Name', account.name],
            ['Email', account.email],
            ['Plan', account.plan],
            ['Chat provider', account.provider],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-3">
              <dt className="text-slate-400">{k}</dt>
              <dd className="font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Preferences */}
      <section className="glass space-y-1 rounded-2xl p-6">
        <h2 className="font-serif text-2xl text-slate-900">Preferences</h2>
        {[
          {
            label: 'Stealth mode',
            hint: 'Hide the overlay from screen recordings and shared screens.',
            on: stealth,
            set: () => setStealth((v) => !v),
          },
          {
            label: 'Cloud sync',
            hint: 'Sync sessions and transcripts to this dashboard. Off keeps everything on-device.',
            on: sync,
            set: () => setSync((v) => !v),
          },
          {
            label: 'Store screenshots',
            hint: 'Keep captured screenshots. Off stores only extracted text.',
            on: storeShots,
            set: () => setStoreShots((v) => !v),
          },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-6 border-t border-slate-200/70 py-4 first:border-t-0">
            <div>
              <div className="text-sm font-medium text-slate-800">{row.label}</div>
              <div className="mt-0.5 text-xs text-slate-400">{row.hint}</div>
            </div>
            <Toggle on={row.on} onClick={row.set} />
          </div>
        ))}
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-200 bg-red-50/70 p-6">
        <h2 className="font-serif text-2xl text-red-700">Danger zone</h2>
        <div className="mt-4 flex items-center justify-between gap-6">
          <p className="text-sm text-red-600/80">
            Permanently delete all synced sessions, transcripts, and account data.
          </p>
          <button className="shrink-0 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700">
            Delete all data
          </button>
        </div>
      </section>
    </div>
  );
}
