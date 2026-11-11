import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Banner } from "@/components/ui/Banner";
import {
  AuditoriaConvenioResultado,
  LancamentoConvenio,
} from "@/types/database";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { STATUS_FATURA_CONVENIO } from "@/constants/financeiro.constants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConvenioAuditoriaKpis } from "./ConvenioAuditoriaKpis";

interface ConvenioAuditoriaSectionProps {
  auditoria?: AuditoriaConvenioResultado;
  isLoading: boolean;
  convenioId: string;
  convenioNome?: string;
  mes: number;
  ano: number;
  canEdit: boolean;
  canLiquidar?: boolean;
  onOpenLiquidarDialog: () => void;
  onDesfazerPagamento?: () => void;
  onOpenLancamentoDialog: (lancamento?: LancamentoConvenio | null) => void;
}

export function ConvenioAuditoriaSection({
  auditoria,
  isLoading,
  canEdit,
  canLiquidar,
  onOpenLiquidarDialog,
  onDesfazerPagamento,
}: ConvenioAuditoriaSectionProps) {
  const podeLiquidar = canLiquidar !== undefined ? canLiquidar : canEdit;
  const [filtroCategoria, setFiltroCategoria] = useState<
    "todos" | "motoboys" | "frota" | "sem_vinculo"
  >("todos");

  const formatLocalDate = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  const showSkeleton = isLoading || !auditoria;
  const isFaturaPaga =
    auditoria?.fatura_fornecedor?.status === STATUS_FATURA_CONVENIO.PAGA;
  const valorFaturaExibido = isFaturaPaga
    ? auditoria?.fatura_fornecedor?.valor_pago ||
      auditoria?.fatura_fornecedor?.valor_total_fatura ||
      0
    : (auditoria?.total_fatura_fornecedor || 0) > 0
      ? auditoria?.total_fatura_fornecedor || 0
      : auditoria?.total_geral_lancamentos || 0;

  const temConsumo =
    (auditoria?.total_geral_lancamentos || 0) > 0 || valorFaturaExibido > 0;

  const listaExibicao: LancamentoConvenio[] = !auditoria
    ? []
    : filtroCategoria === "motoboys"
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
      <ConvenioAuditoriaKpis
        auditoria={auditoria}
        showSkeleton={showSkeleton}
        valorFaturaExibido={valorFaturaExibido}
        isFaturaPaga={isFaturaPaga}
        temConsumo={temConsumo}
        podeLiquidar={podeLiquidar}
        onOpenLiquidarDialog={onOpenLiquidarDialog}
        onDesfazerPagamento={onDesfazerPagamento}
        formatLocalDate={formatLocalDate}
      />

      {!showSkeleton && auditoria.diferenca_nao_identificada > 0.05 && (
        <Banner variant="warning">
          O saldo a cargo da Embu ({formatCurrency(auditoria.saldo_a_cargo_embu)}
          ) excede as despesas de frota própria (
          {formatCurrency(auditoria.total_frota_propria)}) em{" "}
          {formatCurrency(auditoria.diferenca_nao_identificada)}. Verifique se há
          ordens de serviço pendentes de vínculo antes de quitar o boleto.
        </Banner>
      )}

      {showSkeleton ? (
        <div className="rounded-[24px] border border-border bg-card shadow-xs p-6 space-y-3">
          <Skeleton className="h-6 w-48 rounded-[8px] bg-muted/70" />
          <Skeleton className="h-40 rounded-[18px] bg-muted/50" />
        </div>
      ) : (
        <div className="rounded-[24px] border border-border bg-card shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Extrato Conciliado da Oficina
              </h3>
              <p className="text-xs text-muted-foreground">
                Total de{" "}
                {auditoria.total_geral_lancamentos > 0
                  ? formatCurrency(auditoria.total_geral_lancamentos)
                  : "R$ 0,00"}{" "}
                computados no período
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
              Nenhum lançamento encontrado nesta categoria para o período
              selecionado.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="text-xs font-semibold">Data</TableHead>
                    <TableHead className="text-xs font-semibold">
                      Beneficiário / Destino
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Descrição
                    </TableHead>
                    <TableHead className="text-xs font-semibold">
                      Tipo de Despesa
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-right">
                      Valor
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                  {listaExibicao.map((l) => {
                    const isFrota = l.moto_embu;
                    const isMotoboy = !isFrota && l.colaborador_id;

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
                            <span>
                              {l.colaborador?.nome_completo || "Colaborador"}
                            </span>
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
      )}
    </div>
  );
}
