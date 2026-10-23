import { ConveniosViewModel } from "@/hooks/ui/convenios";
import { ConveniosKpis } from "../ConveniosKpis";
import { ConveniosTable } from "../ConveniosTable";
import { ConveniosToolbar } from "../ConveniosToolbar";

interface ConveniosParceirosTabProps {
  vm: ConveniosViewModel;
}

export function ConveniosParceirosTab({ vm }: ConveniosParceirosTabProps) {
  return (
    <div className="space-y-6">
      <ConveniosKpis
        totais={vm.totais}
        isLoading={vm.isInitialResumoLoading}
      />

      <ConveniosToolbar
        searchTerm={vm.searchTerm}
        onSearchChange={(term) => {
          vm.setSearchTerm(term);
          vm.setPage(1);
        }}
        selectedStatus={vm.selectedStatus}
        onStatusChange={(status) => {
          vm.setSelectedStatus(status);
          vm.setPage(1);
        }}
        hasAnyFilter={vm.hasAnyFilter}
        activeFiltersCount={vm.activeFiltersCount}
        onClearFilters={vm.handleClearFilters}
        isDrawerOpen={vm.isDrawerOpen}
        onDrawerOpenChange={vm.setIsDrawerOpen}
        mobileStatus={vm.mobileStatus}
        onMobileStatusChange={vm.setMobileStatus}
        onApplyMobile={vm.handleApplyMobile}
      />

      <ConveniosTable
        paginatedConvenios={vm.paginatedConvenios}
        filteredConvenios={vm.filteredConvenios}
        resumoMap={vm.resumoMap}
        isInitialLoading={vm.isInitialLoading}
        isFetching={vm.isFetching}
        isResumoFetching={vm.isResumoFetching}
        searchTerm={vm.searchTerm}
        canEdit={vm.canEdit}
        total={vm.total}
        totalPages={vm.totalPages}
        page={vm.page}
        pageSize={vm.pageSize}
        onPageChange={vm.setPage}
        onPageSizeChange={vm.setPageSize}
        onRegister={vm.handleRegister}
        getConvenioActions={vm.getConvenioActions}
        onLiquidarFatura={vm.handleLiquidarFatura}
      />
    </div>
  );
}
