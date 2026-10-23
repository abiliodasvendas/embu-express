import { ShieldCheck } from "lucide-react";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { useConveniosBloqueadosViewModel } from "@/hooks";
import {
  BloqueadosSkeleton,
  BloqueadosKpis,
  BloqueadosToolbar,
  BloqueadosMobileCard,
  BloqueadosTable,
  BloqueadosPagination,
} from "./bloqueados";

export function ConveniosBloqueadosTab() {
  const {
    convenios,
    searchTerm,
    setSearchTerm,
    filtroConvenio,
    setFiltroConvenio,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    paginados,
    filtrados,
    totalRestricoes,
    totalGeral,
    totalEspecifico,
    isLoading,
    handleAjustar,
    handleNavigateToColaborador,
    handleClearSearch,
  } = useConveniosBloqueadosViewModel();

  if (isLoading) {
    return <BloqueadosSkeleton />;
  }

  return (
    <div className="space-y-6">
      <BloqueadosKpis
        totalRestricoes={totalRestricoes}
        totalGeral={totalGeral}
        totalEspecifico={totalEspecifico}
      />

      <BloqueadosToolbar
        searchTerm={searchTerm}
        onSearchChange={(term) => {
          setSearchTerm(term);
          setPage(1);
        }}
        onClearSearch={handleClearSearch}
        filtroConvenio={filtroConvenio}
        onFiltroConvenioChange={(filtro) => {
          setFiltroConvenio(filtro);
          setPage(1);
        }}
        convenios={convenios}
      />

      {filtrados.length === 0 ? (
        <UnifiedEmptyState
          icon={ShieldCheck}
          title="Nenhuma restrição encontrada"
          description={
            searchTerm || filtroConvenio !== "TODOS"
              ? "Nenhum colaborador corresponde aos filtros selecionados."
              : "Nenhum colaborador possui bloqueio de convênio ativo no momento."
          }
        />
      ) : (
        <div className="space-y-4">
          <ResponsiveDataList
            data={paginados}
            mobileContainerClassName="space-y-3"
            mobileItemRenderer={(item) => (
              <BloqueadosMobileCard
                key={item.colaborador_id}
                item={item}
                onNavigateToColaborador={handleNavigateToColaborador}
                onAjustar={handleAjustar}
              />
            )}
          >
            <BloqueadosTable
              paginados={paginados}
              onNavigateToColaborador={handleNavigateToColaborador}
              onAjustar={handleAjustar}
            />
          </ResponsiveDataList>

          <BloqueadosPagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            total={total}
            totalPages={totalPages}
            paginadosLength={paginados.length}
          />
        </div>
      )}
    </div>
  );
}

export default ConveniosBloqueadosTab;
