export default function AdminDashboardLoading() {
  return (
    <div className="space-y-12 text-white" aria-busy="true" aria-live="polite">
      <div className="space-y-4">
        <div className="h-3 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-10 max-w-xl animate-pulse rounded-full bg-white/10" />
        <div className="h-4 max-w-2xl animate-pulse rounded-full bg-white/8" />
        <div className="h-4 max-w-xl animate-pulse rounded-full bg-white/8" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,_0.42fr)]">
        <div className="h-14 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="h-14 animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
      <div className="hidden animate-pulse space-y-0 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] lg:block">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-8 border-t border-white/[0.06] px-6 py-4 first:border-t-0">
            <div className="h-5 flex-1 rounded bg-white/[0.08]" />
            <div className="h-5 w-44 rounded bg-white/[0.08]" />
            <div className="h-5 w-52 rounded bg-white/[0.08]" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:hidden">
        {[1, 2].map((i) => (
          <div key={`m-${i}`} className="h-52 animate-pulse rounded-[28px] bg-white/[0.04]" />
        ))}
      </div>
      <p className="text-center text-xs text-white/50">Synchronizing submission queue…</p>
    </div>
  );
}
