import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateTimeToBR } from "@/utils/formatters/date";
import { cn } from "@/lib/utils";
import {
  FINANCEIRO_STATUS,
} from "@/constants/financeiro.constants";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { getMessage } from "@/constants/messages";
import { ExtratoMensal } from "@/types/financeiro";
import { LancamentoConvenioItem } from "@/hooks/ui/financeiro";
import {
  CheckCircle2,
  Wallet,
  X,
  Banknote,
  Info,
  Store,
  CreditCard,
} from "lucide-react";

interface ExtratoKpisProps {
  extrato: ExtratoMensal;
  modoComprovanteRenda: boolean;
  can: (permission: string) => boolean;
  isConfirmingAdiantamento: boolean;
  isPaying: boolean;
  isUndoingPayment: boolean;
  onConfirmarAdiantamento: () => void;
  onDesconfirmarAdiantamento: () => void;
  onPayment: () => void;
  onDesfazerPagamento: () => void;
}

export function ExtratoKpis({
  extrato,
  modoComprovanteRenda,
  can,
  isConfirmingAdiantamento,
  isPaying,
  isUndoingPayment,
  onConfirmarAdiantamento,
  onDesconfirmarAdiantamento,
  onPayment,
  onDesfazerPagamento,
}: ExtratoKpisProps) {
  const totalConvenios = (
    (extrato.lancamentos_convenios as LancamentoConvenioItem[]) || []
  ).reduce((acc: number, l) => acc + Number(l.valor), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="outline"
            className={cn(
              "rounded-full px-4 py-1.5 font-semibold text-xs tracking-wider border",
              extrato.status === FINANCEIRO_STATUS.PAGO
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
            )}
          >
            {extrato.status === FINANCEIRO_STATUS.RASCUNHO ? "EM ABERTO" : extrato.status}
          </Badge>
          {extrato.data_pagamento && (
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Pago em:{" "}
              {formatDateTimeToBR(extrato.data_pagamento, {
                includeTime: true,
              })}
            </span>
          )}
        </div>

        {!modoComprovanteRenda &&
          extrato.status === FINANCEIRO_STATUS.RASCUNHO &&
          can(PERMISSIONS.FINANCEIRO.PAGAR) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {!extrato.adiantamento_confirmado ? (
                <Button
                  variant="outline"
                  className="rounded-[18px] border-border text-foreground hover:bg-muted font-medium h-11 px-6 shadow-xs transition-all w-full sm:w-auto"
                  disabled={isConfirmingAdiantamento}
                  onClick={onConfirmarAdiantamento}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {getMessage("financeiro.confirmacao.adiantamento.titulo")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-[18px] border-destructive/20 text-destructive hover:bg-destructive/10 font-medium h-11 px-6 transition-all w-full sm:w-auto"
                  onClick={onDesconfirmarAdiantamento}
                >
                  <X className="h-4 w-4 mr-2" />
                  {getMessage("financeiro.confirmacao.desfazer_adiantamento.titulo")}
                </Button>
              )}

              <Button
                className="rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-medium h-11 px-8 shadow-xs transition-all w-full sm:w-auto"
                disabled={isPaying}
                onClick={onPayment}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {getMessage("financeiro.confirmacao.botao")}
              </Button>
            </div>
          )}

        {!modoComprovanteRenda &&
          extrato.status === FINANCEIRO_STATUS.PAGO &&
          can(PERMISSIONS.FINANCEIRO.PAGAR) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                className="rounded-[18px] border-destructive/20 text-destructive hover:bg-destructive/10 font-medium h-11 px-6 transition-all w-full sm:w-auto"
                disabled={isUndoingPayment}
                onClick={onDesfazerPagamento}
              >
                <X className="h-4 w-4 mr-2" />
                Desfazer Pagamento
              </Button>
            </div>
          )}
      </div>

      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex gap-3 overflow-x-auto [scrollbar-width:none] pb-1 sm:grid sm:grid-cols-3">
        <div className="min-w-[240px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Banknote className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Saldo Líquido a Pagar
              </p>
              <h2 className={cn(
                "text-2xl sm:text-3xl font-bold tracking-tight mt-0.5",
                (extrato.totais?.saldo_final || 0) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400",
              )}>
                {formatCurrency(extrato.totais?.saldo_final || 0)}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground font-medium">
                <Info className="h-3.5 w-3.5" />
                <span>
                  {extrato.status === FINANCEIRO_STATUS.RASCUNHO
                    ? "Cálculo em tempo real"
                    : "Valores confirmados"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-[240px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Convênios</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
                - {formatCurrency(totalConvenios)}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                Descontos de parceiros
              </p>
            </div>
          </div>
        </div>

        <div className="min-w-[240px] sm:min-w-0 flex-1 rounded-[20px] sm:rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Total Avulso</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-0.5">
                {formatCurrency(
                  (extrato.totais?.total_avulso || 0) + (extrato.totais?.total_mei || 0),
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground font-medium mt-1">
                Lançamentos avulsos + MEI
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
