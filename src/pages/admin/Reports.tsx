import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/components/ui/native-select";
import { FinanceiroTab } from "./relatorios/FinanceiroTab";
import { DreTab } from "./relatorios/DreTab";
import { FluxoCaixaTab } from "./relatorios/FluxoCaixaTab";
import { useLayout, useDateFilters } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Calendar, Wallet, BarChart3, TrendingUp } from "lucide-react";

export default function Reports() {
  const { setPageTitle } = useLayout();
  const { can, isAnyAdmin, isLoading: isLoadingPermissions } = usePermissions();

  const canViewDre = isAnyAdmin || can(PERMISSIONS.DRE.VER);
  const canViewFluxoCaixa = isAnyAdmin || can(PERMISSIONS.FLUXO_CAIXA.VER);

  useEffect(() => {
    setPageTitle("Relatórios");
  }, [setPageTitle]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const primeiraAbaDisponivel = useMemo(() => {
    if (canViewDre) return "dre";
    if (canViewFluxoCaixa) return "fluxo-caixa";
    return "financeiro";
  }, [canViewDre, canViewFluxoCaixa]);

  const [selectedTab, setSelectedTab] = useState<string>("dre");
  const [hasUserSelectedTab, setHasUserSelectedTab] = useState<boolean>(false);

  useEffect(() => {
    if (!hasUserSelectedTab && !isLoadingPermissions) {
      setSelectedTab(primeiraAbaDisponivel);
    }
  }, [primeiraAbaDisponivel, hasUserSelectedTab, isLoadingPermissions]);

  const { selectedMes: mes, setSelectedMes: setMes, selectedAno: ano, setSelectedAno: setAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const meses = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
      valor: m,
      label: new Date(2000, m - 1, 1).toLocaleString("pt-BR", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase()),
    }));
  }, []);

  const anos = useMemo(() => {
    const anosPossiveis = [];
    for (let a = anoAtual - 2; a <= anoAtual + 1; a++) {
      anosPossiveis.push(a);
    }
    return anosPossiveis;
  }, [anoAtual]);

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Relatórios Executivos
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Demonstrativo de resultados (DRE), fluxo de caixa operacional e fechamento gerencial
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
              Período Global
            </p>
            <p className="text-sm font-bold text-foreground leading-none">
              Ano e mês de referência
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <NativeSelect
            value={String(mes)}
            onChange={(e) => setMes(Number(e.target.value))}
            className="h-11 sm:w-36 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
          >
            {meses.map((m) => (
              <option key={m.valor} value={String(m.valor)}>
                {m.label}
              </option>
            ))}
          </NativeSelect>

          <NativeSelect
            value={String(ano)}
            onChange={(e) => setAno(Number(e.target.value))}
            className="h-11 w-24 sm:w-28 rounded-[18px] bg-background border-border text-xs sm:text-sm font-medium focus:border-primary shadow-xs"
          >
            {anos.map((a) => (
              <option key={a} value={String(a)}>
                {a}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <Tabs
        value={selectedTab}
        onValueChange={(val) => {
          setHasUserSelectedTab(true);
          setSelectedTab(val);
        }}
        className="w-full space-y-6"
      >
        <TabsList className="h-11 p-1 bg-muted/70 rounded-[18px] border border-border gap-1 w-full sm:w-auto inline-flex overflow-x-auto [scrollbar-width:none]">
          {canViewDre && (
            <TabsTrigger
              value="dre"
              className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Resultado Real do Mês (Lucro da Empresa)</span>
            </TabsTrigger>
          )}
          {canViewFluxoCaixa && (
            <TabsTrigger
              value="fluxo-caixa"
              className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Fluxo de Caixa Diário</span>
            </TabsTrigger>
          )}
          <TabsTrigger
            value="financeiro"
            className="rounded-[14px] px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-2 shrink-0"
          >
            <Wallet className="h-4 w-4" />
            <span>Folha de Pagamento</span>
          </TabsTrigger>
        </TabsList>

        {canViewDre && (
          <TabsContent value="dre" className="m-0">
            {selectedTab === "dre" && (
              <DreTab mes={mes} ano={ano} />
            )}
          </TabsContent>
        )}

        {canViewFluxoCaixa && (
          <TabsContent value="fluxo-caixa" className="m-0">
            {selectedTab === "fluxo-caixa" && (
              <FluxoCaixaTab mes={mes} ano={ano} />
            )}
          </TabsContent>
        )}

        <TabsContent value="financeiro" className="m-0">
          {selectedTab === "financeiro" && (
            <FinanceiroTab mes={mes} ano={ano} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
