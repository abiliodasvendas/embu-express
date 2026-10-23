import { lazy, Suspense } from "react";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { NativeSelect } from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConveniosViewModel } from "@/hooks";
import {
  ConveniosHeader,
  ConveniosParceirosTab,
} from "@/components/features/convenios";

const ConveniosRelatoriosTab = lazy(
  () => import("@/components/features/convenios/ConveniosRelatoriosTab")
);
const ConveniosBloqueadosTab = lazy(
  () => import("@/components/features/convenios/ConveniosBloqueadosTab")
);

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function Convenios() {
  const vm = useConveniosViewModel();

  return (
    <>
      <PullToRefreshWrapper onRefresh={vm.pullToRefreshReload}>
        <div className="space-y-6 w-full animate-in fade-in duration-300 pb-12">
          <ConveniosHeader canEdit={vm.canEdit} onRegister={vm.handleRegister} />

          {(vm.isFetching || vm.isResumoFetching) &&
            !vm.isLoading &&
            !vm.isResumoLoading && (
              <div className="w-full bg-surface-alt h-1 overflow-hidden rounded-full">
                <div className="bg-primary h-full w-full animate-indeterminate rounded-full" />
              </div>
            )}

          <Tabs defaultValue="parceiros" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none]">
                <TabsTrigger
                  value="parceiros"
                  className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                >
                  Parceiros
                </TabsTrigger>
                <TabsTrigger
                  value="relatorios"
                  className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
                >
                  Relatórios
                </TabsTrigger>
                <TabsTrigger
                  value="bloqueados"
                  className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 shrink-0"
                >
                  <span>Bloqueados</span>
                  {vm.totalColaboradoresBloqueados > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-muted text-foreground border border-border">
                      {vm.totalColaboradoresBloqueados}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <NativeSelect
                  value={String(vm.mes)}
                  onChange={(e) => vm.setMes(Number(e.target.value))}
                  className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold flex-1 sm:w-36"
                >
                  {MESES.map((m) => (
                    <option key={m.value} value={String(m.value)}>
                      {m.label}
                    </option>
                  ))}
                </NativeSelect>

                <NativeSelect
                  value={String(vm.ano)}
                  onChange={(e) => vm.setAno(Number(e.target.value))}
                  className="h-11 rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold w-24 shrink-0"
                >
                  {[2024, 2025, 2026, 2027].map((a) => (
                    <option key={a} value={String(a)}>
                      {a}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <TabsContent value="parceiros" className="space-y-6 mt-0">
              <ConveniosParceirosTab vm={vm} />
            </TabsContent>

            <TabsContent value="relatorios" className="mt-0">
              <Suspense fallback={<ListSkeleton />}>
                <ConveniosRelatoriosTab mes={vm.mes} ano={vm.ano} />
              </Suspense>
            </TabsContent>

            <TabsContent value="bloqueados" className="mt-0">
              <Suspense fallback={<ListSkeleton />}>
                <ConveniosBloqueadosTab />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={vm.isActionLoading} text="Processando..." />
    </>
  );
}

export default Convenios;
