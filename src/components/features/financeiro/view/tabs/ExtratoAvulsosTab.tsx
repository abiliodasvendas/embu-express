import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatters/currency";
import { ExtratoMensal } from "@/types/financeiro";
import { OcorrenciaComTipo } from "@/hooks/ui/financeiro";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { Banknote, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface ExtratoAvulsosTabProps {
  extrato: ExtratoMensal;
  isSuperAdmin: boolean;
  onOpenOccurrenceDetails: (occ: OcorrenciaComTipo) => void;
}

export function ExtratoAvulsosTab({
  extrato,
  isSuperAdmin,
  onOpenOccurrenceDetails,
}: ExtratoAvulsosTabProps) {
  const ocorrenciasAvulsas = (
    (extrato.ocorrencias as OcorrenciaComTipo[]) || []
  ).filter((o) => !o.colaborador_cliente_id && o.impacto_financeiro);

  const hasContent =
    (extrato.totais?.total_mei ?? 0) > 0 || ocorrenciasAvulsas.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 rounded-[20px] sm:rounded-[24px] border border-border bg-card">
        <Banknote className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-base font-semibold text-foreground mb-1">Avulsos</h3>
        <p className="text-xs text-muted-foreground">
          Nenhum lançamento avulso registrado neste período.
        </p>
      </div>
    );
  }

  const saldoAvulso =
    (extrato.totais?.total_avulso || 0) + (extrato.totais?.total_mei || 0);

  return (
    <div className="space-y-4">
      <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-5 md:p-8 shadow-xs">
        <div className="space-y-3">
          {(extrato.totais?.total_mei ?? 0) > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[16px] border border-border bg-card hover:bg-muted/40 transition-colors gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
                  <ArrowUpCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">MEI</p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground self-end sm:self-center">
                + {formatCurrency(extrato.totais?.total_mei ?? 0)}
              </span>
            </div>
          )}

          {ocorrenciasAvulsas.map((occ, oIdx: number) => (
            <div
              key={oIdx}
              onClick={() => onOpenOccurrenceDetails(occ)}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[16px] border border-border bg-card hover:bg-muted/40 transition-colors gap-3 cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
                  {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {occ.tipo?.descricao}
                  </p>
                  {occ.observacao && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {occ.observacao}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {format(new Date(occ.data_ocorrencia + "T12:00:00"), "PPP", {
                      locale: ptBR,
                    })}
                    {isSuperAdmin && occ.criado_por_usuario?.nome_completo && (
                      <span className="ml-1.5 italic">
                        (Registrado por {occ.criado_por_usuario.nome_completo.split(" ")[0]})
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-foreground self-end sm:self-center shrink-0">
                {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"}{" "}
                {formatCurrency(occ.valor)}
              </span>
            </div>
          ))}

          <div className="pt-3 border-t border-border mt-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs text-muted-foreground font-medium">
                Saldo Total Avulso
              </span>
              <p className="text-base font-bold text-foreground">
                {saldoAvulso >= 0 ? "+" : ""}
                {formatCurrency(saldoAvulso)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
