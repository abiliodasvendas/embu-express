import { useFaturasTabViewModel } from "@/hooks/ui/faturamento";
import { FaturasKpis } from "../faturas/FaturasKpis";
import { AgingRecebiveisCard } from "../faturas/AgingRecebiveisCard";
import { FaturasToolbar } from "../faturas/FaturasToolbar";
import { FaturasTable } from "../faturas/FaturasTable";
import { FaturasBatchActionBar } from "../faturas/FaturasBatchActionBar";

interface FaturasTabProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
}

export function FaturasTab({ mes, ano, setMes, setAno }: FaturasTabProps) {
  const vm = useFaturasTabViewModel({ mes, ano, setMes, setAno });

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FaturasKpis
          kpis={vm.kpis}
          mes={vm.mes}
          ano={vm.ano}
          isLoading={vm.isLoadingFaturas || vm.isFetchingFaturas}
        />

        <AgingRecebiveisCard
          aging={vm.aging}
          selectedFaixa={vm.agingFaixaFiltro}
          onSelectFaixa={vm.setAgingFaixaFiltro}
          isLoading={vm.isLoadingAging || vm.isFetchingAging}
        />
      </div>

      <FaturasToolbar
        searchFatura={vm.searchFatura}
        onSearchChange={vm.setSearchFatura}
        mes={vm.mes}
        onMesChange={vm.setMes}
        ano={vm.ano}
        onAnoChange={vm.setAno}
        empresaFaturaFiltro={vm.empresaFaturaFiltro}
        onEmpresaChange={vm.setEmpresaFaturaFiltro}
        periodoFiltro={vm.periodoFiltro}
        onPeriodoChange={vm.setPeriodoFiltro}
        statusFiltro={vm.statusFiltro}
        onStatusChange={vm.setStatusFiltro}
        empresasList={vm.empresasList}
        onNovaFatura={vm.handleOpenNovaFatura}
        canEdit={vm.canEdit}
        agingFaixaFiltro={vm.agingFaixaFiltro}
        agingFaixaDescricao={
          vm.aging?.faixas.find((item) => item.faixa === vm.agingFaixaFiltro)?.descricao
        }
        totalExibidas={vm.faturasExibidas.length}
        onClearAgingFaixa={() => vm.setAgingFaixaFiltro(null)}
      />

      <FaturasTable
        faturas={vm.faturasOrdenadas}
        isLoading={vm.isLoadingFaturas}
        isFetching={vm.isFetchingFaturas}
        search={vm.searchFatura}
        onClearSearch={() => vm.setSearchFatura("")}
        onNovaFatura={vm.handleOpenNovaFatura}
        canEdit={vm.canEdit}
        sortKey={vm.sortKeyFaturas}
        sortDirection={vm.sortDirFaturas}
        onSort={vm.handleSortFaturas}
        onLiquidar={vm.handleLiquidarFatura}
        onDesfazerLiquidacao={vm.handleDesfazerLiquidacaoFatura}
        onEdit={vm.handleEditFatura}
        onDelete={vm.handleDeleteFatura}
        selectedIds={vm.selectedIds}
        isAllSelected={vm.isAllSelected}
        isSomeSelected={vm.isSomeSelected}
        onToggleSelectAll={vm.handleToggleSelectAll}
        onToggleSelect={vm.handleToggleSelect}
      />

      <FaturasBatchActionBar
        selectedCount={vm.selectedCount}
        isCanceling={vm.isCanceling}
        onCancelarSelecionadas={vm.handleCancelarLote}
        onClearSelection={vm.handleClearSelection}
      />
    </div>
  );
}
