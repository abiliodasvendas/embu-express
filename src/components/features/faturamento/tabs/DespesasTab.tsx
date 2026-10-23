import { useDespesasTabViewModel } from "@/hooks/ui/faturamento";
import { DespesasKpis } from "../despesas/DespesasKpis";
import { DespesasToolbar } from "../despesas/DespesasToolbar";
import { DespesasTable } from "../despesas/DespesasTable";

interface DespesasTabProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  isActive: boolean;
}

export function DespesasTab({
  mes,
  ano,
  setMes,
  setAno,
  isActive,
}: DespesasTabProps) {
  const vm = useDespesasTabViewModel({
    mes,
    ano,
    setMes,
    setAno,
    enabled: isActive,
  });

  return (
    <div className="space-y-6">
      <DespesasKpis kpis={vm.kpisDespesas} mes={vm.mes} ano={vm.ano} />

      <DespesasToolbar
        searchDespesa={vm.searchDespesa}
        onSearchChange={vm.setSearchDespesa}
        mes={vm.mes}
        onMesChange={vm.setMes}
        ano={vm.ano}
        onAnoChange={vm.setAno}
        empresaDespesaFiltro={vm.empresaDespesaFiltro}
        onEmpresaChange={vm.setEmpresaDespesaFiltro}
        categoriaDespesaFiltro={vm.categoriaDespesaFiltro}
        onCategoriaChange={vm.setCategoriaDespesaFiltro}
        statusDespesaFiltro={vm.statusDespesaFiltro}
        onStatusChange={vm.setStatusDespesaFiltro}
        empresasList={vm.empresasList}
        onNovaDespesa={vm.handleOpenNovaDespesa}
        canEdit={vm.canEdit}
      />

      <DespesasTable
        despesas={vm.despesasOrdenadas}
        isLoading={vm.isLoadingDespesas}
        isFetching={vm.isFetchingDespesas}
        search={vm.searchDespesa}
        onClearSearch={() => vm.setSearchDespesa("")}
        onNovaDespesa={vm.handleOpenNovaDespesa}
        canEdit={vm.canEdit}
        sortKey={vm.sortKeyDespesas}
        sortDirection={vm.sortDirDespesas}
        onSort={vm.handleSortDespesas}
        onLiquidar={vm.handleLiquidarDespesa}
        onEdit={vm.handleEditDespesa}
        onDelete={vm.handleDeleteDespesa}
      />
    </div>
  );
}
