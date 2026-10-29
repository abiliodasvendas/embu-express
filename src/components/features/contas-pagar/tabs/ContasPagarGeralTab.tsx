import { useContasPagarViewModel } from "@/hooks/ui/contas-pagar/useContasPagarViewModel";
import { ContasPagarKpiCards } from "../ContasPagarKpiCards";
import { ContasPagarToolbar } from "../ContasPagarToolbar";
import { ContasPagarTable } from "../ContasPagarTable";

export function ContasPagarGeralTab() {
  const {
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    status,
    setStatus,
    busca,
    setBusca,
    tipoFiltro,
    setTipoFiltro,
    filtroPrazo,
    setFiltroPrazo,
    empresas,
    itens,
    kpis,
    isLoading,
    isFetching,
    refetch,
    handleLiquidarItem,
    handleNovaDespesa,
  } = useContasPagarViewModel();

  return (
    <div className="space-y-6">
      <ContasPagarKpiCards
        kpis={kpis}
        mes={mes}
        ano={ano}
        selectedFiltroPrazo={filtroPrazo}
        onSelectFiltroPrazo={setFiltroPrazo}
      />

      <ContasPagarToolbar
        busca={busca}
        onBuscaChange={setBusca}
        mes={mes}
        onMesChange={setMes}
        ano={ano}
        onAnoChange={setAno}
        empresaId={empresaId}
        onEmpresaChange={setEmpresaId}
        tipoFiltro={tipoFiltro}
        onTipoChange={setTipoFiltro}
        status={status}
        onStatusChange={setStatus}
        empresas={empresas}
        onNovaDespesa={handleNovaDespesa}
        onRefresh={refetch}
        isFetching={isFetching}
      />

      <ContasPagarTable
        itens={itens}
        isLoading={isLoading}
        onLiquidar={handleLiquidarItem}
        onNovaDespesa={handleNovaDespesa}
      />
    </div>
  );
}
