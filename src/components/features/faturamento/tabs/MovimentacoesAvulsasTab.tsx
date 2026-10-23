import { useMovimentacoesAvulsasTabViewModel } from "@/hooks/ui/faturamento";
import { AvulsasKpis } from "../avulsas/AvulsasKpis";
import { AvulsasToolbar } from "../avulsas/AvulsasToolbar";
import { AvulsasTable } from "../avulsas/AvulsasTable";

interface MovimentacoesAvulsasTabProps {
  mes: number;
  ano: number;
  setMes: (mes: number) => void;
  setAno: (ano: number) => void;
  isActive: boolean;
}

export function MovimentacoesAvulsasTab({
  mes,
  ano,
  setMes,
  setAno,
  isActive,
}: MovimentacoesAvulsasTabProps) {
  const vm = useMovimentacoesAvulsasTabViewModel({
    mes,
    ano,
    setMes,
    setAno,
    enabled: isActive,
  });

  return (
    <div className="space-y-6">
      <AvulsasKpis kpis={vm.kpisAvulsas} mes={vm.mes} ano={vm.ano} />

      <AvulsasToolbar
        searchMovimentacao={vm.searchMovimentacao}
        onSearchChange={vm.setSearchMovimentacao}
        mes={vm.mes}
        onMesChange={vm.setMes}
        ano={vm.ano}
        onAnoChange={vm.setAno}
        tipoMovimentacaoFiltro={vm.tipoMovimentacaoFiltro}
        onTipoMovimentacaoChange={vm.setTipoMovimentacaoFiltro}
        onNovoLancamento={vm.handleOpenNovaMovimentacao}
        canEdit={vm.canEdit}
      />

      <AvulsasTable
        movimentacoes={vm.movimentacoesOrdenadas}
        isLoading={vm.isLoadingMovimentacoes}
        isFetching={vm.isFetchingMovimentacoes}
        search={vm.searchMovimentacao}
        onClearSearch={() => vm.setSearchMovimentacao("")}
        onNovoLancamento={vm.handleOpenNovaMovimentacao}
        canEdit={vm.canEdit}
        sortKey={vm.sortKeyMovimentacoes}
        sortDirection={vm.sortDirMovimentacoes}
        onSort={vm.handleSortMovimentacoes}
        onEdit={vm.handleEditMovimentacao}
        onDelete={vm.handleDeleteMovimentacao}
      />
    </div>
  );
}
