import { ManualTimeRecordDialog } from "@/components/dialogs/ManualTimeRecordDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useClients, useFilters } from "@/hooks";
import { useTimeRecords } from "@/hooks/api/useTimeRecords";
import { apiClient } from "@/services/api/client";
import { colaboradorApi } from "@/services/api/colaborador.api";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarX } from "lucide-react";
import { useEffect, useState } from "react";

export default function TimeTracking() {
  const { setPageTitle } = useLayout();
  const queryClient = useQueryClient();
  
  // State
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

  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerateMockData = async () => {
      try {
          setIsGenerating(true);
          
          let empList = queryClient.getQueryData<any[]>(["active-collaborators-filter"]);
          
          if (!empList) {
             empList = queryClient.getQueryData<any[]>(["active-collaborators-combo"]);
          }

          if (!empList) {
             // Try strict match for collaborators page
             empList = queryClient.getQueryData<any[]>(["collaborators", { ativo: "true" }]);
          }

          // Fallback: Fetch from API
          if (!empList) {
             empList = await colaboradorApi.listColaboradores({ ativo: "true" });
          }
          
          if (!empList || empList.length === 0) {
              toast.error("Nenhum colaborador ativo encontrado para gerar dados.");
              setIsGenerating(false);
              return;
          }

          // 1. Filter only users with shifts (TURNOS)
          const validUsers = empList.filter((u: any) => u.turnos && u.turnos.length > 0);
          
          if (validUsers.length === 0) {
              toast.warning("Nenhum colaborador ativo possui turnos cadastrados para gerar dados.");
              setIsGenerating(false);
              return;
          }

          // 2. Gerar registros para cada um PARA CADA TURNO
          let scenarioCounter = 1;
          const promises = validUsers.flatMap((func: any) => {
              const turnos = func.turnos;

              return turnos.map((turno: any) => {
                  // Cycle scenarios 1 to 6
                  const scenario = scenarioCounter;
                  scenarioCounter = scenarioCounter >= 6 ? 1 : scenarioCounter + 1;

                  const payload = mockGenerator.timeRecord(func.id, format(date, "yyyy-MM-dd"), turno, scenario);
                  // Return promise coupled with user ID for counting later if needed, 
                  // but straightforward allSettled on the request is easier.
                  return apiClient.post("/pontos", payload).then(() => func.id); 
              });
          });

          // 3. Execution with allSettled (Partial Failure Handling)
          const results = await Promise.allSettled(promises);
          
          const successfulResult = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<any>[];
          const failureCount = results.filter(r => r.status === 'rejected').length;

          // Count unique users from successful requests
          const uniqueUserIds = new Set(successfulResult.map(r => r.value));

          // 4. Feedback
          if (successfulResult.length > 0) {
              const msg = `${successfulResult.length} registros de turno gerados para ${uniqueUserIds.size} colaboradores!`;
              
              if (failureCount > 0) {
                  toast.warning(`${msg} (${failureCount} falhas).`);
              } else {
                  toast.success(msg);
              }
          } else {
              if (failureCount > 0) {
                  toast.error("Falha ao gerar dados. Verifique o console.");
              }
          }

      } catch (error) {
          console.error("Erro ao gerar dados:", error);
          toast.error("Erro crítico ao gerar dados fakes.");
      } finally {
          setIsGenerating(false);
          // 5. Ensure Refetch ALWAYS updates the screen
          refetch();
      }
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
            onGenerateMockData={handleGenerateMockData}
            isGenerating={isGenerating}
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

        <ManualTimeRecordDialog 
            isOpen={isManualEntryOpen} 
            onClose={() => setIsManualEntryOpen(false)} 
        />

        {/* Global Action Loader */}
        <LoadingOverlay 
            active={isGenerating} 
            text="Gerando dados..." 
        />
        </div>
    </PullToRefreshWrapper>
  );
}
