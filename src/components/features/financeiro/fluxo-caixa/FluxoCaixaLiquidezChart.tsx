import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { formatCurrency } from "@/utils/formatters/currency";
import { cn } from "@/lib/utils";
import type { PontoFluxoDia } from "@/services/api/fluxo-caixa.api";

interface FluxoCaixaLiquidezChartProps {
  curvaDiaria: PontoFluxoDia[];
  isFetching: boolean;
}

export function FluxoCaixaLiquidezChart({
  curvaDiaria,
  isFetching,
}: FluxoCaixaLiquidezChartProps) {
  return (
    <Card className="relative rounded-[20px] sm:rounded-[24px] border border-border shadow-xs bg-card p-6 overflow-hidden">
      {isFetching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-surface-alt overflow-hidden z-20">
          <div className="h-full bg-primary w-full animate-pulse" />
        </div>
      )}
      <div className={cn("transition-opacity duration-200", isFetching && "opacity-50")}>
        <CardHeader className="p-0 pb-6">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
            Curva de Liquidez Diária (Dia 01 ao Dia 31)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curvaDiaria} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border" />
                <XAxis dataKey="dia" stroke="currentColor" className="text-muted-foreground" tickLine={false} fontSize={11} />
                <YAxis
                  stroke="currentColor"
                  className="text-muted-foreground"
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as PontoFluxoDia;
                      return (
                        <div className="bg-card p-3 rounded-[14px] shadow-md border border-border text-xs space-y-1">
                          <p className="font-bold text-foreground">Dia {String(data.dia).padStart(2, "0")}</p>
                          <p className="text-muted-foreground font-semibold">
                            Saldo Projetado: {formatCurrency(data.saldo_projetado_acumulado)}
                          </p>
                          <p className="text-foreground font-semibold">
                            Saldo Realizado: {formatCurrency(data.saldo_realizado_acumulado)}
                          </p>
                          {data.eventos.length > 0 && (
                            <div className="pt-2 border-t border-border">
                              <p className="font-semibold text-[10px] text-muted-foreground uppercase">Eventos do Dia:</p>
                              {data.eventos.map((ev: string, idx: number) => (
                                <p key={idx} className="text-muted-foreground text-[11px]">• {ev}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <ReferenceLine
                  y={0}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  label={{ value: "R$ 0,00", fill: "currentColor", fontSize: 10, position: "insideBottomLeft" }}
                />
                <ReferenceLine x={7} stroke="currentColor" className="text-muted-foreground" strokeDasharray="3 3" label={{ value: "Dia 07", fill: "currentColor", fontSize: 10, position: "top" }} />
                <ReferenceLine x={15} stroke="currentColor" className="text-muted-foreground" strokeDasharray="3 3" label={{ value: "Dia 16", fill: "currentColor", fontSize: 10, position: "top" }} />
                <ReferenceLine x={20} stroke="currentColor" className="text-muted-foreground" strokeDasharray="3 3" label={{ value: "Dia 20", fill: "currentColor", fontSize: 10, position: "top" }} />
                <Line
                  type="monotone"
                  dataKey="saldo_projetado_acumulado"
                  name="Saldo Projetado"
                  stroke="hsl(var(--foreground))"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="saldo_realizado_acumulado"
                  name="Saldo Realizado"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
