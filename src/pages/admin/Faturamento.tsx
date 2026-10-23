import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout, useDateFilters } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import {
  FaturamentoHeader,
  FaturasTab,
  LiquidacaoLoteTab,
  DespesasTab,
  IntercompanyTab,
  MovimentacoesAvulsasTab,
} from "@/components/features/faturamento";
import { FileText, Receipt, ArrowRightLeft, Banknote } from "lucide-react";

export default function Faturamento() {
  const { setPageTitle, openContasBancariasDialog } = useLayout();
  const { can, isSuperAdmin, isLoading: isLoadingPermissions } = usePermissions();

  const canViewFaturas = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.VER);
  const canEditFaturas = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.EDITAR);
  const canViewDespesas = isSuperAdmin || can(PERMISSIONS.DESPESAS.VER);
  const canViewIntercompany = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.VER) || can(PERMISSIONS.DESPESAS.VER);
  const canViewAvulsas = isSuperAdmin || can(PERMISSIONS.MOVIMENTACOES_AVULSAS.VER);
  const canViewContasBancarias = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.EDITAR) || can(PERMISSIONS.DESPESAS.EDITAR) || can(PERMISSIONS.EMPRESAS.EDITAR);

  useEffect(() => {
    setPageTitle("Faturamento & Contas a Receber");
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
    if (canViewDespesas) return "despesas";
    if (canViewIntercompany) return "intercompany";
    if (canViewAvulsas) return "avulsas";
    return "";
  }, [canViewFaturas, canViewDespesas, canViewIntercompany, canViewAvulsas]);

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
        onOpenContasBancarias={openContasBancariasDialog}
        canLiquidacao={canEditFaturas}
        canContasBancarias={canViewContasBancarias}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex items-center overflow-x-auto [scrollbar-width:none]">
          {canViewFaturas && (
            <TabsTrigger value="faturas">
              <FileText className="h-4 w-4" />
              <span>Faturas dos Clientes</span>
            </TabsTrigger>
          )}
          {canViewDespesas && (
            <TabsTrigger value="despesas">
              <Receipt className="h-4 w-4" />
              <span>Contas a Pagar</span>
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
              <Banknote className="h-4 w-4" />
              <span>Movimentações Avulsas</span>
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

        {canViewDespesas && (
          <TabsContent value="despesas" className="space-y-6 outline-none">
            <DespesasTab
              mes={mes}
              ano={ano}
              setMes={setMes}
              setAno={setAno}
              isActive={activeTab === "despesas"}
            />
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
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
