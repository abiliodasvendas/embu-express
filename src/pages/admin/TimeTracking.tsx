import { ManualTimeRecordDialog } from "@/components/dialogs/ManualTimeRecordDialog";
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
import { CalendarX } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimeTracking() {
  const { setPageTitle } = useLayout();
  
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
  
  // Dialogs
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

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

  // Local filtering for Turno (if not handled by API)
  const filteredRecords = records?.filter(record => {
    if (selectedTurno === FILTER_OPTIONS.TODOS) return true;
    
    // Check if any of collab's links match the selected shift label
    // OR if the current record's shift label matches
    const recordShift = record.detalhes_calculo?.entrada?.turno_base && record.detalhes_calculo?.saida?.turno_base
      ? `${record.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${record.detalhes_calculo.saida.turno_base.substring(0, 5)}`
      : null;
      
    return recordShift === selectedTurno;
  });

  // Mutations for Loading State
  const createRecord = useCreateTimeRecord();
  const updateRecord = useUpdateTimeRecord();
  const deleteRecord = useDeleteTimeRecord();

  const isActionLoading = createRecord.isPending || updateRecord.isPending || deleteRecord.isPending;

  useEffect(() => {
    setPageTitle("Controle de Ponto");
  }, [setPageTitle]);

  const handleFiltersChange = (key: string, value: string) => {
      // Map legacy key names if necessary or just update hook directly
      if (key === "statusEntrada" && setSelectedStatusEntrada) setSelectedStatusEntrada(value);
      if (key === "statusSaida" && setSelectedStatusSaida) setSelectedStatusSaida(value);
      if (key === "usuarioId" && setSelectedUsuario) setSelectedUsuario(value);
      if (key === "clienteId" && setSelectedCliente) setSelectedCliente(value);
      if (key === "turno" && setSelectedTurno) setSelectedTurno(value);
  };

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
        <div className="space-y-6">
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
            onRegister={() => setIsManualEntryOpen(true)}
            collaborators={activeCollaborators}
            clients={clients}
            onApplyFilters={(newFilters) => {
                 setFilters({
                     statusEntrada: newFilters.statusEntrada,
                     statusSaida: newFilters.statusSaida,
                     usuario: newFilters.usuarioId, // Map usuarioId to usuario
                     cliente: newFilters.clienteId,
                     turno: newFilters.turno,
                     searchTerm: newFilters.searchTerm
                 });
            }}
            hasActiveFilters={hasActiveFilters}
        />

        {isLoading ? (
            <ListSkeleton />
        ) : !filteredRecords || filteredRecords.length === 0 ? (
            <UnifiedEmptyState 
                icon={CalendarX}
                title="Nenhum registro encontrado"
                description="Nenhum ponto registrado para esta data ou filtros."
            />
        ) : (
            <TimeTrackingList records={filteredRecords} />
        )}

        {isManualEntryOpen && (
            <ManualTimeRecordDialog 
                isOpen={isManualEntryOpen} 
                onClose={() => setIsManualEntryOpen(false)} 
            />
        )}

        {/* Global Action Loader */}
        <LoadingOverlay 
            active={isActionLoading} 
            text="Processando..." 
        />
        </div>
    </PullToRefreshWrapper>
  );
}
