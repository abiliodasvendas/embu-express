import { Skeleton } from "@/components/ui/skeleton";

export function ContasBancariasSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-10 h-10 rounded-[14px]" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Skeleton className="h-10 w-64 rounded-[14px]" />
        <Skeleton className="h-10 w-32 rounded-[14px]" />
        <Skeleton className="h-10 w-24 rounded-[14px]" />
        <Skeleton className="h-10 w-44 rounded-[14px]" />
      </div>

      <div className="rounded-[24px] border border-border bg-card p-6 shadow-xs space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border/40">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-[14px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="space-y-1.5 text-right">
              <Skeleton className="h-4 w-24 ml-auto" />
              <Skeleton className="h-3 w-16 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
