import { useResumoGeralConvenios } from "@/hooks/api/useConvenioAuditoria";
import { Button } from "@/components/ui/button";
import { ListSkeleton, KpiGridSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    return (
      <div className="space-y-6">
        <KpiGridSkeleton count={4} cols={4} />
        <ListSkeleton />
      </div>
    );
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
      <div className="-mx-4 sm:mx-0 px-4 sm:px-0 flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pb-1 sm:pb-0">
        <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Consumido
            </span>
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
              <Receipt className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatarMoeda(totalGeral)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{totalLancamentos} manutenções / itens</p>
        </div>

        <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ticket Médio
            </span>
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {formatarMoeda(ticketMedioGeral)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Custo médio por ordem de serviço</p>
        </div>

        <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Maior Despesa
            </span>
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
              <Store className="h-5 w-5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
            {maiorConvenio ? maiorConvenio.nome : "—"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {maiorConvenio ? formatarMoeda(maiorConvenio.total_consumido) : "Sem movimentação"}
          </p>
        </div>

        <div className="min-w-[260px] sm:min-w-0 shrink-0 sm:shrink flex-1 sm:flex-initial rounded-[24px] border border-border bg-card shadow-xs p-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Motoboys Atendidos
            </span>
            <div className="w-10 h-10 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            {totalMotoboysAtendidos}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Colaboradores com ordens no mês</p>
        </div>
      </div>

      {distribuicao.length > 0 && (
        <div className="rounded-[24px] border border-border bg-card shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-foreground">Distribuição do Custo por Convênio Parceiro</h3>
            <p className="text-xs text-muted-foreground">Participação de cada parceiro no volume financeiro do mês</p>
          </div>

          <div className="space-y-3">
            <div className="w-full h-3.5 bg-muted rounded-full overflow-hidden flex shadow-inner">
              {distribuicao.map((item, index) => {
                const colors = [
                  "bg-primary",
                  "bg-foreground/80",
                  "bg-muted-foreground",
                  "bg-foreground/50",
                  "bg-foreground/30",
                  "bg-muted-foreground/40",
                  "bg-foreground/15",
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
                  "bg-primary",
                  "bg-foreground/80",
                  "bg-muted-foreground",
                  "bg-foreground/50",
                  "bg-foreground/30",
                  "bg-muted-foreground/40",
                  "bg-foreground/15",
                ];
                const dotColor = colors[index % colors.length];
                return (
                  <div key={item.convenio_id} className="flex items-center gap-1.5">
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
                    <span className="font-medium text-foreground">{item.nome}:</span>
                    <span className="font-bold text-foreground">{item.percentual}%</span>
                    <span className="text-muted-foreground font-normal">({formatarMoeda(item.total)})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Ranking Detalhado de Parceiros</h3>
            <p className="text-xs text-muted-foreground">Performance, volume e ticket médio de cada convênio no período</p>
          </div>

          <div className="rounded-[24px] border border-border overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="py-3.5 pl-5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parceiro</TableHead>
                    <TableHead className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lançamentos</TableHead>
                    <TableHead className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Motoboys</TableHead>
                    <TableHead className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Frota Embu</TableHead>
                    <TableHead className="px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ticket Médio</TableHead>
                    <TableHead className="px-5 py-3.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60 text-sm">
                  {convenios.map((c, index) => (
                    <TableRow
                      key={c.id}
                      onClick={() => navigate(`/convenios/${c.id}`)}
                      className="hover:bg-primary/[0.04] active:bg-primary/[0.08] transition-colors duration-150 cursor-pointer"
                    >
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-[6px] bg-muted text-foreground flex items-center justify-center text-[10px] font-bold">
                          {index + 1}º
                        </span>
                        <span className="font-bold text-foreground">{c.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-foreground font-medium">
                      {c.quantidade_lancamentos} <span className="text-xs text-muted-foreground">({c.total_colaboradores_distintos || 0} boys)</span>
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-foreground font-medium">
                      {formatarMoeda(c.total_motoboys)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-foreground font-medium">
                      {formatarMoeda(c.total_moto_embu_david)}
                    </TableCell>
                    <TableCell className="px-4 py-3.5 text-foreground font-medium text-xs">
                      {formatarMoeda(c.ticket_medio || 0)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-right font-bold text-foreground">
                      {formatarMoeda(c.total_consumido)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Top Colaboradores</h3>
            <p className="text-xs text-muted-foreground">Maior volume de ordens no mês</p>
          </div>

          <div className="rounded-[24px] border border-border bg-card shadow-xs p-5 space-y-3">
            {topColaboradores.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Nenhum lançamento vinculado a colaboradores no mês.
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {topColaboradores.map((colab, idx) => (
                  <div key={colab.colaborador_id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-[6px] bg-muted text-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-bold text-foreground text-xs truncate">
                          {colab.nome_completo}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate pl-7">
                        {colab.quantidade_lancamentos} itens em {colab.convenios_utilizados.join(", ")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-foreground text-xs">
                        {formatarMoeda(colab.total_gasto)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
                        onClick={() => navigate(`/colaboradores/${colab.colaborador_id}`)}
                        title="Ver colaborador"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConveniosRelatoriosTab;
