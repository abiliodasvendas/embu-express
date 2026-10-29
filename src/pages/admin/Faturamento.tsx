import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout, useDateFilters } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import {
  FaturamentoHeader,
  FaturasTab,
  LiquidacaoLoteTab,
  IntercompanyTab,
  MovimentacoesAvulsasTab,
} from "@/components/features/faturamento";
import { FileText, ArrowRightLeft, ArrowDownRight } from "lucide-react";

export default function Faturamento() {
  const { setPageTitle } = useLayout();
  const { can, isSuperAdmin, isLoading: isLoadingPermissions } = usePermissions();

  const canViewFaturas = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.VER);
  const canEditFaturas = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.EDITAR);
  const canViewIntercompany = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.VER) || can(PERMISSIONS.DESPESAS.VER);
  const canViewAvulsas = isSuperAdmin || can(PERMISSIONS.MOVIMENTACOES_AVULSAS.VER);

  useEffect(() => {
    setPageTitle("Contas a Receber");
  }, [setPageTitle]);

  const {
    selectedMes: mes,
    setSelectedMes: setMes,
    selectedAno: ano,
    setSelectedAno: setAno,
  } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const primeiraAbaDisponivel = useMemo(() => {
    if (canViewFaturas) return "faturas";
    if (canViewIntercompany) return "intercompany";
    if (canViewAvulsas) return "avulsas";
    return "";
  }, [canViewFaturas, canViewIntercompany, canViewAvulsas]);

  const [activeTab, setActiveTab] = useState<string>("faturas");
  const [hasUserSelectedTab, setHasUserSelectedTab] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUserSelectedTab && !isLoadingPermissions && primeiraAbaDisponivel) {
      setActiveTab(primeiraAbaDisponivel);
    }
  }, [primeiraAbaDisponivel, hasUserSelectedTab, isLoadingPermissions]);

  const handleTabChange = (val: string) => {
    setHasUserSelectedTab(true);
    setActiveTab(val);
  };

  return (
    <div className="space-y-6 pb-24">
      <FaturamentoHeader
        isLiquidacaoActive={activeTab === "liquidacao"}
        onToggleLiquidacao={() => handleTabChange(activeTab === "liquidacao" ? "faturas" : "liquidacao")}
        canLiquidacao={canEditFaturas}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex items-center overflow-x-auto [scrollbar-width:none]">
          {canViewFaturas && (
            <TabsTrigger value="faturas">
              <FileText className="h-4 w-4" />
              <span>Faturas dos Clientes</span>
            </TabsTrigger>
          )}
          {canViewIntercompany && (
            <TabsTrigger value="intercompany">
              <ArrowRightLeft className="h-4 w-4" />
              <span>Acerto Entre Nossas Empresas</span>
            </TabsTrigger>
          )}
          {canViewAvulsas && (
            <TabsTrigger value="avulsas">
              <ArrowDownRight className="h-4 w-4 text-emerald-600" />
              <span>Entradas Avulsas</span>
            </TabsTrigger>
          )}
        </TabsList>

        {canViewFaturas && (
          <TabsContent value="faturas" className="space-y-6 outline-none">
            <FaturasTab mes={mes} ano={ano} setMes={setMes} setAno={setAno} />
          </TabsContent>
        )}

        {canEditFaturas && (
          <TabsContent value="liquidacao" className="space-y-6 outline-none">
            <LiquidacaoLoteTab mes={mes} ano={ano} onVoltar={() => handleTabChange("faturas")} />
          </TabsContent>
        )}

        {canViewIntercompany && (
          <TabsContent value="intercompany" className="space-y-6 outline-none">
            <IntercompanyTab isActive={activeTab === "intercompany"} />
          </TabsContent>
        )}

        {canViewAvulsas && (
          <TabsContent value="avulsas" className="space-y-6 outline-none">
            <MovimentacoesAvulsasTab
              mes={mes}
              ano={ano}
              setMes={setMes}
              setAno={setAno}
              isActive={activeTab === "avulsas"}
              modo="ENTRADA"
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
