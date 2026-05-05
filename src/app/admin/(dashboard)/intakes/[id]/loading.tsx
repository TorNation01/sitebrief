export default function IntakeStudioDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 text-white lg:gap-14" aria-busy="true" aria-live="polite">
      <div className="flex flex-wrap items-start justify-between gap-8 border-b border-white/[0.08] pb-8">
        <div className="space-y-6">
          <div className="h-3 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 w-[min(100%,380px)] animate-pulse rounded-2xl bg-white/10" />
          <div className="flex flex-wrap gap-3">
            <div className="h-9 w-32 animate-pulse rounded-full bg-white/8" />
            <div className="h-9 w-44 animate-pulse rounded-full bg-white/8" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-12 w-[min(260px,calc(100vw-72px))] animate-pulse rounded-2xl bg-white/8" />
          <div className="h-12 w-[min(260px,calc(100vw-72px))] animate-pulse rounded-2xl bg-white/8" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 animate-pulse rounded-[36px] border border-white/[0.06] bg-white/[0.02]" />
      ))}
      <p className="text-center text-xs text-white/48">Hydrating dossier…</p>
    </div>
  );
}
