import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import { useDRE } from "@/hooks/api/useDRE";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { cn } from "@/lib/utils";
import { TrendingUp, DollarSign, Wrench, Percent, AlertCircle, Building2, Plus } from "lucide-react";

interface DreTabProps {
  mes: number;
  ano: number;
}

export function DreTab({ mes, ano }: DreTabProps) {
  const { openDespesaFormDialog } = useLayout();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("todas");
  const [modoVisao, setModoVisao] = useState<"realizado" | "projetado">("projetado");
  const empresaIdNumber = selectedEmpresaId === "todas" ? undefined : Number(selectedEmpresaId);

  const { data: empresas = [] } = useEmpresas();
  const { data: dre, isLoading, isError, refetch } = useDRE(mes, ano, empresaIdNumber, modoVisao);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  };

  const formatarPercentual = (valor: number) => {
    return `${(valor || 0).toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="w-10 h-10 rounded-[14px] shrink-0" />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <Skeleton className="h-3.5 w-24 rounded-[6px]" />
                  <Skeleton className="h-6 w-32 rounded-[8px]" />
                  <Skeleton className="h-3 w-28 rounded-[6px]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !dre) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-[18px] bg-card border-border">
        <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
        <p className="font-semibold text-sm text-foreground">Erro ao carregar o DRE da competência selecionada.</p>
      </div>
    );
  }

  const isPositivo = (dre.lucro_liquido || 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider leading-none mb-1">
              Visão Societária
            </p>
            <p className="text-sm font-bold text-foreground leading-none">
              {dre.empresa_nome}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center p-1 bg-muted/60 rounded-[14px] border border-border shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-[10px] text-xs font-semibold transition-all ${
                modoVisao === "realizado"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setModoVisao("realizado")}
            >
              Realizado (Efetivo)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-3 rounded-[10px] text-xs font-semibold transition-all ${
                modoVisao === "projetado"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setModoVisao("projetado")}
            >
              Projetado (Previsto)
            </Button>
          </div>

          <div className="w-full sm:w-56">
            <NativeSelect
              value={selectedEmpresaId}
              onChange={(e) => setSelectedEmpresaId(e.target.value)}
              className="h-10 rounded-[14px] bg-background border-border text-xs font-medium focus:border-primary shadow-xs"
            >
              <option value="todas">Consolidado (Holding - 4 CNPJs)</option>
              {empresas.map((emp) => (
                <option key={emp.id} value={String(emp.id)}>
                  {emp.nome_fantasia} {emp.codigo ? `(${emp.codigo})` : ""}
                </option>
              ))}
            </NativeSelect>
          </div>

          <Button
            onClick={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
            className="h-10 px-3.5 gap-1.5 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[14px] shadow-xs text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            <span>Lançar Despesa</span>
          </Button>
        </div>
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Total Faturado</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(dre.faturamento_bruto)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {modoVisao === "realizado" ? "Medições & Faturas Efetivas" : "Projeção Contratual Plena"}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Custo de Pessoal</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(dre.custos_diretos.custo_pessoal_folha)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate font-medium">
                {modoVisao === "realizado" ? "Folha Liquidada & Vales Pagos" : "Estimativa da Folha (Teto Aberto)"}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Wrench className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Frota Própria</p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatarMoeda(dre.custos_diretos.manutencao_frota_propria)}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 truncate">
                {modoVisao === "realizado" ? "Manutenção e Combustível Liquidado" : "Manutenção e Combustível Próprio"}
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div
              className={cn(
                "w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0",
                isPositivo
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400"
              )}
            >
              <Percent className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {modoVisao === "realizado"
                  ? (isPositivo ? "Lucro Líquido Real" : "Prejuízo Real no Período")
                  : (isPositivo ? "Lucro Líquido Projetado" : "Prejuízo Projetado")}
              </p>
              <h2
                className={cn(
                  "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                  isPositivo
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {formatarMoeda(dre.lucro_liquido)}
              </h2>
              <p
                className={cn(
                  "text-[11px] font-semibold mt-1 truncate",
                  isPositivo
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card className="rounded-[20px] sm:rounded-[24px] border border-border shadow-xs overflow-hidden bg-card">
        <CardHeader className="border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <CardTitle className="text-xs font-bold tracking-wider text-foreground uppercase">
              {modoVisao === "realizado"
                ? "Resultado Real do Mês (Lucro Efetivo da Empresa)"
                : "Resultado Projetado do Mês (Orçamento da Empresa)"}
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {modoVisao === "realizado"
                ? "Valores efetivamente faturados e despesas pagas até o momento"
                : "Estimativa plena baseada nos contratos ativos e despesas fixas da competência"}
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border text-xs sm:text-sm">
            <div className="flex justify-between items-center px-6 py-3.5 bg-muted/20 font-bold text-foreground">
              <span>(+) TOTAL COBRADO DOS CLIENTES (FATURAMENTO)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatarMoeda(dre.faturamento_bruto)}</span>
            </div>

            {dre.outras_receitas_operacionais > 0 && (
              <div className="flex justify-between items-center px-6 py-2.5 bg-muted/10 font-medium text-foreground text-xs">
                <span>(+) OUTRAS RECEITAS OPERACIONAIS (Lançamentos Avulsos)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{formatarMoeda(dre.outras_receitas_operacionais)}</span>
              </div>
            )}

            <div className="px-6 py-2 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              (-) GASTOS DIRETOS COM MOTOBOYS E MOTOS
            </div>
            <div className="flex justify-between items-center px-8 py-2 text-muted-foreground text-xs">
              <span>
                • Custo de Pessoal e Retaguarda (
                {modoVisao === "realizado" ? "Folha Liquidada & Vales Pagos" : "Estimativa da Folha (Teto Aberto)"}
                )
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{formatarMoeda(dre.custos_diretos.custo_pessoal_folha)}</span>
            </div>
            <div className="flex justify-between items-center px-8 py-2 text-muted-foreground text-xs">
              <span>
                • Manutenção e Combustível de Frota Própria (
                {modoVisao === "realizado" ? "Lançamentos e Faturas Pagas" : "Registros moto_embu"}
                )
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">{formatarMoeda(dre.custos_diretos.manutencao_frota_propria)}</span>
            </div>
            <div className="flex justify-between items-center px-6 py-2.5 font-bold text-foreground bg-muted/20 text-xs">
              <span>TOTAL GASTOS DIRETOS</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.custos_diretos.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3.5 bg-muted/30 font-bold text-foreground">
              <span>
                {dre.lucro_bruto >= 0 ? "(=) LUCRO BRUTO" : "(=) PREJUÍZO BRUTO"} (Margem: {formatarPercentual(dre.margem_bruta_percentual)})
              </span>
              <span className={dre.lucro_bruto >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                {formatarMoeda(dre.lucro_bruto)}
              </span>
            </div>

            <div className="px-6 py-2 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              (-) CONTAS FIXAS E ESCRITÓRIO
            </div>
            {dre.despesas_fixas.itens.map((item, index) => (
              <div key={index} className="flex justify-between items-center px-8 py-1.5 text-muted-foreground text-xs">
                <span>• {item.descricao}</span>
                <span className="text-rose-600 dark:text-rose-400 font-medium">{formatarMoeda(item.valor)}</span>
              </div>
            ))}
            {dre.despesas_fixas.itens.length === 0 && (
              <div className="flex items-center justify-between px-8 py-2 text-xs">
                <span className="text-muted-foreground italic">
                  {modoVisao === "realizado" ? "Nenhuma conta fixa paga no período" : "Nenhuma conta fixa lançada no período"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
                  className="h-7 text-xs text-foreground hover:bg-muted/40 font-medium gap-1"
                >
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Lançar Conta Fixa</span>
                </Button>
              </div>
            )}
            <div className="flex justify-between items-center px-6 py-2.5 font-bold text-foreground bg-muted/20 text-xs">
              <span>TOTAL CONTAS FIXAS E ESCRITÓRIO</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.despesas_fixas.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
              <span>(-) IMPOSTOS DO MÊS (Simples Nacional - DAS {dre.tributos_correntes_das.is_provisionado ? "[Provisão Estimada]" : "[Guia Fechada]"})</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.tributos_correntes_das.total)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-3 bg-muted/50 font-bold text-foreground text-xs border-y border-border">
              <span>
                {dre.lucro_operacional >= 0 ? "(=) LUCRO OPERACIONAL (EBITDA / LAJIDA)" : "(=) PREJUÍZO OPERACIONAL (EBITDA / LAJIDA)"}
              </span>
              <span className={dre.lucro_operacional >= 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                {formatarMoeda(dre.lucro_operacional)}
              </span>
            </div>

            {dre.prolabore > 0 && (
              <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
                <span>(-) RETIRADA DE PRÓ-LABORE DOS SÓCIOS</span>
                <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.prolabore)}</span>
              </div>
            )}

            <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
              <span>(-) PARCELAMENTOS FISCAIS (Dívida Ativa / Acordos)</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.parcelamentos_fiscais)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
              <span>(-) INVESTIMENTOS E FINANCIAMENTOS (Consórcio, Frota, Imóveis)</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.investimentos_financiamentos)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
              <span>(-) DESPESAS FINANCEIRAS (Juros Cheque Especial / Tarifas Bancárias)</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">(-) {formatarMoeda(dre.despesas_financeiras)}</span>
            </div>

            <div className="flex justify-between items-center px-6 py-4 font-bold text-sm bg-muted/60 text-foreground">
              <span className={isPositivo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                (=) {isPositivo ? (modoVisao === "realizado" ? "LUCRO REAL DA EMPRESA" : "LUCRO PROJETADO DA EMPRESA") : (modoVisao === "realizado" ? "PREJUÍZO REAL NO PERÍODO" : "PREJUÍZO PROJETADO NO PERÍODO")}
              </span>
              <div className="text-right">
                <div className={`text-base font-bold ${isPositivo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatarMoeda(dre.lucro_liquido)}
                </div>
                <div className={`text-xs font-semibold ${isPositivo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                  Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
