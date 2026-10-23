import { Wallet, Lock, ArrowUpRight, ArrowDownRight, Calendar, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import type { FluxoCaixaResponse } from "@/services/api/fluxo-caixa.api";

interface FluxoCaixaKpiCardsProps {
  fluxo: FluxoCaixaResponse;
  isEditingSaldo: boolean;
  setIsEditingSaldo: (val: boolean) => void;
  setSaldoInput: (val: string) => void;
  isSavingSaldo: boolean;
  onSalvarSaldoInicial: () => void;
  diaSalariosStr: string;
  diaConveniosStr: string;
}

export function FluxoCaixaKpiCards({
  fluxo,
  isEditingSaldo,
  setIsEditingSaldo,
  setSaldoInput,
  isSavingSaldo,
  onSalvarSaldoInicial,
  diaSalariosStr,
  diaConveniosStr,
}: FluxoCaixaKpiCardsProps) {
  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-4">
      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground truncate">Saldo Inicial (Dia 01)</p>
              {!isEditingSaldo && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => {
                    setSaldoInput(fluxo.saldo_inicial.toFixed(2));
                    setIsEditingSaldo(true);
                  }}
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              )}
            </div>
            {isEditingSaldo ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  className="h-8 rounded-[12px] text-xs font-semibold bg-background"
                  defaultValue={fluxo.saldo_inicial.toFixed(2)}
                  onChange={(e) => setSaldoInput(e.target.value)}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 rounded-[12px] bg-primary text-primary-foreground shrink-0"
                  onClick={onSalvarSaldoInicial}
                  disabled={isSavingSaldo}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
                {formatCurrency(fluxo.saldo_inicial)}
              </h2>
            )}
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Base de partida consolidada
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Saldo Retido p/ Convênios</p>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-0.5 truncate">
              {formatCurrency(fluxo.saldo_retido_convenios)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {`Descontado dia ${diaSalariosStr} • Travado p/ dia ${diaConveniosStr}`}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Entradas vs Saídas</p>
            <div className="mt-0.5">
              <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{formatCurrency(fluxo.total_entradas_projetadas)}</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-0.5 truncate">
                <ArrowDownRight className="h-3 w-3 text-rose-600 dark:text-rose-400 shrink-0" />
                <span className="truncate">{formatCurrency(fluxo.total_saidas_projetadas)}</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Projeção total do período
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-[200px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div
            className={cn(
              "w-10 h-10 rounded-[14px] border flex items-center justify-center shrink-0",
              fluxo.saldo_final_projetado >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400",
            )}
          >
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground truncate">Saldo Projetado (Fim do Mês)</p>
            <h2
              className={cn(
                "text-xl sm:text-2xl font-bold tracking-tight mt-0.5 truncate",
                fluxo.saldo_final_projetado >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400",
              )}
            >
              {formatCurrency(fluxo.saldo_final_projetado)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Estimativa de fechamento
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
