import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useClients, useFilters } from "@/hooks";
import { useCreateTimeRecord, useDeleteTimeRecord, useUpdateTimeRecord } from "@/hooks/api/useTimeRecordMutations";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { FILTER_OPTIONS } from "@/constants/ponto";
import { format } from "date-fns";
import { CalendarX, Users, Clock, PlayCircle, LogOut, AlertTriangle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getManagementStatus, ManagementStatus } from "@/utils/ponto";
import { cn } from "@/lib/utils";

export default function TimeTracking() {
  const { setPageTitle, openTimeRecordDialog } = useLayout();
  
  // Filters Hook
  const {
      searchTerm,
      setSearchTerm,
      selectedStatusEntrada = FILTER_OPTIONS.TODOS,
      setSelectedStatusEntrada,
      selectedStatusSaida = FILTER_OPTIONS.TODOS,
      setSelectedStatusSaida,
      selectedUsuario = FILTER_OPTIONS.TODOS,
      setSelectedUsuario,
      selectedCliente = FILTER_OPTIONS.TODOS,
      setSelectedCliente,
      selectedTurno = FILTER_OPTIONS.TODOS,
      setSelectedTurno,
      hasActiveFilters,
      setFilters
  } = useFilters({
      statusEntradaParam: "status_entrada",
      statusSaidaParam: "status_saida",
      usuarioParam: "usuario",
      clienteParam: "cliente",
      turnoParam: "turno",
      syncWithUrl: true
  });

  const [date, setDate] = useState<Date>(new Date());
  const [activeKpiFilter, setActiveKpiFilter] = useState<ManagementStatus | null>(null);

  // Data Hooks - Active Collaborators for Filter
  const { data: activeCollaborators = [] } = useActiveCollaborators();
  const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

  // Data Hooks - Time Records
  const { data: records, isLoading, refetch } = useTimeRecords({
      date: format(date, "yyyy-MM-dd"),
      searchTerm,
      usuarioId: selectedUsuario === FILTER_OPTIONS.TODOS ? undefined : selectedUsuario,
      statusEntrada: selectedStatusEntrada === FILTER_OPTIONS.TODOS ? undefined : selectedStatusEntrada,
      statusSaida: selectedStatusSaida === FILTER_OPTIONS.TODOS ? undefined : selectedStatusSaida,
      clienteId: selectedCliente === FILTER_OPTIONS.TODOS ? undefined : selectedCliente,
      incluirTodos: true
  });

  // 1. Process records with unified management status
  const processedRecords = useMemo(() => {
    return records?.map(r => ({
        ...r,
        mgtStatus: getManagementStatus(r, date)
    })) || [];
  }, [records, date]);

  // 2. Calculate KPI counts
  const kpiCounts = useMemo(() => {
      const counts = { ALL: processedRecords.length, LATE: 0, WORKING: 0, DONE: 0, WAITING: 0, ABSENT: 0 };
      processedRecords.forEach(r => {
          counts[r.mgtStatus]++;
      });
      return counts;
  }, [processedRecords]);

  // 3. Apply Local filters (KPI + Turno)
  const filteredRecords = processedRecords.filter(record => {
    // KPI Filter
    if (activeKpiFilter && record.mgtStatus !== activeKpiFilter) return false;

    // Turno Filter
    if (selectedTurno !== FILTER_OPTIONS.TODOS) {
        const recordShift = record.detalhes_calculo?.entrada?.turno_base && record.detalhes_calculo?.saida?.turno_base
            ? `${record.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${record.detalhes_calculo.saida.turno_base.substring(0, 5)}`
            : null;
        if (recordShift !== selectedTurno) return false;
    }
      
    return true;
  });

  // Actions
  const createRecord = useCreateTimeRecord();
  const updateRecord = useUpdateTimeRecord();
  const deleteRecord = useDeleteTimeRecord();
  const isActionLoading = createRecord.isPending || updateRecord.isPending || deleteRecord.isPending;

  useEffect(() => {
    setPageTitle("Controle de Ponto");
  }, [setPageTitle]);

  const handleFiltersChange = (key: string, value: string) => {
      if (key === "statusEntrada" && setSelectedStatusEntrada) setSelectedStatusEntrada(value);
      if (key === "statusSaida" && setSelectedStatusSaida) setSelectedStatusSaida(value);
      if (key === "usuarioId" && setSelectedUsuario) setSelectedUsuario(value);
      if (key === "clienteId" && setSelectedCliente) setSelectedCliente(value);
      if (key === "turno" && setSelectedTurno) setSelectedTurno(value);
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
    ALL: { label: "Todos", color: "text-primary", bg: "bg-primary/5", border: "border-primary", icon: Users },
    LATE: { label: "Atrasados", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500", icon: Clock },
    WORKING: { label: "Trabalhando", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500", icon: PlayCircle },
    DONE: { label: "Finalizado", color: "text-gray-400", bg: "bg-gray-100", border: "border-gray-500", icon: LogOut },
    WAITING: { label: "Aguar. Início", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-300", icon: Clock },
    ABSENT: { label: "Faltas", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-500", icon: AlertTriangle },
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
        <div className="space-y-6 pb-12">
            <TimeTrackingToolbar 
                date={date}
                onDateChange={setDate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={{
                    statusEntrada: selectedStatusEntrada,
                    statusSaida: selectedStatusSaida,
                    usuarioId: selectedUsuario,
                    clienteId: selectedCliente,
                    turno: selectedTurno
                }}
                onFiltersChange={handleFiltersChange}
                onRegister={() => openTimeRecordDialog({})}
                collaborators={activeCollaborators}
                clients={clients}
                onApplyFilters={(newFilters) => {
                     setFilters({
                         statusEntrada: newFilters.statusEntrada,
                         statusSaida: newFilters.statusSaida,
                         usuario: newFilters.usuarioId,
                         cliente: newFilters.clienteId,
                         turno: newFilters.turno,
                         searchTerm: newFilters.searchTerm
                     });
                }}
                hasActiveFilters={hasActiveFilters}
            />

            {/* KPI Quick Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
                {(['ALL', 'LATE', 'WORKING', 'DONE', 'WAITING', 'ABSENT'] as const).map((status) => {
                    const config = statusConfig[status];
                    const isActive = (status === 'ALL' && activeKpiFilter === null) || activeKpiFilter === status;
                    const count = kpiCounts[status];
                    
                    return (
                        <button
                            key={status}
                            onClick={() => setActiveKpiFilter(status === 'ALL' ? null : (isActive ? null : (status as ManagementStatus)))}
                            className={cn(
                                "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all duration-200 text-center h-full active:scale-95 cursor-pointer",
                                isActive
                                    ? cn(config.border, config.bg, "shadow-md scale-[1.02]")
                                    : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 hover:shadow-sm"
                            )}
                        >
                            <span className={cn(
                                "text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-1 leading-tight text-center px-1",
                                isActive ? config.color : "text-gray-400"
                            )}>
                                {config.label}
                            </span>
                            <span className={cn(
                                "text-lg sm:text-2xl font-black",
                                isActive ? config.color : "text-gray-300"
                            )}>
                                {String(count).padStart(2, '0')}
                            </span>
                        </button>
                    );
                })}
            </div>

            {isLoading ? (
                <ListSkeleton />
            ) : !filteredRecords || filteredRecords.length === 0 ? (
                <UnifiedEmptyState 
                    icon={CalendarX}
                    title="Nenhum registro encontrado"
                    description="Nenhum ponto registrado para esta data ou filtros."
                />
            ) : (
                <TimeTrackingList 
                    records={filteredRecords} 
                    date={date}
                />
            )}

            <LoadingOverlay active={isActionLoading} text="Processando..." />
        </div>
    </PullToRefreshWrapper>
  );
}
