import { useIntercompanyTabViewModel } from "@/hooks/ui/faturamento";
import { IntercompanyMatrizSaldos } from "../intercompany/IntercompanyMatrizSaldos";
import { IntercompanyTable } from "../intercompany/IntercompanyTable";

interface IntercompanyTabProps {
  isActive: boolean;
}

export function IntercompanyTab({ isActive }: IntercompanyTabProps) {
  const vm = useIntercompanyTabViewModel({ enabled: isActive });

  return (
    <div className="space-y-6">
      <IntercompanyMatrizSaldos
        matrizSaldos={vm.matrizSaldos}
        isLoading={vm.isLoadingMatriz}
      />

      <IntercompanyTable
        transferencias={vm.transferenciasOrdenadas}
        isLoading={vm.isLoadingTransferencias}
        isFetching={vm.isFetchingIntercompany}
        search={vm.searchIntercompany}
        onSearchChange={vm.setSearchIntercompany}
        onClearSearch={() => vm.setSearchIntercompany("")}
        sortKey={vm.sortKeyIntercompany}
        sortDirection={vm.sortDirIntercompany}
        onSort={vm.handleSortIntercompany}
        onRegistrarAcerto={vm.handleOpenAcerto}
        canEdit={vm.canEdit}
      />
    </div>
  );
}
