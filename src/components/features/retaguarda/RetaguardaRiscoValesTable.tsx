import { ShieldAlert, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/skeletons";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import { RetaguardaRiscoBadge } from "./RetaguardaRiscoBadge";
import type { AlertaRiscoValeItem } from "@/services/api/retaguarda.api";
import type { FiltroVales } from "@/hooks/ui/retaguarda/useRetaguardaReservasViewModel";

interface RetaguardaRiscoValesTableProps {
  alertas: AlertaRiscoValeItem[];
  alertasFiltrados: AlertaRiscoValeItem[];
  filtroVales: FiltroVales;
  setFiltroVales: (filtro: FiltroVales) => void;
  pendentesEmRisco: AlertaRiscoValeItem[];
  totalConfirmados: number;
  isLoading: boolean;
}

export function RetaguardaRiscoValesTable({
  alertas,
  alertasFiltrados,
  filtroVales,
  setFiltroVales,
  pendentesEmRisco,
  totalConfirmados,
  isLoading,
}: RetaguardaRiscoValesTableProps) {
  return (
    <div className="relative rounded-[20px] sm:rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
      {isLoading && alertas.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div className="p-5 md:p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight">
              Prevenção de Saldo Negativo na Folha (Vales do Dia 20)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cruzamento preditivo de faltas e convênios na 1ª quinzena integrado às confirmações de adiantamento.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted/70 p-1 rounded-[14px] border border-border shrink-0">
          <button
            type="button"
            onClick={() => setFiltroVales("todos")}
            className={`h-8 px-3 text-xs font-medium rounded-[10px] transition-all ${
              filtroVales === "todos"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({alertas.length})
          </button>
          <button
            type="button"
            onClick={() => setFiltroVales("pendentes")}
            className={`h-8 px-3 text-xs font-medium rounded-[10px] transition-all ${
              filtroVales === "pendentes"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pendentes
            {pendentesEmRisco.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-muted text-foreground border border-border text-[10px] rounded-full font-bold">
                {pendentesEmRisco.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFiltroVales("tratados")}
            className={`h-8 px-3 text-xs font-medium rounded-[10px] transition-all ${
              filtroVales === "tratados"
                ? "bg-card text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Confirmados ({totalConfirmados})
          </button>
        </div>
      </div>

      <div className="p-0">
        {isLoading && !alertas.length ? (
          <div className="p-6">
            <TableSkeleton columns={10} rows={4} />
          </div>
        ) : alertasFiltrados.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            <CheckCircle2 className="h-6 w-6 text-foreground mx-auto mb-2" />
            {filtroVales === "pendentes"
              ? "Nenhum adiantamento pendente de decisão para esta competência!"
              : filtroVales === "tratados"
              ? "Nenhum adiantamento tratado ou pago até o momento."
              : "Nenhum colaborador encontrado para a competência."}
          </div>
        ) : (
          <div
            className={cn(
              "overflow-x-auto transition-opacity duration-200",
              isLoading && "opacity-50 pointer-events-none",
            )}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/30">
                <tr className="border-b border-border text-muted-foreground uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3.5 px-4 pl-6">Colaborador</th>
                  <th className="py-3.5 px-4 text-right">Salário Base</th>
                  <th className="py-3.5 px-4 text-right">Vale Previsto</th>
                  <th className="py-3.5 px-4 text-center">Situação do Vale</th>
                  <th className="py-3.5 px-4 text-center">Faltas Q1</th>
                  <th className="py-3.5 px-4 text-right">Desc. Faltas</th>
                  <th className="py-3.5 px-4 text-right">Convênios Q1</th>
                  <th className="py-3.5 px-4 text-right">Saldo Proj. Dia 07</th>
                  <th className="py-3.5 px-4 text-center">Grau de Risco</th>
                  <th className="py-3.5 px-4 pr-6 text-right">Sugestão Vale Seguro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {alertasFiltrados.map((a) => (
                  <tr key={a.colaborador_id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 pl-6 font-semibold text-foreground">
                      {a.nome_completo}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-foreground">
                      {formatCurrency(a.salario_base)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-muted-foreground">
                      {formatCurrency(a.vale_configurado)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {a.adiantamento_confirmado ? (
                        <Badge
                          variant="outline"
                          className="bg-muted/70 text-foreground border-border font-medium text-[10px] px-2 py-0.5 rounded-lg"
                        >
                          Confirmado ({formatCurrency(a.valor_adiantamento_aplicado)})
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-muted/40 text-muted-foreground border-border text-[10px] px-2 py-0.5 rounded-lg"
                        >
                          Pendente
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground">
                      {a.faltas_1a_quinzena} d
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-destructive">
                      - {formatCurrency(a.valor_desconto_faltas)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-destructive">
                      - {formatCurrency(a.convenios_1a_quinzena)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                      {formatCurrency(a.saldo_projetado_dia_07)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <RetaguardaRiscoBadge nivel={a.nivel_risco} />
                    </td>
                    <td className="py-3.5 px-4 pr-6 text-right font-bold text-foreground">
                      {formatCurrency(a.sugestao_vale_seguro)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
