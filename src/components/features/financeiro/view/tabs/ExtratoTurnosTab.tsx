import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import {
  CALENDARIO_STATUS,
  LANCAMENTO_TIPO,
} from "@/constants/financeiro.constants";
import { ResumoClienteFinanceiro, ExtratoMensal } from "@/types/financeiro";
import { OcorrenciaComTipo } from "@/hooks/ui/financeiro";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Building2,
  Clock,
  Info,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react";

interface ExtratoTurnosTabProps {
  extrato: ExtratoMensal;
  selectedMonth: number;
  selectedYear: number;
  isSuperAdmin: boolean;
  onOpenOccurrenceDetails: (occ: OcorrenciaComTipo) => void;
}

export function ExtratoTurnosTab({
  extrato,
  selectedMonth,
  selectedYear,
  isSuperAdmin,
  onOpenOccurrenceDetails,
}: ExtratoTurnosTabProps) {
  if (!extrato.resumo_por_cliente || extrato.resumo_por_cliente.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 rounded-[20px] sm:rounded-[24px] border border-border bg-card">
        <Clock className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-base font-semibold text-foreground mb-1">Turnos</h3>
        <p className="text-xs text-muted-foreground">Nenhum turno vinculado ao colaborador.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {extrato.resumo_por_cliente.map((resumo: ResumoClienteFinanceiro, idx: number) => (
        <div
          key={idx}
          className="rounded-[20px] sm:rounded-[24px] border border-border bg-card shadow-xs overflow-hidden"
        >
          <div className="bg-muted/20 p-5 md:px-8 md:py-6 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start md:items-center gap-3.5 min-w-0">
              <div className="h-11 w-11 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="font-semibold text-foreground text-base sm:text-lg uppercase tracking-tight truncate">
                  {resumo.nome_fantasia}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5">
                  {resumo.dias_trabalhados < resumo.dias_base_mes && (
                    <Badge
                      variant="outline"
                      className="bg-muted/70 text-foreground border-border text-[10px] font-medium px-2 py-0.5 rounded-lg"
                    >
                      Pagamento Proporcional{" "}
                      {(() => {
                        const dtIni = resumo.data_inicio
                          ? new Date(resumo.data_inicio + "T12:00:00")
                          : null;
                        const dtFim = resumo.data_fim
                          ? new Date(resumo.data_fim + "T12:00:00")
                          : null;
                        if (
                          dtIni &&
                          dtIni.getUTCMonth() + 1 === selectedMonth &&
                          dtIni.getUTCFullYear() === selectedYear
                        )
                          return "(Início)";
                        if (
                          dtFim &&
                          dtFim.getUTCMonth() + 1 === selectedMonth &&
                          dtFim.getUTCFullYear() === selectedYear
                        )
                          return "(Término)";
                        return "(Sem Atividade)";
                      })()}
                    </Badge>
                  )}
                  {resumo.ausencias > 0 && (resumo.valores_fixos?.bonus_config ?? 0) > 0 && (
                    <Badge
                      variant="outline"
                      className="bg-muted/70 text-foreground border-border text-[10px] font-medium px-2 py-0.5 rounded-lg"
                    >
                      Sem bônus (Falta registrada)
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                Valor do Turno
              </p>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {formatCurrency(resumo.valor_calculado)}
              </p>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Período de Atuação
                    </span>
                    <div className="grid grid-cols-3 md:flex md:flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">Base:</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium h-5 px-1.5 border-border bg-muted/50 text-foreground"
                        >
                          {resumo.dias_base_mes}d
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-muted-foreground">Meta:</span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-medium h-5 px-1.5 border-border bg-muted/50 text-foreground"
                        >
                          {resumo.dias_esperados_turno}d
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Trabalhados:</span>
                        <Badge
                          className="text-[10px] font-bold h-5 px-1.5 bg-emerald-600 hover:bg-emerald-600 text-white shadow-xs"
                        >
                          {resumo.dias_trabalhados}d
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 p-3 bg-muted/20 rounded-[18px] border border-border">
                    {resumo.calendario_visual?.map((dia) => (
                      <div
                        key={dia.data}
                        title={`${dia.dia_semana_longo}, ${dia.data_br} - ${dia.status}`}
                        className={cn(
                          "relative h-12 w-10 flex flex-col items-center justify-center rounded-[12px] transition-all border shrink-0",
                          dia.status === CALENDARIO_STATUS.TRABALHADO &&
                            "bg-emerald-500 text-white border-emerald-600 scale-105 z-10 shadow-sm",
                          dia.status === CALENDARIO_STATUS.SEM_ATIVIDADE &&
                            "bg-red-500 text-white border-red-600 shadow-red-200/50 shadow-sm",
                          dia.status === CALENDARIO_STATUS.FERIADO &&
                            "bg-teal-500 text-white border-teal-600 shadow-teal-200/50 shadow-sm",
                          dia.status === CALENDARIO_STATUS.FUTURO &&
                            "bg-muted/30 text-muted-foreground/40 border-dashed border-border opacity-50",
                          dia.status === CALENDARIO_STATUS.NAO_VIGENTE &&
                            "bg-muted/10 text-muted-foreground/20 border-transparent opacity-30",
                        )}
                      >
                        {dia.status === CALENDARIO_STATUS.FERIADO && (
                          <div className="absolute -top-2 -right-1 bg-teal-700 text-white text-[7px] font-black px-1 py-0.5 rounded uppercase tracking-wider shadow-xs z-20 border border-teal-500/50">
                            Feriado
                          </div>
                        )}
                        <span
                          className={cn(
                            "text-[8px] font-black leading-none mb-0.5 uppercase tracking-tighter opacity-80",
                            dia.status === CALENDARIO_STATUS.TRABALHADO ||
                              dia.status === CALENDARIO_STATUS.SEM_ATIVIDADE ||
                              dia.status === CALENDARIO_STATUS.FERIADO
                              ? "text-white"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {dia.dia_semana_curto}
                        </span>
                        <span
                          className={cn(
                            "text-[11px] font-black leading-none",
                            dia.status === CALENDARIO_STATUS.TRABALHADO ||
                              dia.status === CALENDARIO_STATUS.SEM_ATIVIDADE ||
                              dia.status === CALENDARIO_STATUS.FERIADO
                              ? "text-white"
                              : "text-muted-foreground",
                          )}
                        >
                          {dia.dia}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-[18px] p-5 space-y-3 border border-border">
                  <p className="text-xs font-semibold text-foreground tracking-wider mb-2">
                    Composição do Contrato (Mensal)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                    {(resumo.valores_fixos?.contrato ?? 0) > 0 && (
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">Contrato</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(resumo.valores_fixos?.contrato)}
                        </span>
                      </div>
                    )}
                    {(resumo.valores_fixos?.bonus ?? 0) > 0 && (
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">
                          Bônus de Atividade
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(resumo.valores_fixos?.bonus)}
                        </span>
                      </div>
                    )}
                    {(resumo.valores_fixos?.ajuda_custo ?? 0) > 0 && (
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">Ajuda Custo</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(resumo.valores_fixos?.ajuda_custo)}
                        </span>
                      </div>
                    )}
                    {(resumo.valores_fixos?.aluguel ?? 0) > 0 && (
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">Aluguel</span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(resumo.valores_fixos?.aluguel)}
                        </span>
                      </div>
                    )}
                    {(resumo.valores_fixos?.adiantamento_config ?? 0) > 0 && (
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-muted-foreground font-medium">Adiantamento</span>
                        {(resumo.valores_fixos?.adiantamento ?? 0) > 0 ? (
                          <span className="font-semibold text-destructive">
                            -{formatCurrency(resumo.valores_fixos?.adiantamento)}
                          </span>
                        ) : (
                          <span className="font-semibold text-muted-foreground">-</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">
                      Base Mensal do Período
                    </span>
                    <span className="font-semibold text-muted-foreground">
                      {formatCurrency(resumo.saldo_fixo_original)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground font-medium">Valor Proporcional</span>
                    <span className="font-bold text-foreground text-sm">
                      {formatCurrency(
                        ((resumo.saldo_fixo_original - (resumo.valores_fixos?.bonus || 0)) /
                          resumo.dias_base_mes) *
                          Math.max(0, resumo.dias_esperados_turno - (resumo.ausencias || 0)) +
                          (resumo.valores_fixos?.bonus || 0),
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ocorrências Vinculadas
                </h5>

                {((extrato.ocorrencias as OcorrenciaComTipo[]) || []).filter(
                  (o) =>
                    o.colaborador_cliente_id === resumo.id_vinculo &&
                    (o.impacto_financeiro || o.is_virtual),
                ).length > 0 ? (
                  <div className="space-y-2.5">
                    {((extrato.ocorrencias as OcorrenciaComTipo[]) || [])
                      .filter(
                        (o) =>
                          o.colaborador_cliente_id === resumo.id_vinculo &&
                          (o.impacto_financeiro || o.is_virtual),
                      )
                      .map((occ, oIdx) => (
                        <div
                          key={oIdx}
                          onClick={() => onOpenOccurrenceDetails(occ)}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[16px] border border-border bg-card hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
                        >
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div className={cn(
                              "w-9 h-9 rounded-[12px] border flex items-center justify-center shrink-0",
                              occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
                            )}>
                              {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? (
                                <ArrowUpCircle className="h-4 w-4" />
                              ) : (
                                <ArrowDownCircle className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                                {occ.tipo?.descricao || occ.observacao}
                                {occ.is_virtual && (
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] font-medium h-4 px-1 opacity-70"
                                  >
                                    Sistema
                                  </Badge>
                                )}
                              </p>
                              {occ.observacao && (
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                  {occ.observacao}
                                </p>
                              )}
                              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                                {format(
                                  new Date(occ.data_ocorrencia + "T12:00:00"),
                                  "PPP",
                                  { locale: ptBR },
                                )}
                                {isSuperAdmin && occ.criado_por_usuario?.nome_completo && (
                                  <span className="ml-1.5 italic">
                                    (Registrado por{" "}
                                    {occ.criado_por_usuario.nome_completo.split(" ")[0]})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <span className={cn(
                            "text-xs font-bold self-end sm:self-center shrink-0",
                            occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400",
                          )}>
                            {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"}{" "}
                            {formatCurrency(occ.valor)}
                          </span>
                        </div>
                      ))}
                    <div className="pt-3 border-t border-border mt-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs text-muted-foreground font-medium">
                          Saldo das Ocorrências
                        </span>
                        <p className={cn(
                          "text-base font-bold",
                          resumo.creditos_ocorrencia - resumo.debitos_ocorrencia >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400",
                        )}>
                          {resumo.creditos_ocorrencia - resumo.debitos_ocorrencia >= 0 ? "+" : ""}
                          {formatCurrency(
                            resumo.creditos_ocorrencia - resumo.debitos_ocorrencia,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8 rounded-[18px] border border-border bg-muted/20">
                    <Info className="h-5 w-5 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">
                      Sem ocorrências financeiras para este turno.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
