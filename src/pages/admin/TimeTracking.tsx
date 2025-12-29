import { ManualTimeRecordDialog } from "@/components/dialogs/ManualTimeRecordDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { TimeTrackingList } from "@/components/features/timetracking/TimeTrackingList";
import { TimeTrackingToolbar } from "@/components/features/timetracking/TimeTrackingToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { FILTER_OPTIONS } from "@/constants/ponto";
import { useLayout } from "@/contexts/LayoutContext";
import { useActiveCollaborators, useClients } from "@/hooks";
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
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
  const [filters, setFilters] = useState({
      statusEntrada: FILTER_OPTIONS.TODOS,
      statusSaida: FILTER_OPTIONS.TODOS,
      usuarioId: FILTER_OPTIONS.TODOS
  });

  // Data Hooks - Active Collaborators for Filter
  const { data: activeCollaborators = [] } = useActiveCollaborators();

  const { data: clients = [] } = useClients(undefined, { staleTime: 0, refetchOnWindowFocus: true });

  // Data Hooks - Time Records
  const { data: records, isLoading, refetch } = useTimeRecords({
      date: format(date, "yyyy-MM-dd"),
      searchTerm,
      usuarioId: filters.usuarioId,
      statusEntrada: filters.statusEntrada,
      statusSaida: filters.statusSaida
  });

  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setPageTitle("Controle de Ponto");
  }, [setPageTitle]);

  const handleFiltersChange = (key: string, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
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

          // 2. Gerar registros para cada um PARA CADA TURNO
          let scenarioCounter = 1;
          const promises = empList.flatMap((func: any) => {
              // Se não tiver turnos, gera um padrão 08:00 - 18:00
              const turnos = func.turnos && func.turnos.length > 0 
                  ? func.turnos 
                  : [{ hora_inicio: "08:00:00", hora_fim: "18:00:00" }];

              return turnos.map((turno: any) => {
                  // Cycle scenarios 1 to 6
                  const scenario = scenarioCounter;
                  scenarioCounter = scenarioCounter >= 6 ? 1 : scenarioCounter + 1;

                  const payload = mockGenerator.timeRecord(func.id, format(date, "yyyy-MM-dd"), turno, scenario);
                  return apiClient.post("/pontos", payload);
              });
          });

          await Promise.all(promises);
          
          toast.success(`${empList.length} registros gerados com sucesso!`);
          refetch();
      } catch (error) {
          console.error("Erro ao gerar dados:", error);
          toast.error("Erro ao gerar dados fakes.");
      } finally {
          setIsGenerating(false);
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
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onGenerateMockData={handleGenerateMockData}
            isGenerating={isGenerating}
            onRegister={() => setIsManualEntryOpen(true)}
            collaborators={activeCollaborators}
            clients={clients}
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
