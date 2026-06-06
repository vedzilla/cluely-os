import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAppStore } from '../stores/appStore';

interface Props {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function PanelHeader({ icon: Icon, title, subtitle, right }: Props) {
  const closePanel = useAppStore((s) => s.closePanel);

  return (
    <div className="drag flex items-center justify-between gap-2 border-b border-white/[0.07] px-4 py-2.5">
      <div className="no-drag flex min-w-0 items-center gap-2.5">
        {Icon && <Icon size={15} className="shrink-0 text-white/60" />}
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-white/95">{title}</div>
          {subtitle && <div className="truncate text-[11px] text-white/45">{subtitle}</div>}
        </div>
      </div>
      <div className="no-drag flex items-center gap-1.5">
        {right}
        <button
          onClick={closePanel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white/90"
          title="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
