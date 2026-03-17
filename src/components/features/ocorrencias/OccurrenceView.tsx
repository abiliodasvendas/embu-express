import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DateNavigation } from "@/components/common/DateNavigation";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { useOccurrenceViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { OccurrenceDailyItem } from "./OccurrenceDailyItem";

interface OccurrenceViewProps {
  usuarioId?: string;
  mode?: "daily" | "monthly";
  selectedMonth?: number;
  selectedYear?: number;
  showFilters?: boolean;
  onOccurrenceDeleted?: () => void;
}

export function OccurrenceView({
  usuarioId,
  mode = "daily",
  selectedMonth,
  selectedYear,
  showFilters = true,
  onOccurrenceDeleted,
}: OccurrenceViewProps) {
  const { openConfirmationDialog, closeConfirmationDialog, openOccurrenceDetailsDialog, closeOccurrenceDetailsDialog } = useLayout();
  const deleteMutation = useDeleteOcorrencia();
  const { data: collaborators = [] } = useCollaborators({});

  const vm = useOccurrenceViewModel({
    usuarioId,
    mode,
    syncWithUrl: !usuarioId,
  });

  useEffect(() => {
    if (selectedMonth && vm.setMonth) vm.setMonth(selectedMonth);
  }, [selectedMonth, vm.setMonth]);

  useEffect(() => {
    if (selectedYear && vm.setYear) vm.setYear(selectedYear);
  }, [selectedYear, vm.setYear]);

  const handleDelete = (occurrence: any) => {
    openConfirmationDialog({
      title: "Remover Ocorrência",
      description: `Deseja realmente remover esta ocorrência de ${occurrence.tipo?.descricao}?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(occurrence.id);
        closeOccurrenceDetailsDialog();
        closeConfirmationDialog();
        vm.refetch();
        onOccurrenceDeleted?.();
      },
    });
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
      <div className="space-y-6">
        {showFilters && (
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-gray-50/50">
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                {!usuarioId && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Colaborador</label>
                    <Combobox
                      options={[
                        { value: STATUS_CADASTRO.TODOS, label: "Todos os colaboradores" },
                        ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                      ]}
                      value={vm.filters.selectedUsuario || STATUS_CADASTRO.TODOS}
                      onSelect={(val) => vm.setUsuario(val || STATUS_CADASTRO.TODOS)}
                      placeholder="Selecione um colaborador..."
                      searchPlaceholder="Buscar colaborador..."
                      emptyText="Nenhum colaborador encontrado."
                      className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white transition-none shadow-none"
                    />
                  </div>
                )}

                <div className={cn("space-y-2", !usuarioId ? "md:col-span-2" : "md:col-span-4")}>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">
                    {mode === "daily" ? "Data da Ocorrência" : "Período"}
                  </label>
                  <DateNavigation
                    date={vm.localDate}
                    onNavigate={vm.setLocalDate}
                    maxDate={null}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {vm.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : vm.occurrences.length > 0 ? (
            <div className="relative space-y-0">
              <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

              {vm.occurrences.map((oc) => (
                <OccurrenceDailyItem
                  key={oc.id}
                  occurrence={oc}
                  showCollaborator={!usuarioId}
                  onClick={(occurrence) => openOccurrenceDetailsDialog({
                    occurrence,
                    onDelete: () => handleDelete(occurrence)
                  })}
                />
              ))}
            </div>
          ) : (
            <UnifiedEmptyState
              icon={History}
              title="Nenhuma ocorrência"
              description="Não há registros para os filtros selecionados."
            />
          )}
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}
