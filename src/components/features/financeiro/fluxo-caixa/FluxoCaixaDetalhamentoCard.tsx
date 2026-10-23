import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import type { PontoFluxoDia } from "@/services/api/fluxo-caixa.api";
import type { ModoVisaoFluxo } from "@/hooks/ui/financeiro/useFluxoCaixaTabViewModel";

interface FluxoCaixaDetalhamentoCardProps {
  curvaDiaria: PontoFluxoDia[];
  modoVisao: ModoVisaoFluxo;
  setModoVisao: (modo: ModoVisaoFluxo) => void;
  isFetching: boolean;
}

export function FluxoCaixaDetalhamentoCard({
  curvaDiaria,
  modoVisao,
  setModoVisao,
  isFetching,
}: FluxoCaixaDetalhamentoCardProps) {
  return (
    <Card className="relative rounded-[20px] sm:rounded-[24px] border border-border shadow-xs bg-card overflow-hidden">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div className={cn("transition-opacity duration-200", isFetching && "opacity-50")}>
        <CardHeader className="border-b border-border bg-muted/40 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                Detalhamento Diário das Movimentações
              </CardTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {modoVisao === "realizado"
                  ? "Valores que efetivamente entraram e saíram no banco (Regime de Caixa)"
                  : "Previsões esperadas pelo vencimento de faturas e despesas (Regime de Competência)"}
              </p>
            </div>
            <div className="flex items-center p-1 bg-muted/60 rounded-[14px] border border-border shrink-0 self-start sm:self-auto">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-[10px] text-xs font-semibold ${
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
                className={`h-8 px-3 rounded-[10px] text-xs font-semibold ${
                  modoVisao === "projetado"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setModoVisao("projetado")}
              >
                Projetado (Previsto)
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/60 max-h-[500px] overflow-y-auto">
            {curvaDiaria.map((ponto) => {
              const entradas =
                modoVisao === "realizado" ? ponto.entradas_realizadas : ponto.entradas_projetadas;
              const saidas =
                modoVisao === "realizado" ? ponto.saidas_realizadas : ponto.saidas_projetadas;
              const saldo =
                modoVisao === "realizado"
                  ? ponto.saldo_realizado_acumulado
                  : ponto.saldo_projetado_acumulado;
              const temEventos = ponto.eventos.length > 0;

              return (
                <div
                  key={ponto.dia}
                  className="p-4 sm:px-6 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 sm:mt-0">
                      {String(ponto.dia).padStart(2, "0")}
                    </div>
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground text-xs">
                        Dia {String(ponto.dia).padStart(2, "0")}
                      </p>
                      {temEventos ? (
                        <div className="space-y-0.5">
                          {ponto.eventos.map((ev, i) => (
                            <p key={i} className="text-[11px] text-muted-foreground leading-tight">
                              {ev}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 italic">
                          Sem eventos programados
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-center">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                        Entradas
                      </p>
                      <p
                        className={`font-bold ${
                          entradas > 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {entradas > 0 ? `+ ${formatCurrency(entradas)}` : "-"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                        Saídas
                      </p>
                      <p
                        className={`font-bold ${
                          saidas > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
                        }`}
                      >
                        {saidas > 0 ? `- ${formatCurrency(saidas)}` : "-"}
                      </p>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">
                        Saldo Acumulado
                      </p>
                      <p
                        className={`font-bold ${
                          saldo >= 0 ? "text-foreground" : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(saldo)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
