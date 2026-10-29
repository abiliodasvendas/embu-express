import { Skeleton } from "@/components/ui/skeleton";

export function DreSkeleton() {
  return (
    <div className="space-y-6">
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <Skeleton className="w-10 h-10 rounded-[14px] shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-24 rounded-[6px]" />
                <Skeleton className="h-6 w-32 rounded-[8px]" />
                <Skeleton className="h-3 w-28 rounded-[6px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
