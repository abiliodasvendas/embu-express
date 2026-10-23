import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FilterOptions, OccurrenceFormMode } from "@/types/enums";
import { safeCloseDialog, useOccurrenceViewModel } from "@/hooks";
import { History } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { OccurrenceDailyItem } from "./OccurrenceDailyItem";
import { useMemo } from "react";
import { Ocorrencia } from "@/types/database";
import { cn } from "@/lib/utils";

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
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openOccurrenceDetailsDialog,
    closeOccurrenceDetailsDialog,
    openOccurrenceFormDialog,
  } = useLayout();
  const deleteMutation = useDeleteOcorrencia();
  const { data: collaboratorsResponse } = useCollaborators({}, { enabled: !usuarioId });
  const collaborators = useMemo(() => {
    if (!collaboratorsResponse) return [];
    if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
    return collaboratorsResponse.data || [];
  }, [collaboratorsResponse]);

  const vm = useOccurrenceViewModel({
    usuarioId,
    mode,
    selectedMonth,
    selectedYear,
    syncWithUrl: !usuarioId,
  });

  const handleDelete = (occurrence: Ocorrencia) => {
    if (!occurrence.id) return;
    const occId = occurrence.id;

    openConfirmationDialog({
      title: "Remover Ocorrência",
      description: `Deseja realmente remover esta ocorrência de ${occurrence.tipo?.descricao || "ocorrência"}?`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(occId);
        closeOccurrenceDetailsDialog();
        safeCloseDialog(closeConfirmationDialog);
        vm.refetch();
        onOccurrenceDeleted?.();
      },
    });
  };

  const handleEdit = (occurrence: Ocorrencia) => {
    openOccurrenceFormDialog({
      collaboratorId: occurrence.colaborador_id,
      mode: occurrence.impacto_financeiro ? OccurrenceFormMode.FINANCIAL : OccurrenceFormMode.GENERAL,
      defaultValues: {
        id: occurrence.id,
        colaborador_id: occurrence.colaborador_id,
        tipo_id: String(occurrence.tipo_id),
        data_ocorrencia: occurrence.data_ocorrencia,
        valor: occurrence.valor ?? undefined,
        impacto_financeiro: occurrence.impacto_financeiro,
        tipo_lancamento: occurrence.tipo_lancamento,
        colaborador_cliente_id: occurrence.colaborador_cliente_id ? String(occurrence.colaborador_cliente_id) : "none",
        observacao: occurrence.observacao,
      },
      onSuccess: () => {
        closeOccurrenceDetailsDialog();
        vm.refetch();
        onOccurrenceDeleted?.();
      },
    });
  };

  const displayOccurrences = useMemo(() => {
    if (impactoFinanceiro !== undefined) {
      return (vm.occurrences as Ocorrencia[]).filter((oc) => oc.impacto_financeiro === impactoFinanceiro);
    }
    return vm.occurrences as Ocorrencia[];
  }, [vm.occurrences, impactoFinanceiro]);

  return (
    <PullToRefreshWrapper onRefresh={async () => { await vm.refetch(); }}>
      <div className="space-y-6">
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
            {!usuarioId && (
              <div className="md:col-span-2 space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground ml-1">Colaborador</Label>
                <Combobox
                  options={[
                    { value: FilterOptions.TODOS, label: "Todos os colaboradores" },
                    ...collaborators.map((c) => ({ value: String(c.id), label: c.nome_completo })),
                  ]}
                  value={vm.filters.selectedUsuario || FilterOptions.TODOS}
                  onSelect={(val) => vm.setUsuario(val || FilterOptions.TODOS)}
                  placeholder="Selecione um colaborador..."
                  searchPlaceholder="Buscar colaborador..."
                  emptyText="Nenhum colaborador encontrado."
                  className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground ml-1">Tipo</Label>
              <Combobox
                options={[
                  { value: FilterOptions.TODOS, label: "Todos os tipos" },
                  ...vm.tiposOcorrencia.map((t) => ({ value: String(t.id), label: t.descricao })),
                ]}
                value={vm.filters.selectedTipo || FilterOptions.TODOS}
                onSelect={(val) => vm.setTipo(val || FilterOptions.TODOS)}
                placeholder="Filtrar por tipo..."
                className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground ml-1">De</Label>
              <Input
                type="date"
                value={vm.startDate}
                onChange={(e) => vm.setStartDate(e.target.value)}
                className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground ml-1">Até</Label>
              <Input
                type="date"
                value={vm.endDate}
                onChange={(e) => vm.setEndDate(e.target.value)}
                className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="space-y-2.5 relative">
          {vm.isFetching && !vm.isInitialLoading && (
            <div className="absolute -top-3 left-0 right-0 h-1 bg-surface-alt overflow-hidden rounded-full z-20">
              <div className="h-full bg-primary w-full animate-pulse" />
            </div>
          )}
          {vm.isInitialLoading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-[18px] border border-border" />
              ))}
            </div>
          ) : displayOccurrences.length === 0 ? (
            <UnifiedEmptyState
              icon={History}
              title="Nenhuma ocorrência"
              description="Não há registros para os filtros selecionados."
            />
          ) : (
            <div className={cn("space-y-2.5 transition-opacity duration-200", vm.isFetching && "opacity-50 pointer-events-none")}>
              {displayOccurrences.map((oc) => (
                <OccurrenceDailyItem
                  key={oc.id}
                  occurrence={oc}
                  showCollaborator={!usuarioId}
                  onClick={(occurrence) =>
                    openOccurrenceDetailsDialog({
                      occurrence,
                      onDelete: !occurrence.is_virtual ? () => handleDelete(occurrence) : undefined,
                      onEdit: !occurrence.is_virtual ? () => handleEdit(occurrence) : undefined,
                    })
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}
