import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { DateNavigation } from "@/components/common/DateNavigation";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { useOccurrenceViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, ChevronRight, History } from "lucide-react";
import { useEffect, useState } from "react";
import { OccurrenceDetailsDialog } from "@/components/dialogs/OccurrenceDetailsDialog";
import { useLayout } from "@/contexts/LayoutContext";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaborators } from "@/hooks/api/useCollaborators";

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
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const deleteMutation = useDeleteOcorrencia();
  const { data: collaborators = [] } = useCollaborators({});

  const vm = useOccurrenceViewModel({
    usuarioId,
    mode,
    syncWithUrl: !usuarioId, // Only sync if not in a specific collaborator's view
  });

  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Sync prop filters with VM if they change
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
        setIsDetailsOpen(false);
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
                <div
                  key={oc.id}
                  onClick={() => {
                    setSelectedOccurrence(oc);
                    setIsDetailsOpen(true);
                  }}
                  className="relative pl-9 py-4 group cursor-pointer transition-all hover:bg-gray-50/50 rounded-2xl"
                >
                  <div className={cn(
                    "absolute left-0 top-[22px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110",
                    !oc.impacto_financeiro
                      ? "bg-slate-300"
                      : oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA
                        ? "bg-red-500"
                        : "bg-green-500"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                          {format(parseISO(oc.data_ocorrencia), "dd 'de' MMM", { locale: ptBR })}
                        </span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-gray-200 text-gray-500 font-bold bg-white">
                          {oc.tipo?.descricao || 'Ocorrência'}
                        </Badge>
                        {!usuarioId && (
                          <span className="text-[11px] font-bold text-gray-900 truncate max-w-[150px]">
                            {oc.colaborador?.nome_completo}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-700 truncate pr-4 italic">
                        {oc.observacao || 'Sem observação'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {oc.impacto_financeiro && (
                        <div className={cn(
                          "text-xs font-black px-2 py-1 rounded-lg",
                          oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                        )}>
                          {oc.tipo_lancamento === LANCAMENTO_TIPO.SAIDA ? "-" : "+"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(oc.valor || 0)}
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </div>
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

      <OccurrenceDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        occurrence={selectedOccurrence}
        onDelete={() => handleDelete(selectedOccurrence)}
      />
    </PullToRefreshWrapper>
  );
}
