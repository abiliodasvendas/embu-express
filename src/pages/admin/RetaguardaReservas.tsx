import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLayout, useDateFilters } from "@/hooks";
import { useRetaguarda } from "@/hooks/api/useRetaguarda";
import {
  Bike,
  ShieldAlert,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  TrendingDown,
  UserCheck,
  Percent,
  DollarSign,
} from "lucide-react";

export default function RetaguardaReservas() {
  const { setPageTitle, openAlocacaoTemporariaDialog } = useLayout();

  useEffect(() => {
    setPageTitle("Retaguarda Operacional & Risco de Folha");
  }, [setPageTitle]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const { selectedMes: mes, setSelectedMes: setMes, selectedAno: ano, setSelectedAno: setAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const [activeTab, setActiveTab] = useState<string>("monitor");

  const { monitor, isLoadingMonitor, alertas, isLoadingAlertas, refetch } = useRetaguarda(mes, ano);

  const totais = monitor?.totais || {
    total_reservas: 0,
    total_fiscais: 0,
    custo_total_retaguarda: 0,
    prejuizo_total_ociosidade: 0,
  };

  const itens = monitor?.itens || [];

  const [filtroVales, setFiltroVales] = useState<"todos" | "pendentes" | "tratados">("todos");

  const pendentesEmRisco = useMemo(() => {
    return alertas.filter(
      (a) => !a.adiantamento_confirmado && (a.nivel_risco === "RISCO_ALTO" || a.nivel_risco === "RISCO_MEDIO")
    );
  }, [alertas]);

  const alertasFiltrados = useMemo(() => {
    return alertas.filter((a) => {
      if (filtroVales === "pendentes") return !a.adiantamento_confirmado;
      if (filtroVales === "tratados") return a.adiantamento_confirmado;
      return true;
    });
  }, [alertas, filtroVales]);

  const getRiscoBadge = (nivel: "NORMAL" | "RISCO_MEDIO" | "RISCO_ALTO" | "TRATADO_SEGURO" | "AJUSTADO_MARGEM_CRITICA") => {
    switch (nivel) {
      case "TRATADO_SEGURO":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Tratado / Margem Segura</Badge>;
      case "AJUSTADO_MARGEM_CRITICA":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Ajustado / Margem Crítica</Badge>;
      case "RISCO_ALTO":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-300">Risco Alto (Negativo)</Badge>;
      case "RISCO_MEDIO":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300">Risco Médio (&lt; R$ 300)</Badge>;
      case "NORMAL":
      default:
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">Margem Segura</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-100">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Retaguarda & Monitor de Eficiência</h1>
            <p className="text-xs text-gray-500">
              Acompanhamento de coberturas por equipe interna e previsão de risco nos vales do dia 20
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <Select value={String(mes)} onValueChange={(val) => setMes(Number(val))}>
              <SelectTrigger className="w-[110px] h-7 text-xs border-none bg-transparent shadow-none p-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2000, m - 1, 1).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(ano)} onValueChange={(val) => setAno(Number(val))}>
              <SelectTrigger className="w-[75px] h-7 text-xs border-none bg-transparent shadow-none p-0 focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            onClick={() => openAlocacaoTemporariaDialog({ onSuccess: () => refetch() })}
            className="h-9 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold"
          >
            <Plus className="h-4 w-4" />
            Registrar Cobertura
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="monitor" className="gap-2">
            <Bike className="h-4 w-4" />
            Retaguarda (Motoboys Internos)
          </TabsTrigger>
          <TabsTrigger value="risco-vales" className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Alerta de Vales Dia 20
            {pendentesEmRisco.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                {pendentesEmRisco.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Efetivo da Reserva</span>
                <p className="text-lg font-black text-slate-900">
                  {itens.length} Motoboys Internos
                </p>
                <p className="text-[10px] text-gray-500">Reserva de cobertura ativa</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Custo da Equipe</span>
                <p className="text-lg font-black text-slate-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totais.custo_total_retaguarda)}
                </p>
                <p className="text-[10px] text-gray-500">Folha base mensal</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Prejuízo com Ociosidade</span>
                <p className="text-lg font-black text-rose-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totais.prejuizo_total_ociosidade)}
                </p>
                <p className="text-[10px] text-rose-500">Dias parados sem cobertura</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Taxa de Ocupação</span>
                <p className="text-lg font-black text-emerald-700">
                  {totais.custo_total_retaguarda > 0
                    ? `${Math.max(0, Math.round(((totais.custo_total_retaguarda - totais.prejuizo_total_ociosidade) / totais.custo_total_retaguarda) * 100))}%`
                    : "0%"}
                </p>
                <p className="text-[10px] text-gray-500">Aproveitamento operacional</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Desempenho Individual de Alocação
              </CardTitle>
              <CardDescription className="text-xs">
                Dias trabalhados em clientes vs. dias ociosos no ponto de apoio.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Colaborador</th>
                    <th className="py-3 px-4">Função</th>
                    <th className="py-3 px-4">Turno</th>
                    <th className="py-3 px-4 text-right">Salário Base</th>
                    <th className="py-3 px-4 text-center">Dias Úteis</th>
                    <th className="py-3 px-4 text-center">Dias Alocados</th>
                    <th className="py-3 px-4 text-center">Dias Ociosos</th>
                    <th className="py-3 px-4 text-right">Custo Ociosidade</th>
                    <th className="py-3 px-4 text-center">Ocupação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingMonitor ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        Carregando monitor de retaguarda...
                      </td>
                    </tr>
                  ) : itens.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        Nenhum colaborador interno de apoio registrado no período.
                      </td>
                    </tr>
                  ) : (
                    itens.map((item) => {
                      const taxaOcupacao = item.dias_uteis_mes > 0 ? Math.round((item.dias_alocados / item.dias_uteis_mes) * 100) : 0;

                      return (
                        <tr key={item.colaborador_id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {item.nome_completo}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Motoboy Interno
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {item.turno_descricao}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-slate-800">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.salario_mensal)}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-gray-700">
                            {item.dias_uteis_mes} d
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-700">
                            {item.dias_alocados} d
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-rose-600">
                            {item.dias_ociosos} d
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-rose-700">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.prejuizo_ociosidade)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-extrabold ${taxaOcupacao >= 80 ? "bg-emerald-100 text-emerald-800" : taxaOcupacao >= 50 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                              {taxaOcupacao}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risco-vales" className="space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-600" />
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Prevenção de Saldo Negativo na Folha (Vales do Dia 20)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Cruzamento preditivo de faltas e convênios na 1ª quinzena integrado às confirmações de adiantamento da tesouraria.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltroVales("todos")}
                    className={`h-8 px-3 text-xs font-semibold rounded-lg ${filtroVales === "todos" ? "bg-white text-slate-900 shadow-sm" : "text-gray-600 hover:text-slate-900"}`}
                  >
                    Todos ({alertas.length})
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltroVales("pendentes")}
                    className={`h-8 px-3 text-xs font-semibold rounded-lg ${filtroVales === "pendentes" ? "bg-white text-slate-900 shadow-sm" : "text-gray-600 hover:text-slate-900"}`}
                  >
                    Pendentes de Decisão
                    {pendentesEmRisco.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                        {pendentesEmRisco.length}
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiltroVales("tratados")}
                    className={`h-8 px-3 text-xs font-semibold rounded-lg ${filtroVales === "tratados" ? "bg-white text-slate-900 shadow-sm" : "text-gray-600 hover:text-slate-900"}`}
                  >
                    Já Tratados / Pagos ({alertas.filter(a => a.adiantamento_confirmado).length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {isLoadingAlertas ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  Carregando análise de risco de vales...
                </div>
              ) : alertasFiltrados.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center text-xs text-emerald-800">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  {filtroVales === "pendentes"
                    ? "Nenhum adiantamento pendente de decisão para esta competência!"
                    : filtroVales === "tratados"
                    ? "Nenhum adiantamento tratado ou pago até o momento."
                    : "Nenhum colaborador encontrado para a competência."}
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase tracking-wider font-semibold">
                          <th className="py-3 px-4">Colaborador</th>
                          <th className="py-3 px-4 text-right">Salário Base</th>
                          <th className="py-3 px-4 text-right">Vale Previsto</th>
                          <th className="py-3 px-4 text-center">Situação do Vale</th>
                          <th className="py-3 px-4 text-center">Faltas Q1</th>
                          <th className="py-3 px-4 text-right">Desc. Faltas</th>
                          <th className="py-3 px-4 text-right">Convênios Q1</th>
                          <th className="py-3 px-4 text-right">Saldo Proj. Dia 07</th>
                          <th className="py-3 px-4 text-center">Grau de Risco / Decisão</th>
                          <th className="py-3 px-4 text-right">Sugestão Vale Seguro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {alertasFiltrados.map((a) => (
                          <tr key={a.colaborador_id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              {a.nome_completo}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-800">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.salario_base)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-slate-700">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.vale_configurado)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {a.adiantamento_confirmado ? (
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                  Confirmado ({new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.valor_adiantamento_aplicado)})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                  Pendente
                                </Badge>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-rose-600">
                              {a.faltas_1a_quinzena} d
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-rose-700">
                              - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.valor_desconto_faltas)}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-amber-700">
                              - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.convenios_1a_quinzena)}
                            </td>
                            <td className="py-3 px-4 text-right font-black">
                              <span className={a.saldo_projetado_dia_07 < 0 ? "text-rose-600" : a.saldo_projetado_dia_07 < 300 ? "text-amber-700" : "text-slate-800"}>
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.saldo_projetado_dia_07)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getRiscoBadge(a.nivel_risco)}
                            </td>
                            <td className="py-3 px-4 text-right font-black text-indigo-700">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(a.sugestao_vale_seguro)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
