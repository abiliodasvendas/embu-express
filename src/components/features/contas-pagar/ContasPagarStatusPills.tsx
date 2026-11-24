import { cn } from "@/lib/utils";
import {
  FILTRO_CONTA_PAGAR,
  FiltroContaPagarType,
} from "@/constants/financeiro.constants";
import { ContadoresContasPagar } from "@/hooks/business/contasPagarHelper";
import { AlertCircle, CalendarClock, CheckCircle2, Clock, X } from "lucide-react";

interface ContasPagarStatusPillsProps {
  filtroAtivo: FiltroContaPagarType;
  onSelectFiltro: (filtro: FiltroContaPagarType) => void;
  contadores: ContadoresContasPagar;
  isLoading?: boolean;
}

export function ContasPagarStatusPills({
  filtroAtivo,
  onSelectFiltro,
  contadores,
  isLoading = false,
}: ContasPagarStatusPillsProps) {
  const handleToggle = (filtro: FiltroContaPagarType) => {
    if (filtro === FILTRO_CONTA_PAGAR.TODOS) {
      onSelectFiltro(FILTRO_CONTA_PAGAR.TODOS);
      return;
    }
    onSelectFiltro(
      filtroAtivo === filtro ? FILTRO_CONTA_PAGAR.TODOS : filtro
    );
  };

  const isTodos = filtroAtivo === FILTRO_CONTA_PAGAR.TODOS;
  const isHoje = filtroAtivo === FILTRO_CONTA_PAGAR.VENCENDO_HOJE;
  const isAtrasadas = filtroAtivo === FILTRO_CONTA_PAGAR.ATRASADAS;
  const isPendentes = filtroAtivo === FILTRO_CONTA_PAGAR.PENDENTE;
  const isPagas = filtroAtivo === FILTRO_CONTA_PAGAR.PAGO;
  const isCanceladas = filtroAtivo === FILTRO_CONTA_PAGAR.CANCELADO;
  const isSemana = filtroAtivo === FILTRO_CONTA_PAGAR.ESTA_SEMANA;
  const isProximas = filtroAtivo === FILTRO_CONTA_PAGAR.PROXIMAS;

  return (
    <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] pb-0.5">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleToggle(FILTRO_CONTA_PAGAR.TODOS)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
          isTodos
            ? "bg-foreground text-background border-foreground shadow-2xs"
            : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <span>Todos</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
            isTodos
              ? "bg-background/20 text-background"
              : "bg-muted text-muted-foreground"
          )}
        >
          {contadores.todos}
        </span>
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleToggle(FILTRO_CONTA_PAGAR.VENCENDO_HOJE)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
          isHoje
            ? "bg-amber-500 text-white border-amber-500 shadow-2xs"
            : contadores.vencendoHoje > 0
            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
            : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <CalendarClock className="h-3.5 w-3.5 shrink-0" />
        <span>Vencendo Hoje</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
            isHoje
              ? "bg-white/20 text-white"
              : contadores.vencendoHoje > 0
              ? "bg-amber-500/20 text-amber-800 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          )}
        >
          {contadores.vencendoHoje}
        </span>
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleToggle(FILTRO_CONTA_PAGAR.ATRASADAS)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
          isAtrasadas
            ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
            : contadores.atrasadas > 0
            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
            : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        <span>Em Atraso</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
            isAtrasadas
              ? "bg-white/20 text-white"
              : contadores.atrasadas > 0
              ? "bg-rose-500/20 text-rose-800 dark:text-rose-300"
              : "bg-muted text-muted-foreground"
          )}
        >
          {contadores.atrasadas}
        </span>
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleToggle(FILTRO_CONTA_PAGAR.PENDENTE)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
          isPendentes
            ? "bg-foreground text-background border-foreground shadow-2xs"
            : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>Pendentes</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
            isPendentes
              ? "bg-background/20 text-background"
              : "bg-muted text-muted-foreground"
          )}
        >
          {contadores.pendentes}
        </span>
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => handleToggle(FILTRO_CONTA_PAGAR.PAGO)}
        className={cn(
          "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
          isPagas
            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
            : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>Pagas</span>
        <span
          className={cn(
            "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
            isPagas
              ? "bg-white/20 text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {contadores.pagas}
        </span>
      </button>

      {(contadores.canceladas > 0 || isCanceladas) && (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleToggle(FILTRO_CONTA_PAGAR.CANCELADO)}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border text-xs font-medium transition-all shrink-0 cursor-pointer select-none disabled:opacity-60",
            isCanceladas
              ? "bg-foreground text-background border-foreground shadow-2xs"
              : "bg-card text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <span>Canceladas</span>
          <span
            className={cn(
              "text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full",
              isCanceladas
                ? "bg-background/20 text-background"
                : "bg-muted text-muted-foreground"
            )}
          >
            {contadores.canceladas}
          </span>
        </button>
      )}

      {(isSemana || isProximas) && (
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onSelectFiltro(FILTRO_CONTA_PAGAR.TODOS)}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border bg-primary text-primary-foreground border-primary text-xs font-medium transition-all shrink-0 cursor-pointer select-none shadow-2xs"
        >
          <span>{isSemana ? "Esta Semana" : "Próximas Semanas"}</span>
          <span className="text-[11px] font-semibold tabular-nums px-1.5 py-0.2 rounded-full bg-white/20">
            {isSemana ? contadores.estaSemana : contadores.proximas}
          </span>
          <X className="h-3 w-3 shrink-0" />
        </button>
      )}
    </div>
  );
}
