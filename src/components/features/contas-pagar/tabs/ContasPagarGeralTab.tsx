import { useContasPagarViewModel } from "@/hooks/ui/contas-pagar/useContasPagarViewModel";
import { ContasPagarKpiCards } from "../ContasPagarKpiCards";
import { ContasPagarToolbar } from "../ContasPagarToolbar";
import { ContasPagarStatusPills } from "../ContasPagarStatusPills";
import { ContasPagarTable } from "../ContasPagarTable";

export function ContasPagarGeralTab() {
  const {
    mes,
    setMes,
    ano,
    setAno,
    empresaId,
    setEmpresaId,
    busca,
    setBusca,
    tipoFiltro,
    setTipoFiltro,
    filtroAtivo,
    setFiltroAtivo,
    contadores,
    empresas,
    itens,
    kpis,
    isLoading,
    isFetching,
    refetch,
    handleLiquidarItem,
    handleDesfazerLiquidacaoItem,
    handleDispensarValeItem,
    handleEditItem,
    handleDeleteItem,
    handleNovaDespesa,
  } = useContasPagarViewModel();

  return (
    <div className="space-y-5">
      <ContasPagarKpiCards
        kpis={kpis}
        contadores={contadores}
        mes={mes}
        ano={ano}
        filtroAtivo={filtroAtivo}
        onSelectFiltro={setFiltroAtivo}
        isLoading={isLoading || isFetching}
      />

      <div className="space-y-3">
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
          empresas={empresas}
          onNovaDespesa={handleNovaDespesa}
          onRefresh={refetch}
          isFetching={isFetching}
        />

        <ContasPagarStatusPills
          filtroAtivo={filtroAtivo}
          onSelectFiltro={setFiltroAtivo}
          contadores={contadores}
          isLoading={isLoading || isFetching}
        />
      </div>

      <ContasPagarTable
        itens={itens}
        isLoading={isLoading || isFetching}
        onLiquidar={handleLiquidarItem}
        onDesfazerLiquidacao={handleDesfazerLiquidacaoItem}
        onDispensarVale={handleDispensarValeItem}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onNovaDespesa={handleNovaDespesa}
      />
    </div>
  );
}
