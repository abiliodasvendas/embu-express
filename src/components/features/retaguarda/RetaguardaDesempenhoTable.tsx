import { Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import type { MonitorReservaItem } from "@/services/api/retaguarda.api";

interface RetaguardaDesempenhoTableProps {
  itens: MonitorReservaItem[];
  isLoading: boolean;
}

export function RetaguardaDesempenhoTable({
  itens,
  isLoading,
}: RetaguardaDesempenhoTableProps) {
  return (
    <div className="relative rounded-[20px] sm:rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
      {isLoading && itens.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div className="p-5 md:p-6 border-b border-border">
        <h3 className="font-semibold text-foreground text-sm uppercase tracking-tight">
          Desempenho Individual de Alocação
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Dias trabalhados em clientes vs. dias ociosos no ponto de apoio.
        </p>
      </div>

      {isLoading && !itens.length ? (
        <div className="p-6">
          <TableSkeleton columns={9} rows={4} />
        </div>
      ) : itens.length === 0 ? (
        <div className="p-6">
          <UnifiedEmptyState
            icon={Bike}
            title="Nenhum colaborador na reserva"
            description="Nenhum colaborador interno de apoio registrado no período selecionado."
          />
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
                <th className="py-3.5 px-4">Função</th>
                <th className="py-3.5 px-4">Turno</th>
                <th className="py-3.5 px-4 text-right">Salário Base</th>
                <th className="py-3.5 px-4 text-center">Dias Úteis</th>
                <th className="py-3.5 px-4 text-center">Dias Alocados</th>
                <th className="py-3.5 px-4 text-center">Dias Ociosos</th>
                <th className="py-3.5 px-4 text-right">Custo Ociosidade</th>
                <th className="py-3.5 px-4 pr-6 text-center">Ocupação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {itens.map((item) => {
                const taxaOcupacao =
                  item.dias_uteis_mes > 0
                    ? Math.round((item.dias_alocados / item.dias_uteis_mes) * 100)
                    : 0;

                return (
                  <tr key={item.colaborador_id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 pl-6 font-semibold text-foreground">
                      {item.nome_completo}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className="bg-muted/70 text-foreground border-border text-[10px] font-medium px-2 py-0.5 rounded-lg"
                      >
                        Equipe Interna
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {item.turno_descricao}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-foreground">
                      {formatCurrency(item.salario_mensal)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-medium text-muted-foreground">
                      {item.dias_uteis_mes} d
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground">
                      {item.dias_alocados} d
                    </td>
                    <td className="py-3.5 px-4 text-center font-semibold text-foreground">
                      {item.dias_ociosos} d
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-foreground">
                      {formatCurrency(item.prejuizo_ociosidade)}
                    </td>
                    <td className="py-3.5 px-4 pr-6 text-center">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold border border-border bg-muted/60 text-foreground">
                        {taxaOcupacao}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
