import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useFluxoCaixa } from "@/hooks/api/useFluxoCaixa";
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
import {
  Wallet,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  Edit2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

interface FluxoCaixaTabProps {
  mes: number;
  ano: number;
}

export function FluxoCaixaTab({ mes, ano }: FluxoCaixaTabProps) {
  const { fluxo, isLoading, isError, setSaldoInicialMutation } = useFluxoCaixa(mes, ano);
  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [saldoInput, setSaldoInput] = useState<string>("");

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
  };

  const handleSalvarSaldoInicial = async () => {
    const valor = parseFloat(saldoInput.replace(/\./g, "").replace(",", "."));
    if (isNaN(valor)) {
      toast.error("Insira um valor numérico válido");
      return;
    }

    try {
      await setSaldoInicialMutation.mutateAsync({ saldoInicial: valor });
      toast.success("Saldo inicial consolidado atualizado com sucesso!");
      setIsEditingSaldo(false);
    } catch {
      toast.error("Erro ao atualizar saldo inicial");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl border-gray-100 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !fluxo) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center text-center p-8 border rounded-2xl bg-red-50 text-red-600 border-red-200">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="font-semibold">Erro ao carregar projeção de fluxo de caixa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* 4 Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Inicial */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Saldo Inicial (Dia 01)
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isEditingSaldo ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  className="h-8 text-sm font-bold"
                  placeholder="Ex: 50000.00"
                  value={saldoInput}
                  onChange={(e) => setSaldoInput(e.target.value)}
                />
                <Button size="sm" className="h-8 px-2" onClick={handleSalvarSaldoInicial}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-2xl font-black text-gray-900">
                  {formatarMoeda(fluxo.saldo_inicial)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
                  onClick={() => {
                    setSaldoInput(String(fluxo.saldo_inicial));
                    setIsEditingSaldo(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">Base de partida consolidada</p>
          </CardContent>
        </Card>

        {/* Saldo Retido para Convênios (Alerta Travado) */}
        <Card className="rounded-2xl border-amber-200 shadow-sm bg-amber-50/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Saldo Retido p/ Convênios
            </CardTitle>
            <Lock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-900">
              {formatarMoeda(fluxo.saldo_retido_convenios)}
            </div>
            <p className="text-[11px] font-medium text-amber-700 mt-1">
              Descontado dia 07 • Travado p/ dia 15
            </p>
          </CardContent>
        </Card>

        {/* Total Entradas vs Saídas */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Entradas vs Saídas
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" /> {formatarMoeda(fluxo.total_entradas_projetadas)}
            </div>
            <div className="text-sm font-bold text-red-600 flex items-center gap-1 mt-0.5">
              <ArrowDownRight className="h-3.5 w-3.5" /> {formatarMoeda(fluxo.total_saidas_projetadas)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Projeção total do período</p>
          </CardContent>
        </Card>

        {/* Saldo Projetado Final */}
        <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Saldo Projetado (Fim do Mês)
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-black ${
                fluxo.saldo_final_projetado >= 0 ? "text-gray-900" : "text-red-600"
              }`}
            >
              {formatarMoeda(fluxo.saldo_final_projetado)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Estimativa de fechamento</p>
          </CardContent>
        </Card>
      </div>

      {/* Marcadores de Eventos Críticos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-red-50/60 border border-red-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-xs">
            07
          </div>
          <div>
            <p className="text-xs font-bold text-red-900 leading-tight">Desembolso de Salários</p>
            <p className="text-[10px] text-red-600 leading-tight">Saldo Líquido da Folha Anterior</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
            15
          </div>
          <div>
            <p className="text-xs font-bold text-amber-900 leading-tight">Desembolso Convênios</p>
            <p className="text-[10px] text-amber-600 leading-tight">Oficinas e Postos Parceiros</p>
          </div>
        </div>

        <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
            20
          </div>
          <div>
            <p className="text-xs font-bold text-blue-900 leading-tight">Vales + DAS</p>
            <p className="text-[10px] text-blue-600 leading-tight">Adiantamento Quinzenal e Simples</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Linha Diário */}
      <Card className="rounded-3xl border-gray-100 shadow-sm bg-white p-6">
        <CardHeader className="p-0 pb-6">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-gray-800">
            Curva de Liquidez Diária (Dia 01 ao Dia 31)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fluxo.curva_diaria} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="dia" stroke="#94a3b8" tickLine={false} fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  tickLine={false}
                  fontSize={11}
                  tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-2xl shadow-xl border border-gray-100 text-xs space-y-1">
                          <p className="font-black text-gray-900">Dia {String(data.dia).padStart(2, "0")}</p>
                          <p className="text-blue-600 font-bold">
                            Saldo Projetado: {formatarMoeda(data.saldo_projetado_acumulado)}
                          </p>
                          <p className="text-emerald-600 font-bold">
                            Saldo Realizado: {formatarMoeda(data.saldo_realizado_acumulado)}
                          </p>
                          {data.eventos.length > 0 && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="font-bold text-[10px] text-gray-400 uppercase">Eventos do Dia:</p>
                              {data.eventos.map((ev: string, idx: number) => (
                                <p key={idx} className="text-gray-600 text-[11px]">• {ev}</p>
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
                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" label={{ value: "R$ 0,00 (Limite Zero)", fill: "#64748b", fontSize: 10, position: "insideBottomLeft" }} />
                <ReferenceLine x={7} stroke="#ef4444" strokeDasharray="3 3" label={{ value: "Dia 07 (Salário Restante)", fill: "#ef4444", fontSize: 10, position: "top" }} />
                <ReferenceLine x={15} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Dia 15 (Postos/Oficinas)", fill: "#f59e0b", fontSize: 10, position: "top" }} />
                <ReferenceLine x={20} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: "Dia 20 (Vales/Impostos)", fill: "#3b82f6", fontSize: 10, position: "top" }} />
                <Line
                  type="monotone"
                  dataKey="saldo_projetado_acumulado"
                  name="Saldo Projetado"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="saldo_realizado_acumulado"
                  name="Saldo Realizado"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Detalhamento Diário */}
      <Card className="rounded-3xl border-gray-100 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-50 bg-gray-50/50 px-6 py-4">
          <CardTitle className="text-sm font-black uppercase tracking-wider text-gray-800">
            Detalhamento Diário das Movimentações
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50 text-xs">
            {fluxo.curva_diaria.map((ponto) => (
              <div
                key={ponto.dia}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/80 transition-all ${
                  ponto.dia === 7 || ponto.dia === 15 || ponto.dia === 20 ? "bg-blue-50/20 font-bold" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                    {String(ponto.dia).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">Dia {String(ponto.dia).padStart(2, "0")}</p>
                    {ponto.eventos.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {ponto.eventos.map((ev, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 font-normal">
                            {ev}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400">Sem eventos programados</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 mt-2 sm:mt-0 text-right">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Entradas</span>
                    <span className="text-emerald-600 font-bold">
                      {ponto.entradas_projetadas > 0 ? `+ ${formatarMoeda(ponto.entradas_projetadas)}` : "-"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Saídas</span>
                    <span className="text-red-600 font-bold">
                      {ponto.saidas_projetadas > 0 ? `- ${formatarMoeda(ponto.saidas_projetadas)}` : "-"}
                    </span>
                  </div>
                  <div className="min-w-28">
                    <span className="text-[10px] text-gray-400 uppercase font-black block">Saldo Acumulado</span>
                    <span
                      className={`font-black ${
                        ponto.saldo_projetado_acumulado >= 0 ? "text-gray-900" : "text-red-600"
                      }`}
                    >
                      {formatarMoeda(ponto.saldo_projetado_acumulado)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
