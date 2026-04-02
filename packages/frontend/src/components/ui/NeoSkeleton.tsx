/** Skeleton loader for cards / lists */
export function NeoSkeleton({
  className = "",
  lines = 1,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="neo-skeleton h-4 rounded"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

/** Full card skeleton */
export function NeoCardSkeleton() {
  return (
    <div className="neo-card p-5 space-y-4">
      <div className="neo-skeleton h-6 w-3/4 rounded" />
      <div className="neo-skeleton h-4 w-1/2 rounded" />
      <div className="space-y-2">
        <div className="neo-skeleton h-3 rounded" />
        <div className="neo-skeleton h-3 w-5/6 rounded" />
      </div>
      <div className="flex gap-3 mt-4">
        <div className="neo-skeleton h-8 w-24 rounded-lg" />
        <div className="neo-skeleton h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}
