import { useResumoGeralConvenios } from "@/hooks/api/useConvenioAuditoria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { Receipt, Users, TrendingUp, Store, ChevronRight, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ConveniosRelatoriosTabProps {
  mes: number;
  ano: number;
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
};

export function ConveniosRelatoriosTab({ mes, ano }: ConveniosRelatoriosTabProps) {
  const navigate = useNavigate();
  const { data: resumo, isLoading } = useResumoGeralConvenios(mes, ano);

  if (isLoading) {
    return <ListSkeleton />;
  }

  const totais = resumo?.totais;
  const convenios = [...(resumo?.convenios || [])].sort((a, b) => b.total_consumido - a.total_consumido);
  const topColaboradores = resumo?.top_colaboradores || [];
  const distribuicao = resumo?.distribuicao_percentual || [];

  const maiorConvenio = convenios.length > 0 && convenios[0].total_consumido > 0 ? convenios[0] : null;
  const totalGeral = totais?.total_geral_consumido || 0;
  const totalLancamentos = convenios.reduce((acc, c) => acc + c.quantidade_lancamentos, 0);
  const ticketMedioGeral = totalLancamentos > 0 ? totalGeral / totalLancamentos : 0;
  const totalMotoboysAtendidos = new Set(topColaboradores.map((c) => c.colaborador_id)).size;

  if (totalGeral === 0 && convenios.length === 0) {
    return (
      <UnifiedEmptyState
        icon={BarChart3}
        title="Nenhum dado analítico no período"
        description="Não foram encontrados lançamentos de convênio para o mês e ano selecionados."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Total Consumido
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900 tracking-tight">
              {formatarMoeda(totalGeral)}
            </div>
            <p className="text-xs text-gray-500 mt-1">{totalLancamentos} manutenções / itens</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-purple-100 bg-purple-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Ticket Médio
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-700 tracking-tight">
              {formatarMoeda(ticketMedioGeral)}
            </div>
            <p className="text-xs text-purple-800/80 mt-1">Custo médio por ordem de serviço</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-amber-100 bg-amber-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Maior Despesa
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Store className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-black text-amber-900 tracking-tight truncate">
              {maiorConvenio ? maiorConvenio.nome : "—"}
            </div>
            <p className="text-xs text-amber-800/80 mt-1">
              {maiorConvenio ? formatarMoeda(maiorConvenio.total_consumido) : "Sem movimentação"}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-100 bg-emerald-50/20 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Motoboys Atendidos
            </CardTitle>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {totalMotoboysAtendidos}
            </div>
            <p className="text-xs text-emerald-800/80 mt-1">Colaboradores com ordens no mês</p>
          </CardContent>
        </Card>
      </div>

      {distribuicao.length > 0 && (
        <Card className="rounded-2xl border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Distribuição do Custo por Loja Parceira</h3>
              <p className="text-xs text-gray-500">Participação de cada parceiro no volume financeiro do mês</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="w-full h-3.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
              {distribuicao.map((item, index) => {
                const colors = [
                  "bg-blue-600",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-purple-600",
                  "bg-rose-500",
                  "bg-cyan-500",
                  "bg-indigo-500",
                ];
                const colorClass = colors[index % colors.length];
                return (
                  <div
                    key={item.convenio_id}
                    style={{ width: `${Math.max(item.percentual, 1)}%` }}
                    className={cn(colorClass, "h-full transition-all")}
                    title={`${item.nome}: ${item.percentual}% (${formatarMoeda(item.total)})`}
                  />
                );
              })}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {distribuicao.map((item, index) => {
                const colors = [
                  "bg-blue-600",
                  "bg-emerald-500",
                  "bg-amber-500",
                  "bg-purple-600",
                  "bg-rose-500",
                  "bg-cyan-500",
                  "bg-indigo-500",
                ];
                const dotColor = colors[index % colors.length];
                return (
                  <div key={item.convenio_id} className="flex items-center gap-1.5">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
                    <span className="font-medium text-gray-700">{item.nome}:</span>
                    <span className="font-bold text-gray-900">{item.percentual}%</span>
                    <span className="text-gray-400 font-normal">({formatarMoeda(item.total)})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Ranking Detalhado de Parceiros</h3>
              <p className="text-xs text-gray-500">Performance, volume e ticket médio de cada convênio no período</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr className="border-b border-gray-100 text-left">
                    <th className="py-3.5 pl-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Parceiro</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Lançamentos</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Motoboys</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Frota Embu</th>
                    <th className="px-4 py-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {convenios.map((c, index) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/convenios/${c.id}`)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 pl-5">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                            {index + 1}º
                          </span>
                          <span className="font-bold text-gray-900">{c.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        {c.quantidade_lancamentos} <span className="text-xs text-gray-400">({c.total_colaboradores_distintos || 0} boys)</span>
                      </td>
                      <td className="px-4 py-3.5 text-blue-600 font-bold">
                        {formatarMoeda(c.total_motoboys)}
                      </td>
                      <td className="px-4 py-3.5 text-amber-700 font-bold">
                        {formatarMoeda(c.total_moto_embu_david)}
                      </td>
                      <td className="px-4 py-3.5 text-purple-700 font-medium text-xs">
                        {formatarMoeda(c.ticket_medio || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-gray-900">
                        {formatarMoeda(c.total_consumido)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Top Colaboradores</h3>
              <p className="text-xs text-gray-500">Maior volume de ordens no mês</p>
            </div>
          </div>

          <Card className="rounded-2xl border-gray-100 shadow-sm p-4 space-y-3">
            {topColaboradores.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                Nenhum lançamento vinculado a colaboradores no mês.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {topColaboradores.map((colab, idx) => (
                  <div key={colab.colaborador_id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-gray-900 text-xs truncate">
                          {colab.nome_completo}
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate pl-5.5">
                        {colab.quantidade_lancamentos} itens em {colab.convenios_utilizados.join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-gray-900 text-xs">
                        {formatarMoeda(colab.total_gasto)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg text-gray-400 hover:text-blue-600"
                        onClick={() => navigate(`/colaboradores/${colab.colaborador_id}`)}
                        title="Ver perfil do colaborador"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ConveniosRelatoriosTab;
