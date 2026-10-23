import { PrintReportHeader } from "@/components/common/PrintReportHeader";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import { ExtratoMensal } from "@/types/financeiro";
import {
  LancamentoConsolidado,
  LancamentoConvenioItem,
} from "@/hooks/ui/financeiro";

interface ExtratoPrintableProps {
  modoComprovanteRenda: boolean;
  colaboradorNome?: string;
  cpf?: string;
  cargo?: string;
  mes: number;
  ano: number;
  extrato: ExtratoMensal;
  lancamentosConsolidados: LancamentoConsolidado[];
}

export function ExtratoPrintable({
  modoComprovanteRenda,
  colaboradorNome,
  cpf,
  cargo,
  mes,
  ano,
  extrato,
  lancamentosConsolidados,
}: ExtratoPrintableProps) {
  const totalConvenios = (
    (extrato.lancamentos_convenios as LancamentoConvenioItem[]) || []
  ).reduce((acc: number, l) => acc + Number(l.valor), 0);

  return (
    <div className="hidden print:block space-y-4">
      <PrintReportHeader
        titulo={
          modoComprovanteRenda
            ? "Demonstrativo de Rendimentos Mensal"
            : "Fechamento Financeiro Mensal"
        }
        colaboradorNome={colaboradorNome}
        cpf={cpf}
        cargo={cargo}
        mes={mes}
        ano={ano}
      />

      <div className="grid grid-cols-3 gap-3 border border-border rounded-[14px] p-3 bg-card">
        <div className="border-r border-border pr-2">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Saldo Líquido a Pagar
          </span>
          <span
            className={cn(
              "text-sm font-bold",
              (extrato.totais?.saldo_final || 0) >= 0
                ? "text-foreground"
                : "text-destructive",
            )}
          >
            {formatCurrency(extrato.totais?.saldo_final || 0)}
          </span>
        </div>
        <div className="border-r border-border pr-2">
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Convênios
          </span>
          <span className="text-sm font-bold text-foreground">
            - {formatCurrency(totalConvenios)}
          </span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase block">
            Total Avulso + MEI
          </span>
          <span className="text-sm font-bold text-foreground">
            {formatCurrency(
              (extrato.totais?.total_avulso || 0) + (extrato.totais?.total_mei || 0),
            )}
          </span>
        </div>
      </div>

      <div className="border border-border rounded-[14px] overflow-hidden bg-card">
        <div className="px-3 py-2 border-b border-border bg-muted/40 flex justify-between items-center">
          <h3 className="font-bold text-foreground text-xs uppercase">
            Extrato Consolidado do Mês
          </h3>
          <span className="text-[9px] font-medium text-muted-foreground">
            {lancamentosConsolidados.length} lançamento(s)
          </span>
        </div>
        {lancamentosConsolidados.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground font-medium">
            Nenhum lançamento financeiro registrado para este período.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-medium uppercase text-[8px] bg-muted/20">
                <th className="py-1.5 px-2">Grupo / Origem</th>
                <th className="py-1.5 px-2">Descrição do Lançamento</th>
                <th className="py-1.5 px-2 text-center">Tipo</th>
                <th className="py-1.5 px-2 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {lancamentosConsolidados.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20">
                  <td className="py-1.5 px-2 font-bold text-foreground uppercase text-[9px] tracking-wide whitespace-nowrap">
                    {item.grupo}
                  </td>
                  <td className="py-1.5 px-2 text-foreground">{item.descricao}</td>
                  <td className="py-1.5 px-2 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-full font-medium text-[8px] uppercase tracking-wider border border-border bg-muted/50 text-foreground">
                      {item.tipo}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "py-1.5 px-2 text-right font-bold whitespace-nowrap",
                      item.tipo === "ENTRADA" ? "text-foreground" : "text-destructive",
                    )}
                  >
                    {item.tipo === "ENTRADA" ? "+" : "-"} {formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border font-bold text-[10px] bg-muted/20">
                <td colSpan={3} className="py-2 px-2 text-foreground uppercase">
                  Saldo Final a Pagar
                </td>
                <td
                  className={cn(
                    "py-2 px-2 text-right font-bold",
                    (extrato.totais?.saldo_final || 0) >= 0
                      ? "text-foreground"
                      : "text-destructive",
                  )}
                >
                  {formatCurrency(extrato.totais?.saldo_final || 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
