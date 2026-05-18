export function ProfileCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <article
      className="glossy-card gradient-border animate-fade-in overflow-hidden"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
      <div className="space-y-3 bg-gradient-to-b from-card to-secondary/30 p-5">
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted/70" />
        <div className="h-3 w-3/4 rounded bg-muted/60" />
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 rounded bg-muted/60" />
          <div className="h-8 flex-1 rounded bg-muted/60" />
        </div>
      </div>
    </article>
  );
}

export function ProfileGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} delay={i * 60} />
      ))}
    </div>
  );
}
