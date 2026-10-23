import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton, KpiGridSkeleton } from "@/components/skeletons";
import { Banner } from "@/components/ui/Banner";
import { AlertTriangle } from "lucide-react";
import { useConvenioPublicPortalViewModel } from "@/hooks/ui/convenios";
import {
  PortalHeader,
  PortalPeriodSelector,
  PortalKpis,
  PortalTabsNav,
  PortalRecentesTab,
  PortalColaboradoresTab,
  PortalBloqueadosTab,
  PortalBottomBar,
  PortalDeleteDialog,
  LancamentoForm,
} from "@/components/features/convenios/public";

export function ConvenioPublicPortal() {
  const {
    token,
    ano,
    currentMonthName,
    convenio,
    isLoadingConvenio,
    isConvenioError,
    lancamentos,
    isLoadingLancamentos,
    isLoadingCollabs,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroup,
    filteredLancamentos,
    groupedLancamentos,
    bloqueados,
    filteredBloqueados,
    totalValue,
    isFormOpen,
    setIsFormOpen,
    selectedLancamento,
    deleteTarget,
    setDeleteTarget,
    isDeleting,
    handlePrevMonth,
    handleNextMonth,
    handleNewLancamento,
    handleEdit,
    handleDeleteClick,
    confirmDelete,
    formatCurrency,
    formatLocalDate,
  } = useConvenioPublicPortalViewModel();

  if (isLoadingConvenio) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col pb-28 sm:pb-24">
        <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-[14px] bg-muted/70 shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24 rounded-[6px] bg-muted/50" />
                <Skeleton className="h-4 w-36 rounded-[6px] bg-muted/70" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-[14px] bg-muted/50" />
          </div>
        </header>
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto space-y-5">
          <Skeleton className="h-16 rounded-[24px] bg-card border border-border" />
          <KpiGridSkeleton count={2} cols={2} />
          <ListSkeleton showToolbar />
        </main>
      </div>
    );
  }

  if (isConvenioError || !convenio) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md border border-border shadow-xs rounded-[24px] bg-card text-center p-8">
          <div className="mx-auto w-12 h-12 rounded-[16px] bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            Acesso Indisponível
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-2 leading-relaxed">
            O link de convênio utilizado é inválido, expirou ou foi desativado pelo administrador. Verifique as credenciais ou solicite um novo link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col pb-28 sm:pb-24">
      <PortalHeader nome={convenio.nome} ativo={convenio.ativo} />

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-2xl w-full mx-auto space-y-5">
        {!convenio.ativo && (
          <Banner
            variant="warning"
            title="Visualização de Histórico"
            description="Este convênio está desativado pelo administrador. Novos lançamentos estão indisponíveis, mas você pode consultar o histórico."
          />
        )}

        <PortalPeriodSelector
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          monthName={currentMonthName}
          ano={ano}
        />

        <PortalKpis
          isLoading={isLoadingLancamentos}
          totalValueFormatted={formatCurrency(totalValue)}
          lancamentosCount={lancamentos.length}
        />

        <div className="space-y-4">
          <PortalTabsNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            bloqueadosCount={bloqueados.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {activeTab === "bloqueados" ? (
            <PortalBloqueadosTab
              isLoading={isLoadingCollabs}
              bloqueados={filteredBloqueados}
              searchQuery={searchQuery}
            />
          ) : activeTab === "colaboradores" ? (
            <PortalColaboradoresTab
              isLoading={isLoadingLancamentos}
              groups={groupedLancamentos}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              isConvenioAtivo={convenio.ativo}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              formatCurrency={formatCurrency}
              formatLocalDate={formatLocalDate}
            />
          ) : (
            <PortalRecentesTab
              isLoading={isLoadingLancamentos}
              lancamentos={filteredLancamentos}
              isConvenioAtivo={convenio.ativo}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              formatCurrency={formatCurrency}
              formatLocalDate={formatLocalDate}
            />
          )}
        </div>
      </main>

      {convenio.ativo && <PortalBottomBar onNewLancamento={handleNewLancamento} />}

      <LancamentoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        token={token}
        lancamentoToEdit={selectedLancamento}
      />

      <PortalDeleteDialog
        deleteTarget={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

export default ConvenioPublicPortal;
