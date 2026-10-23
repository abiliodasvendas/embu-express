import { useFaturasTabViewModel } from "@/hooks/ui/faturamento";
import { FaturasKpis } from "../faturas/FaturasKpis";
import { AgingRecebiveisCard } from "../faturas/AgingRecebiveisCard";
import { FaturasToolbar } from "../faturas/FaturasToolbar";
import { FaturasTable } from "../faturas/FaturasTable";

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
      <FaturasKpis kpis={vm.kpis} mes={vm.mes} ano={vm.ano} />

      <AgingRecebiveisCard
        aging={vm.aging}
        selectedFaixa={vm.agingFaixaFiltro}
        onSelectFaixa={vm.setAgingFaixaFiltro}
      />

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
        onEdit={vm.handleEditFatura}
        onDelete={vm.handleDeleteFatura}
      />
    </div>
  );
}
