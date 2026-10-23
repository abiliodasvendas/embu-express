import { ListSkeleton, KpiGridSkeleton } from "@/components/skeletons";

export function BloqueadosSkeleton() {
  return (
    <div className="space-y-6">
      <KpiGridSkeleton count={3} cols={3} />
      <ListSkeleton showToolbar />
    </div>
  );
}
