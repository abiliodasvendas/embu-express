import { Skeleton } from "@/components/ui/skeleton";

export function ClientDetailsSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pulse">
      <Skeleton className="h-6 w-48 rounded-[14px]" />
      <div className="flex justify-between items-center bg-card p-5 rounded-[18px] border border-border shadow-xs">
        <Skeleton className="h-10 w-32 rounded-[14px]" />
        <Skeleton className="h-10 w-24 rounded-[14px]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <Skeleton className="h-64 rounded-[18px]" />
          <Skeleton className="h-32 rounded-[18px]" />
        </div>
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
            <Skeleton className="h-24 rounded-[18px]" />
          </div>
          <Skeleton className="h-[400px] rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}
