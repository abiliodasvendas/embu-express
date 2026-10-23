import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  count?: number;
  className?: string;
  showToolbar?: boolean;
}

export function ListSkeleton({
  count = 5,
  className = "",
  showToolbar = false,
}: ListSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {showToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Skeleton className="h-11 flex-1 rounded-[18px] bg-muted/60" />
          <div className="flex gap-2.5">
            <Skeleton className="h-11 w-28 rounded-[18px] bg-muted/60" />
            <Skeleton className="h-11 w-28 rounded-[18px] bg-muted/60" />
          </div>
        </div>
      )}

      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="bg-card p-4 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <Skeleton className="w-10 h-10 rounded-[14px] bg-muted/70 shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-4 w-44 max-w-[70%] rounded-[8px] bg-muted/70" />
              <Skeleton className="h-3 w-28 max-w-[50%] rounded-[6px] bg-muted/50" />
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <Skeleton className="h-6 w-24 rounded-[8px] bg-muted/50" />
            <Skeleton className="h-6 w-16 rounded-[8px] bg-muted/60" />
            <Skeleton className="h-8 w-8 rounded-[10px] bg-muted/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface KpiGridSkeletonProps {
  count?: number;
  cols?: 2 | 3 | 4;
  className?: string;
}

export function KpiGridSkeleton({
  count = 4,
  cols = 4,
  className,
}: KpiGridSkeletonProps) {
  const gridColsClass =
    cols === 2
      ? "sm:grid-cols-2"
      : cols === 3
      ? "sm:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div
      className={cn(
        "-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0",
        gridColsClass,
        className
      )}
    >
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5"
        >
          <div className="flex items-center justify-between pb-2">
            <Skeleton className="h-3.5 w-28 rounded-[6px] bg-muted/60" />
            <Skeleton className="w-10 h-10 rounded-[14px] bg-muted/70 shrink-0" />
          </div>
          <Skeleton className="h-8 w-36 rounded-[10px] bg-muted/70 mt-2" />
          <Skeleton className="h-3 w-40 rounded-[6px] bg-muted/50 mt-2" />
        </div>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  cols,
  columns,
  className = "",
}: TableSkeletonProps) {
  const totalCols = cols ?? columns ?? 6;

  return (
    <div className={cn("relative rounded-3xl border border-border bg-card shadow-xs overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-alt/60">
            <tr className="border-b border-border">
              {[...Array(totalCols)].map((_, i) => (
                <th key={i} className="py-3.5 px-4">
                  <Skeleton className="h-3.5 w-20 rounded-[6px] bg-muted/60" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {[...Array(rows)].map((_, rIndex) => (
              <tr key={rIndex} className="hover:bg-transparent">
                {[...Array(totalCols)].map((_, cIndex) => (
                  <td key={cIndex} className="py-4 px-4">
                    <Skeleton
                      className={cn(
                        "h-4 rounded-[6px] bg-muted/50",
                        cIndex === 0 ? "w-28" : cIndex === totalCols - 1 ? "w-16 ml-auto" : "w-24"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
