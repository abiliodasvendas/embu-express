import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/utils/formatters/currency";
import { ExtratoMensal } from "@/types/financeiro";
import { LancamentoConvenioItem } from "@/hooks/ui/financeiro";
import { Store, ArrowDownCircle } from "lucide-react";

interface ExtratoConveniosTabProps {
  extrato: ExtratoMensal;
}

export function ExtratoConveniosTab({ extrato }: ExtratoConveniosTabProps) {
  const convenios =
    (extrato.lancamentos_convenios as LancamentoConvenioItem[]) || [];

  if (convenios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 rounded-[20px] sm:rounded-[24px] border border-border bg-card">
        <Store className="h-6 w-6 text-muted-foreground mb-2" />
        <h3 className="text-base font-semibold text-foreground mb-1">Convênios</h3>
        <p className="text-xs text-muted-foreground">
          Nenhum lançamento registrado neste período.
        </p>
      </div>
    );
  }

  const totalDescontos = convenios.reduce(
    (acc: number, l) => acc + Number(l.valor),
    0,
  );

  return (
    <div className="rounded-[20px] sm:rounded-[24px] border border-border bg-card p-5 md:p-8 shadow-xs">
      <div className="space-y-3">
        {convenios.map((lancamento, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-[16px] border border-border bg-card hover:bg-muted/40 transition-colors gap-3"
          >
            <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-[12px] bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800 flex items-center justify-center shrink-0">
                <ArrowDownCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {lancamento.convenio?.nome || "Convênio"}
                </p>
                {(lancamento.descricao || lancamento.observacao) && (
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {lancamento.descricao || lancamento.observacao}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  {format(
                    new Date(lancamento.data_lancamento + "T12:00:00"),
                    "PPP",
                    { locale: ptBR },
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-destructive self-end sm:self-center shrink-0">
              - {formatCurrency(Number(lancamento.valor))}
            </span>
          </div>
        ))}

        <div className="pt-3 border-t border-border mt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground font-medium">
              Total Descontos Convênios
            </span>
            <p className="text-base font-bold text-destructive">
              - {formatCurrency(totalDescontos)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
