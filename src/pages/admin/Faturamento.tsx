import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout, useDateFilters } from "@/hooks";
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

  const [activeTab, setActiveTab] = useState<string>("faturas");

  return (
    <div className="space-y-6 pb-24">
      <FaturamentoHeader
        isLiquidacaoActive={activeTab === "liquidacao"}
        onToggleLiquidacao={() => setActiveTab(activeTab === "liquidacao" ? "faturas" : "liquidacao")}
        onOpenContasBancarias={openContasBancariasDialog}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none]">
          <TabsTrigger
            value="faturas"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <FileText className="h-4 w-4" />
            <span>Faturas dos Clientes</span>
          </TabsTrigger>
          <TabsTrigger
            value="despesas"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Receipt className="h-4 w-4" />
            <span>Contas a Pagar</span>
          </TabsTrigger>
          <TabsTrigger
            value="intercompany"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>Acerto Entre Nossas Empresas</span>
          </TabsTrigger>
          <TabsTrigger
            value="avulsas"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Banknote className="h-4 w-4" />
            <span>Movimentações Avulsas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="space-y-6 outline-none">
          <FaturasTab mes={mes} ano={ano} setMes={setMes} setAno={setAno} />
        </TabsContent>

        <TabsContent value="liquidacao" className="space-y-6 outline-none">
          <LiquidacaoLoteTab mes={mes} ano={ano} onVoltar={() => setActiveTab("faturas")} />
        </TabsContent>

        <TabsContent value="despesas" className="space-y-6 outline-none">
          <DespesasTab
            mes={mes}
            ano={ano}
            setMes={setMes}
            setAno={setAno}
            isActive={activeTab === "despesas"}
          />
        </TabsContent>

        <TabsContent value="intercompany" className="space-y-6 outline-none">
          <IntercompanyTab isActive={activeTab === "intercompany"} />
        </TabsContent>

        <TabsContent value="avulsas" className="space-y-6 outline-none">
          <MovimentacoesAvulsasTab
            mes={mes}
            ano={ano}
            setMes={setMes}
            setAno={setAno}
            isActive={activeTab === "avulsas"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
