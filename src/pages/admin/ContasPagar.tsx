import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout, useDateFilters } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { ContasPagarHeader } from "@/components/features/contas-pagar/ContasPagarHeader";
import { ContasPagarGeralTab } from "@/components/features/contas-pagar/tabs/ContasPagarGeralTab";
import { LiquidacaoLotePagamentoTab } from "@/components/features/contas-pagar/tabs/LiquidacaoLotePagamentoTab";
import { MovimentacoesAvulsasTab } from "@/components/features/faturamento";
import { CreditCard, ArrowUpRight } from "lucide-react";

export default function ContasPagar() {
  const { setPageTitle } = useLayout();
  const { can, isSuperAdmin } = usePermissions();
  const [activeTab, setActiveTab] = useState<string>("geral");

  const canEdit = isSuperAdmin || can(PERMISSIONS.DESPESAS.EDITAR);
  const canViewAvulsas = isSuperAdmin || can(PERMISSIONS.MOVIMENTACOES_AVULSAS.VER);

  useEffect(() => {
    setPageTitle("Contas a Pagar");
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

  return (
    <div className="space-y-6 pb-24">
      <ContasPagarHeader
        isLiquidacaoActive={activeTab === "lote"}
        onToggleLiquidacao={() => setActiveTab(activeTab === "lote" ? "geral" : "lote")}
        canLiquidacao={canEdit}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex items-center overflow-x-auto [scrollbar-width:none]">
          <TabsTrigger value="geral">
            <CreditCard className="h-4 w-4" />
            <span>Despesas e Convênios</span>
          </TabsTrigger>
          {canViewAvulsas && (
            <TabsTrigger value="saidas">
              <ArrowUpRight className="h-4 w-4 text-rose-600" />
              <span>Saídas Avulsas</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="geral" className="space-y-6 outline-none">
          <ContasPagarGeralTab />
        </TabsContent>

        {canViewAvulsas && (
          <TabsContent value="saidas" className="space-y-6 outline-none">
            <MovimentacoesAvulsasTab
              mes={mes}
              ano={ano}
              setMes={setMes}
              setAno={setAno}
              isActive={activeTab === "saidas"}
              modo="SAIDA"
            />
          </TabsContent>
        )}

        {canEdit && (
          <TabsContent value="lote" className="space-y-6 outline-none">
            <LiquidacaoLotePagamentoTab onVoltar={() => setActiveTab("geral")} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
