import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiGridSkeleton } from "@/components/skeletons";
import { Banner } from "@/components/ui/Banner";
import {
  AuditoriaConvenioResultado,
  LancamentoConvenio,
} from "@/types/database";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import {
  Receipt,
  Users,
  Wrench,
  DollarSign,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ConvenioAuditoriaSectionProps {
  auditoria?: AuditoriaConvenioResultado;
  isLoading: boolean;
  convenioId: string;
  convenioNome?: string;
  mes: number;
  ano: number;
  canEdit: boolean;
  onOpenLiquidarDialog: () => void;
  onOpenLancamentoDialog: (lancamento?: LancamentoConvenio | null) => void;
}

export function ConvenioAuditoriaSection({
  auditoria,
  isLoading,
  canEdit,
  onOpenLiquidarDialog,
}: ConvenioAuditoriaSectionProps) {
  const [filtroCategoria, setFiltroCategoria] = useState<
    "todos" | "motoboys" | "frota" | "sem_vinculo"
  >("todos");

  const formatLocalDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <KpiGridSkeleton count={4} cols={4} />
        <div className="rounded-[24px] border border-border bg-card shadow-xs p-6 space-y-4">
          <Skeleton className="h-6 w-56 rounded-[8px] bg-muted/70" />
          <Skeleton className="h-16 rounded-[18px] bg-muted/50" />
        </div>
        <div className="rounded-[24px] border border-border bg-card shadow-xs p-6 space-y-3">
          <Skeleton className="h-6 w-48 rounded-[8px] bg-muted/70" />
          <Skeleton className="h-40 rounded-[18px] bg-muted/50" />
        </div>
      </div>
    );
  }

  if (!auditoria) {
    return null;
  }

  const isFaturaPaga = auditoria.fatura_fornecedor?.status === "PAGA";
  const valorFaturaExibido = isFaturaPaga
    ? (auditoria.fatura_fornecedor?.valor_pago || auditoria.fatura_fornecedor?.valor_total_fatura || 0)
    : (auditoria.total_fatura_fornecedor > 0 ? auditoria.total_fatura_fornecedor : auditoria.total_geral_lancamentos);

  const temConsumo = auditoria.total_geral_lancamentos > 0 || valorFaturaExibido > 0;

  const listaExibicao: LancamentoConvenio[] =
    filtroCategoria === "motoboys"
      ? auditoria.lancamentos_motoboys
      : filtroCategoria === "frota"
      ? auditoria.lancamentos_frota_propria
      : filtroCategoria === "sem_vinculo"
      ? auditoria.lancamentos_sem_vinculo
      : [
          ...auditoria.lancamentos_motoboys,
          ...auditoria.lancamentos_frota_propria,
          ...auditoria.lancamentos_sem_vinculo,
        ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
        <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Fatura da Oficina (Dia 15)
            </span>
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
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
                Quitado {auditoria.fatura_fornecedor?.data_pagamento ? formatLocalDate(auditoria.fatura_fornecedor.data_pagamento) : ""}
              </Badge>
            ) : temConsumo ? (
              <Badge
                variant="outline"
                className="text-[10px] font-bold h-5 px-2 rounded-[6px] bg-muted/60 text-foreground border-border"
              >
                A Pagar dia 15
              </Badge>
            ) : (
              <span className="text-[11px] text-muted-foreground font-normal">
                Sem consumo
              </span>
            )}
            {canEdit && !isFaturaPaga && temConsumo && (
              <button
                type="button"
                onClick={onOpenLiquidarDialog}
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CreditCard className="h-3 w-3" />
                Quitar Fatura
              </button>
            )}
          </div>
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
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formatCurrency(auditoria.total_descontado_motoboys)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>{auditoria.lancamentos_motoboys.length} lançamentos</span>
            <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
              Retido na Folha
            </span>
          </div>
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
          <div className="text-2xl font-bold text-foreground tracking-tight">
            {formatCurrency(auditoria.total_frota_propria)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>{auditoria.lancamentos_frota_propria.length} lançamentos</span>
            <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-[6px] border border-border">
              Custo da Empresa
            </span>
          </div>
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
        </div>
      </div>

      {auditoria.diferenca_nao_identificada > 0.05 && (
        <Banner variant="warning">
          O saldo a cargo da Embu ({formatCurrency(auditoria.saldo_a_cargo_embu)}) excede as despesas de frota própria ({formatCurrency(auditoria.total_frota_propria)}) em {formatCurrency(auditoria.diferenca_nao_identificada)}. Verifique se há ordens de serviço pendentes de vínculo antes de quitar o boleto.
        </Banner>
      )}

      <div className="rounded-[24px] border border-border bg-card shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Extrato Conciliado da Oficina
            </h3>
            <p className="text-xs text-muted-foreground">
              Total de {auditoria.total_geral_lancamentos > 0 ? formatCurrency(auditoria.total_geral_lancamentos) : "R$ 0,00"} computados no período
            </p>
          </div>

          <div className="flex bg-muted/50 p-1 rounded-[14px] border border-border/40 gap-1 overflow-x-auto">
            <button
              onClick={() => setFiltroCategoria("todos")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-[10px] transition-all whitespace-nowrap",
                filtroCategoria === "todos"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Todos ({listaExibicao.length})
            </button>
            <button
              onClick={() => setFiltroCategoria("motoboys")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-[10px] transition-all whitespace-nowrap",
                filtroCategoria === "motoboys"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Motoboys ({auditoria.lancamentos_motoboys.length})
            </button>
            <button
              onClick={() => setFiltroCategoria("frota")}
              className={cn(
                "px-3 py-1 text-xs font-semibold rounded-[10px] transition-all whitespace-nowrap",
                filtroCategoria === "frota"
                  ? "bg-card text-primary shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Moto Embu ({auditoria.lancamentos_frota_propria.length})
            </button>
            {auditoria.lancamentos_sem_vinculo.length > 0 && (
              <button
                onClick={() => setFiltroCategoria("sem_vinculo")}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-[10px] transition-all whitespace-nowrap text-muted-foreground",
                  filtroCategoria === "sem_vinculo"
                    ? "bg-muted text-foreground shadow-xs border border-border"
                    : "hover:text-foreground"
                )}
              >
                Sem Vínculo ({auditoria.lancamentos_sem_vinculo.length})
              </button>
            )}
          </div>
        </div>

        {listaExibicao.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">
            Nenhum lançamento encontrado nesta categoria para o período selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="text-xs font-semibold">Data</TableHead>
                  <TableHead className="text-xs font-semibold">Beneficiário / Destino</TableHead>
                  <TableHead className="text-xs font-semibold">Descrição</TableHead>
                  <TableHead className="text-xs font-semibold">Tipo de Despesa</TableHead>
                  <TableHead className="text-xs font-semibold text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/60">
                {listaExibicao.map((l) => {
                  const isFrota = l.moto_embu;
                  const isMotoboy = !isFrota && l.colaborador_id;
                  const isSemVinculo = !isFrota && !l.colaborador_id;

                  return (
                    <TableRow key={l.id} className="hover:bg-muted/30">
                      <TableCell className="text-xs py-3">
                        {formatLocalDate(l.data_lancamento)}
                      </TableCell>
                      <TableCell className="text-xs py-3 font-medium">
                        {isFrota ? (
                          <span className="font-semibold text-foreground">
                            Frota Própria (Moto Embu)
                          </span>
                        ) : isMotoboy ? (
                          <span>{l.colaborador?.nome_completo || "Colaborador"}</span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            Sem Colaborador Identificado
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-3 text-muted-foreground">
                        {l.descricao || "-"}
                      </TableCell>
                      <TableCell className="text-xs py-3">
                        {isFrota ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-muted text-foreground border-border"
                          >
                            Frota Embu
                          </Badge>
                        ) : isMotoboy ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-muted text-foreground border-border"
                          >
                            Desconto Folha
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold bg-muted text-muted-foreground border-border"
                          >
                            Sem Vínculo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-3 text-right font-bold text-foreground">
                        {formatCurrency(Number(l.valor || 0))}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}