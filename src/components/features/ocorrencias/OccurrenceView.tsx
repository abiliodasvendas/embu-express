import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { FilterOptions } from "@/types/enums";
import { safeCloseDialog, useOccurrenceViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { History } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { OccurrenceDailyItem } from "./OccurrenceDailyItem";

import { useEffect } from "react";
interface OccurrenceViewProps {
  usuarioId?: string;
  mode?: "daily" | "monthly";
  selectedMonth?: number;
  selectedYear?: number;
  showFilters?: boolean;
  onOccurrenceDeleted?: () => void;
  impactoFinanceiro?: boolean;
}

export function OccurrenceView({
  usuarioId,
  mode = "daily",
  selectedMonth,
  selectedYear,
  showFilters = true,
  onOccurrenceDeleted,
  impactoFinanceiro,
}: OccurrenceViewProps) {
  const { openConfirmationDialog, closeConfirmationDialog, openOccurrenceDetailsDialog, closeOccurrenceDetailsDialog } = useLayout();
  const deleteMutation = useDeleteOcorrencia();
  const { data: collaborators = [] } = useCollaborators({}, { enabled: !usuarioId });

  const vm = useOccurrenceViewModel({
    usuarioId,
    mode,
    selectedMonth,
    selectedYear,
    syncWithUrl: !usuarioId,
  });


  const handleDelete = (occurrence: any) => {
    openConfirmationDialog({
      title: "Remover Ocorrência",
      description: `Deseja realmente remover esta ocorrência de ${occurrence.tipo?.descricao}?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(occurrence.id);
        closeOccurrenceDetailsDialog();
        safeCloseDialog(closeConfirmationDialog);
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
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                {!usuarioId && (
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Colaborador</label>
                    <Combobox
                      options={[
                        { value: FilterOptions.TODOS, label: "Todos os colaboradores" },
                        ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                      ]}
                      value={vm.filters.selectedUsuario || FilterOptions.TODOS}
                      onSelect={(val) => vm.setUsuario(val || FilterOptions.TODOS)}
                      placeholder="Selecione um colaborador..."
                      searchPlaceholder="Buscar colaborador..."
                      emptyText="Nenhum colaborador encontrado."
                      className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white transition-none shadow-none"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Tipo</label>
                  <Combobox
                    options={[
                      { value: FilterOptions.TODOS, label: "Todos os tipos" },
                      ...vm.tiposOcorrencia.map(t => ({ value: String(t.id), label: t.descricao }))
                    ]}
                    value={vm.filters.selectedTipo || FilterOptions.TODOS}
                    onSelect={(val) => vm.setTipo(val || FilterOptions.TODOS)}
                    placeholder="Filtrar por tipo..."
                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white transition-none shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">De</label>
                  <Input
                    type="date"
                    value={vm.startDate}
                    onChange={(e) => vm.setStartDate(e.target.value)}
                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Até</label>
                  <Input
                    type="date"
                    value={vm.endDate}
                    onChange={(e) => vm.setEndDate(e.target.value)}
                    className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 shadow-none"
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
          ) : (() => {
            const displayOccurrences = impactoFinanceiro !== undefined
              ? vm.occurrences.filter(oc => oc.impacto_financeiro === impactoFinanceiro)
              : vm.occurrences;

            if (displayOccurrences.length === 0) {
              return (
                <UnifiedEmptyState
                  icon={History}
                  title="Nenhuma ocorrência"
                  description="Não há registros para os filtros selecionados."
                />
              );
            }

            return (
              <div className="relative space-y-0">
                <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

                {displayOccurrences.map((oc) => (
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
            );
          })()}
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}
