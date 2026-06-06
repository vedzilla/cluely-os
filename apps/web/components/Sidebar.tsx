'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, UserCircle, Settings, Download } from 'lucide-react';
import Logo from './Logo';
import { account } from '@/lib/mock';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/history', label: 'History', icon: History },
  { href: '/context', label: 'Personal Context', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-0 flex h-screen w-64 flex-col rounded-none border-y-0 border-l-0 px-4 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <Logo size={24} />
        <span className="font-serif text-[22px] leading-none text-slate-900">Cluely OS</span>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
              }`}
            >
              <Icon size={18} className={active ? 'text-sky-500' : 'text-slate-400'} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <a
          href="https://github.com/vedzilla/cluely-os"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          <Download size={16} /> Download the app
        </a>
        <div className="flex items-center gap-3 rounded-xl px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-sm font-semibold text-white">
            {account.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-800">{account.name}</div>
            <div className="truncate text-xs text-slate-400">{account.email}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
