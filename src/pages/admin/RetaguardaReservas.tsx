import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bike, ShieldAlert } from "lucide-react";
import { useRetaguardaReservasViewModel } from "@/hooks";
import {
  RetaguardaHeader,
  RetaguardaKpiCards,
  RetaguardaDesempenhoTable,
  RetaguardaRiscoValesTable,
} from "@/components/features/retaguarda";

export default function RetaguardaReservas() {
  const {
    mes,
    setMes,
    ano,
    setAno,
    anoAtual,
    canAlocar,
    activeTab,
    setActiveTab,
    filtroVales,
    setFiltroVales,
    totais,
    itens,
    alertas,
    alertasFiltrados,
    pendentesEmRisco,
    totalConfirmados,
    isLoadingMonitor,
    isLoadingAlertas,
    handleRegistrarCobertura,
  } = useRetaguardaReservasViewModel();

  return (
    <div className="space-y-6 pb-24">
      <RetaguardaHeader
        mes={mes}
        setMes={setMes}
        ano={ano}
        setAno={setAno}
        anoAtual={anoAtual}
        canAlocar={canAlocar}
        onRegistrarCobertura={handleRegistrarCobertura}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none]">
          <TabsTrigger
            value="monitor"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Bike className="h-4 w-4" />
            <span>Retaguarda (Equipe Interna)</span>
          </TabsTrigger>
          <TabsTrigger
            value="risco-vales"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Alerta de Vales Dia 20</span>
            {pendentesEmRisco.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-muted/80 text-foreground border border-border text-[10px] rounded-full font-bold">
                {pendentesEmRisco.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6 outline-none">
          <RetaguardaKpiCards
            totais={totais}
            totalItens={itens.length}
            isLoading={isLoadingMonitor}
          />

          <RetaguardaDesempenhoTable
            itens={itens}
            isLoading={isLoadingMonitor}
          />
        </TabsContent>

        <TabsContent value="risco-vales" className="space-y-6 outline-none">
          <RetaguardaRiscoValesTable
            alertas={alertas}
            alertasFiltrados={alertasFiltrados}
            filtroVales={filtroVales}
            setFiltroVales={setFiltroVales}
            pendentesEmRisco={pendentesEmRisco}
            totalConfirmados={totalConfirmados}
            isLoading={isLoadingAlertas}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
