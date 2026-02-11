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
import { format } from "date-fns";
import { CalendarX } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimeTracking() {
  const { setPageTitle } = useLayout();
  
  // Filters Hook
  const {
      searchTerm,
      setSearchTerm,
      selectedStatusEntrada = "todos",
      setSelectedStatusEntrada,
      selectedStatusSaida = "todos",
      setSelectedStatusSaida,
      selectedUsuario = "todos",
      setSelectedUsuario,
      selectedCliente = "todos",
      setSelectedCliente,
      hasActiveFilters,
      setFilters
  } = useFilters({
      statusEntradaParam: "status_entrada",
      statusSaidaParam: "status_saida",
      usuarioParam: "usuario",
      clienteParam: "cliente",
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
      usuarioId: selectedUsuario === "todos" ? undefined : selectedUsuario,
      statusEntrada: selectedStatusEntrada === "todos" ? undefined : selectedStatusEntrada,
      statusSaida: selectedStatusSaida === "todos" ? undefined : selectedStatusSaida,
      clienteId: selectedCliente === "todos" ? undefined : selectedCliente
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
                clienteId: selectedCliente
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
                     searchTerm: newFilters.searchTerm
                 });
            }}
            hasActiveFilters={hasActiveFilters}
        />

        {isLoading ? (
            <ListSkeleton />
        ) : !records || records.length === 0 ? (
            <UnifiedEmptyState 
                icon={CalendarX}
                title="Nenhum registro encontrado"
                description="Nenhum ponto registrado para esta data ou filtros."
            />
        ) : (
            <TimeTrackingList records={records} />
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
