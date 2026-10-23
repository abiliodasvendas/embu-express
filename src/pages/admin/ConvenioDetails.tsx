import { ConvenioAuditoriaSection } from "@/components/features/convenios/ConvenioAuditoriaSection";
import {
  ConvenioDetailsHeader,
  ConvenioDetailsKpis,
  ConvenioPeriodSelector,
  ConvenioPorColaboradorTab,
  ConvenioTodosLancamentosTab,
} from "@/components/features/convenios/details";
import { KpiGridSkeleton, ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useConvenioDetailsViewModel } from "@/hooks";
import { cn } from "@/lib/utils";
import { Plus, Receipt, Search, Wrench } from "lucide-react";

export default function ConvenioDetails() {
  const vm = useConvenioDetailsViewModel();

  if (vm.isConvenioLoading) {
    return (
      <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
        <div className="rounded-[24px] border border-border bg-card shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
            <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] bg-muted/70 shrink-0" />
            <div className="space-y-2 text-center sm:text-left">
              <Skeleton className="h-6 w-48 rounded-[8px] bg-muted/70" />
              <Skeleton className="h-4 w-32 rounded-[6px] bg-muted/50" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-[14px] bg-muted/60" />
            <Skeleton className="h-10 w-28 rounded-[14px] bg-muted/60" />
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card shadow-xs p-4 flex justify-between items-center">
          <Skeleton className="h-10 w-10 rounded-[12px] bg-muted/60" />
          <div className="space-y-1 flex flex-col items-center">
            <Skeleton className="h-3 w-28 rounded-[6px] bg-muted/50" />
            <Skeleton className="h-5 w-36 rounded-[8px] bg-muted/70" />
          </div>
          <Skeleton className="h-10 w-10 rounded-[12px] bg-muted/60" />
        </div>

        <KpiGridSkeleton count={3} cols={3} />

        <ListSkeleton showToolbar />
      </div>
    );
  }

  if (!vm.convenio) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="bg-destructive/10 p-4 rounded-[16px] text-destructive">
          <Wrench className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Convênio não encontrado
        </h2>
        <p className="text-muted-foreground max-w-xs text-sm">
          O convênio solicitado pode ter sido removido ou o identificador é inválido.
        </p>
        <Button
          onClick={() => vm.navigate("/convenios")}
          className="rounded-[18px] px-8 h-11 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold shadow-xs cursor-pointer"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
      <ConvenioDetailsHeader
        convenio={vm.convenio}
        canEdit={vm.canEdit}
        isCopied={vm.isCopied}
        onCopyLink={vm.handleCopyLink}
        onOpenLink={vm.handleOpenLink}
        onBack={() => vm.navigate("/convenios")}
        onEdit={vm.handleEditarConvenio}
        onToggleStatus={vm.handleToggleStatus}
      />

      <ConvenioPeriodSelector
        currentDate={vm.currentDate}
        onPrevMonth={vm.handlePrevMonth}
        onNextMonth={vm.handleNextMonth}
      />

      <ConvenioDetailsKpis
        stats={vm.stats}
        isLoading={vm.isLancamentosLoading}
      />

      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            Lançamentos do Período
          </h2>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {vm.activeTab !== "auditoria" && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Pesquisar..."
                  value={vm.searchQuery}
                  onChange={(e) => vm.setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-card border-border rounded-[18px] text-xs sm:text-sm placeholder:text-muted-foreground focus:bg-white focus:border-primary shadow-xs transition-all font-normal"
                />
              </div>
            )}

            <div className="flex bg-muted/50 p-1 rounded-[14px] border border-border/40 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => vm.setActiveTab("todos")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-all cursor-pointer",
                  vm.activeTab === "todos"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Todos os Lançamentos
              </button>
              <button
                type="button"
                onClick={() => vm.setActiveTab("colaboradores")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-all cursor-pointer",
                  vm.activeTab === "colaboradores"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Por Colaborador
              </button>
              <button
                type="button"
                onClick={() => vm.setActiveTab("auditoria")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-[10px] transition-all flex items-center gap-1.5 cursor-pointer",
                  vm.activeTab === "auditoria"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Receipt className="h-3.5 w-3.5" />
                Financeiro
                {vm.auditoria?.tem_risco_divergencia && (
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                )}
              </button>
            </div>

            {vm.canEdit && vm.activeTab !== "auditoria" && (
              <Button
                onClick={vm.handleOpenNovoLancamento}
                className="h-10 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-1.5 shadow-xs transition-all active:scale-95 text-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Novo Lançamento</span>
              </Button>
            )}
          </div>
        </div>

        {vm.isLancamentosLoading ? (
          <ListSkeleton count={4} />
        ) : vm.activeTab === "auditoria" ? (
          <ConvenioAuditoriaSection
            auditoria={vm.auditoria}
            isLoading={vm.isAuditoriaLoading}
            convenioId={vm.id!}
            convenioNome={vm.convenio.nome}
            mes={vm.mes}
            ano={vm.ano}
            canEdit={vm.canEdit}
            onOpenLiquidarDialog={vm.handleLiquidarFaturaAuditoria}
            onOpenLancamentoDialog={(l) => vm.handleEditarLancamento(l)}
          />
        ) : vm.activeTab === "colaboradores" ? (
          <ConvenioPorColaboradorTab
            groupedLancamentos={vm.groupedLancamentos}
            expandedGroups={vm.expandedGroups}
            onToggleGroup={vm.toggleGroup}
            canEdit={vm.canEdit}
            onEdit={vm.handleEditarLancamento}
            onDelete={vm.handleDeleteLancamento}
          />
        ) : (
          <ConvenioTodosLancamentosTab
            lancamentos={vm.filteredLancamentos}
            canEdit={vm.canEdit}
            onEdit={vm.handleEditarLancamento}
            onDelete={vm.handleDeleteLancamento}
          />
        )}
      </section>
    </div>
  );
}
