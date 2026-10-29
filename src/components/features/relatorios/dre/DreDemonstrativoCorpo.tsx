import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { DreConsolidado } from "@/services/api/dre.api";

interface DreDemonstrativoCorpoProps {
  dre: DreConsolidado;
  modoVisao: "realizado" | "projetado";
  onLancarDespesa: () => void;
}

export function DreDemonstrativoCorpo({
  dre,
  modoVisao,
  onLancarDespesa,
}: DreDemonstrativoCorpoProps) {
  const isPositivo = (dre.lucro_liquido || 0) >= 0;

  const formatarPercentual = (valor: number) => {
    return `${(valor || 0).toFixed(2)}%`;
  };

  return (
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
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatCurrency(dre.faturamento_bruto)}
            </span>
          </div>

          {dre.outras_receitas_operacionais > 0 && (
            <div className="flex justify-between items-center px-6 py-2.5 bg-muted/10 font-medium text-foreground text-xs">
              <span>(+) OUTRAS RECEITAS OPERACIONAIS (Lançamentos Avulsos)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {formatCurrency(dre.outras_receitas_operacionais)}
              </span>
            </div>
          )}

          <div className="px-6 py-2 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            (-) GASTOS DIRETOS COM MOTOBOYS E MOTOS
          </div>
          <div className="flex justify-between items-center px-8 py-2 text-muted-foreground text-xs">
            <span>
              • Custo de Pessoal e Retaguarda (
              {modoVisao === "realizado"
                ? "Folha Liquidada & Vales Pagos"
                : "Estimativa da Folha (Teto Aberto)"}
              )
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {formatCurrency(dre.custos_diretos.custo_pessoal_folha)}
            </span>
          </div>
          <div className="flex justify-between items-center px-8 py-2 text-muted-foreground text-xs">
            <span>
              • Manutenção e Combustível de Frota Própria (
              {modoVisao === "realizado"
                ? "Lançamentos e Faturas Pagas"
                : "Registros moto_embu"}
              )
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-medium">
              {formatCurrency(dre.custos_diretos.manutencao_frota_propria)}
            </span>
          </div>
          <div className="flex justify-between items-center px-6 py-2.5 font-bold text-foreground bg-muted/20 text-xs">
            <span>TOTAL GASTOS DIRETOS</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.custos_diretos.total)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-3.5 bg-muted/30 font-bold text-foreground">
            <span>
              {dre.lucro_bruto >= 0 ? "(=) LUCRO BRUTO" : "(=) PREJUÍZO BRUTO"} (Margem:{" "}
              {formatarPercentual(dre.margem_bruta_percentual)})
            </span>
            <span
              className={
                dre.lucro_bruto >= 0
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-rose-600 dark:text-rose-400 font-bold"
              }
            >
              {formatCurrency(dre.lucro_bruto)}
            </span>
          </div>

          <div className="px-6 py-2 bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            (-) CONTAS FIXAS E ESCRITÓRIO
          </div>
          {dre.despesas_fixas.itens.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center px-8 py-1.5 text-muted-foreground text-xs"
            >
              <span>• {item.descricao}</span>
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {formatCurrency(item.valor)}
              </span>
            </div>
          ))}
          {dre.despesas_fixas.itens.length === 0 && (
            <div className="flex items-center justify-between px-8 py-2 text-xs">
              <span className="text-muted-foreground italic">
                {modoVisao === "realizado"
                  ? "Nenhuma conta fixa paga no período"
                  : "Nenhuma conta fixa lançada no período"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLancarDespesa}
                className="h-7 text-xs text-foreground hover:bg-muted/40 font-medium gap-1"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Lançar Conta Fixa</span>
              </Button>
            </div>
          )}
          <div className="flex justify-between items-center px-6 py-2.5 font-bold text-foreground bg-muted/20 text-xs">
            <span>TOTAL CONTAS FIXAS E ESCRITÓRIO</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.despesas_fixas.total)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
            <span>
              (-) IMPOSTOS DO MÊS (Simples Nacional - DAS{" "}
              {dre.tributos_correntes_das.is_provisionado
                ? "[Provisão Estimada]"
                : "[Guia Fechada]"}
              )
            </span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.tributos_correntes_das.total)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-3 bg-muted/50 font-bold text-foreground text-xs border-y border-border">
            <span>
              {dre.lucro_operacional >= 0
                ? "(=) LUCRO OPERACIONAL (EBITDA / LAJIDA)"
                : "(=) PREJUÍZO OPERACIONAL (EBITDA / LAJIDA)"}
            </span>
            <span
              className={
                dre.lucro_operacional >= 0
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-rose-600 dark:text-rose-400 font-bold"
              }
            >
              {formatCurrency(dre.lucro_operacional)}
            </span>
          </div>

          {dre.prolabore > 0 && (
            <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
              <span>(-) RETIRADA DE PRÓ-LABORE DOS SÓCIOS</span>
              <span className="text-rose-600 dark:text-rose-400 font-bold">
                (-) {formatCurrency(dre.prolabore)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
            <span>(-) PARCELAMENTOS FISCAIS (Dívida Ativa / Acordos)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.parcelamentos_fiscais)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
            <span>(-) INVESTIMENTOS E FINANCIAMENTOS (Consórcio, Frota, Imóveis)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.investimentos_financiamentos)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-2.5 text-foreground text-xs font-medium">
            <span>(-) DESPESAS FINANCEIRAS (Juros Cheque Especial / Tarifas Bancárias)</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">
              (-) {formatCurrency(dre.despesas_financeiras)}
            </span>
          </div>

          <div className="flex justify-between items-center px-6 py-4 font-bold text-sm bg-muted/60 text-foreground">
            <span
              className={
                isPositivo
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }
            >
              (=){" "}
              {isPositivo
                ? modoVisao === "realizado"
                  ? "LUCRO REAL DA EMPRESA"
                  : "LUCRO PROJETADO DA EMPRESA"
                : modoVisao === "realizado"
                ? "PREJUÍZO REAL NO PERÍODO"
                : "PREJUÍZO PROJETADO NO PERÍODO"}
            </span>
            <div className="text-right">
              <div
                className={`text-base font-bold ${
                  isPositivo
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {formatCurrency(dre.lucro_liquido)}
              </div>
              <div
                className={`text-xs font-semibold ${
                  isPositivo
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                Margem Líquida: {formatarPercentual(dre.margem_liquida_percentual)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
