import { Skeleton } from "@/components/ui/skeleton";

export function ListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search/Toolbar skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <div className="flex gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-24 rounded-xl" />
        </div>
      </div>

      {/* List items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
