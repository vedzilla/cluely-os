import HistoryView from '@/components/HistoryView';

export default function HistoryPage({ searchParams }: { searchParams: { s?: string } }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-4xl tracking-tight text-slate-900">History</h1>
        <p className="mt-2 text-[15px] text-slate-500">
          Your captured sessions and transcripts. Synced from the desktop app when you opt in.
        </p>
      </header>
      <HistoryView initialId={searchParams.s} />
    </div>
  );
}
