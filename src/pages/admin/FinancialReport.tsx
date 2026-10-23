import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators, useFinancialReportViewModel } from "@/hooks";
import { useUrlState } from "@/hooks/ui/useUrlState";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import {
  FechamentoHeader,
  FechamentoGeralTab,
  FechamentoIndividualTab,
} from "@/components/features/financeiro/fechamento";
import { LayoutDashboard, User } from "lucide-react";

export function FinancialReport() {
  const { setPageTitle } = useLayout();
  const [, setSearchParams] = useSearchParams();
  const vm = useFinancialReportViewModel();
  const [activeTab, setActiveTab] = useUrlState<string>({
    key: "tab",
    defaultValue: "geral",
  });

  useEffect(() => {
    setPageTitle("Fechamento Financeiro");
  }, [setPageTitle]);

  const { data: collaboratorsResponse } = useCollaborators({});
  const collaborators = useMemo(() => {
    if (!collaboratorsResponse) return [];
    if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
    return (collaboratorsResponse as { data?: unknown[] }).data || [];
  }, [collaboratorsResponse]);

  const handleSelectColaborador = (colaboradorId: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("usuario", colaboradorId);
        newParams.set("tab", "detalhado");
        return newParams;
      },
      { replace: true },
    );
  };

  return (
    <div className="space-y-6 pb-24">
      <FechamentoHeader
        selectedMes={vm.filters.selectedMes}
        selectedAno={vm.filters.selectedAno}
        onMesChange={vm.setMonth}
        onAnoChange={vm.setYear}
      />

      {vm.canViewAll ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none]">
            <TabsTrigger
              value="geral"
              className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger
              value="detalhado"
              className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
            >
              <User className="h-4 w-4" />
              <span>Detalhamento Individual</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6 outline-none">
            <FechamentoGeralTab
              selectedMes={vm.filters.selectedMes}
              selectedAno={vm.filters.selectedAno}
              onSelectColaborador={handleSelectColaborador}
            />
          </TabsContent>

          <TabsContent value="detalhado" className="space-y-6 outline-none">
            <FechamentoIndividualTab
              collaborators={collaborators}
              selectedUsuario={vm.filters.selectedUsuario || "todos"}
              onSelectUsuario={(val) => vm.setUsuario(val)}
              usuarioId={vm.usuarioId}
              colaboradorNome={vm.colaboradorNome}
              selectedMonth={vm.filters.selectedMes}
              selectedYear={vm.filters.selectedAno}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <FinancialReportView
          usuarioId={vm.usuarioId}
          colaboradorNome={vm.colaboradorNome}
          selectedMonth={vm.filters.selectedMes}
          selectedYear={vm.filters.selectedAno}
        />
      )}
    </div>
  );
}

export default FinancialReport;
