import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AuditoriaConvenioResultado } from "@/types/database";
import { formatCurrency } from "@/utils/formatters";
import { STATUS_FATURA_CONVENIO } from "@/constants/financeiro.constants";
import {
  Receipt,
  Users,
  Wrench,
  DollarSign,
  CreditCard,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

interface ConvenioAuditoriaKpisProps {
  auditoria?: AuditoriaConvenioResultado;
  showSkeleton: boolean;
  valorFaturaExibido: number;
  isFaturaPaga: boolean;
  temConsumo: boolean;
  podeLiquidar: boolean;
  onOpenLiquidarDialog: () => void;
  onDesfazerPagamento?: () => void;
  formatLocalDate: (dateStr?: string | null) => string;
}

export function ConvenioAuditoriaKpis({
  auditoria,
  showSkeleton,
  valorFaturaExibido,
  isFaturaPaga,
  temConsumo,
  podeLiquidar,
  onOpenLiquidarDialog,
  onDesfazerPagamento,
  formatLocalDate,
}: ConvenioAuditoriaKpisProps) {
  return (
    <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Fatura da Oficina
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Receipt className="h-4 w-4" />
          </div>
        </div>
        {showSkeleton || !auditoria ? (
          <>
            <Skeleton className="h-8 w-36 rounded-[8px] my-1" />
            <Skeleton className="h-5 w-24 rounded-[6px] mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(valorFaturaExibido)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              {isFaturaPaga ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold h-5 px-2 rounded-[6px] bg-muted text-foreground border-border flex items-center gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                  Quitado{" "}
                  {auditoria.fatura_fornecedor?.data_pagamento
                    ? formatLocalDate(auditoria.fatura_fornecedor.data_pagamento)
                    : ""}
                </Badge>
              ) : temConsumo ? (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold h-5 px-2 rounded-[6px] bg-muted/60 text-foreground border-border"
                >
                  A Pagar
                </Badge>
              ) : (
                <span className="text-[11px] text-muted-foreground font-normal">
                  Sem consumo
                </span>
              )}
              <div className="flex items-center gap-3">
                {podeLiquidar && !isFaturaPaga && temConsumo && (
                  <button
                    type="button"
                    onClick={onOpenLiquidarDialog}
                    className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CreditCard className="h-3 w-3" />
                    Quitar Fatura
                  </button>
                )}
                {podeLiquidar &&
                  onDesfazerPagamento &&
                  auditoria.fatura_fornecedor &&
                  !auditoria.fatura_fornecedor.is_previsao &&
                  (isFaturaPaga ||
                    auditoria.fatura_fornecedor.status ===
                      STATUS_FATURA_CONVENIO.PAGO_PARCIAL ||
                    (auditoria.fatura_fornecedor.valor_pago || 0) > 0) && (
                    <button
                      type="button"
                      onClick={onDesfazerPagamento}
                      className="text-xs font-semibold text-destructive hover:text-destructive/80 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Desfazer
                    </button>
                  )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Descontado dos Motoboys
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Users className="h-4 w-4" />
          </div>
        </div>
        {showSkeleton || !auditoria ? (
          <>
            <Skeleton className="h-8 w-36 rounded-[8px] my-1" />
            <Skeleton className="h-5 w-28 rounded-[6px] mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(auditoria.total_descontado_motoboys)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>{auditoria.lancamentos_motoboys.length} lançamentos</span>
              <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
                Retido na Folha
              </span>
            </div>
          </>
        )}
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Moto Embu
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <Wrench className="h-4 w-4" />
          </div>
        </div>
        {showSkeleton || !auditoria ? (
          <>
            <Skeleton className="h-8 w-36 rounded-[8px] my-1" />
            <Skeleton className="h-5 w-28 rounded-[6px] mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(auditoria.total_frota_propria)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>{auditoria.lancamentos_frota_propria.length} lançamentos</span>
              <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
                Custo da Empresa
              </span>
            </div>
          </>
        )}
      </div>

      <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Saldo a Cargo da Embu
          </span>
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        {showSkeleton || !auditoria ? (
          <>
            <Skeleton className="h-8 w-36 rounded-[8px] my-1" />
            <Skeleton className="h-5 w-28 rounded-[6px] mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(auditoria.saldo_a_cargo_embu)}
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
              <span>Fatura − Motoboys</span>
              {auditoria.diferenca_nao_identificada > 0.05 ? (
                <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
                  +{formatCurrency(auditoria.diferenca_nao_identificada)} divergência
                </span>
              ) : (
                <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
                  Equilibrado
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
