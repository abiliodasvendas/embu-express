import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLayout, useDateFilters } from "@/hooks";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { useAgingRecebiveis } from "@/hooks/api/useAgingRecebiveis";
import { useIntercompany } from "@/hooks/api/useIntercompany";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { FaturaCliente, StatusFatura, MovimentacaoAvulsa } from "@/types/database";
import { toLocalDateString, formatDateToBR } from "@/utils/formatters/date";
import {
  STATUS_FATURA,
  STATUS_INTERCOMPANY,
  CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";
import {
  FileText,
  Plus,
  Layers,
  ArrowRightLeft,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  DollarSign,
  Building2,
  ExternalLink,
  Landmark,
  Receipt,
  Banknote,
  ArrowDownRight,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";

export default function Faturamento() {
  const {
    setPageTitle,
    openFaturaFormDialog,
    openLoteRecebimentoDialog,
    openAcertoIntercompanyDialog,
    openConfirmationDialog,
    openContasBancariasDialog,
    openDespesaFormDialog,
    openMovimentacaoAvulsaDialog,
  } = useLayout();

  useEffect(() => {
    setPageTitle("Faturamento & Contas a Receber");
  }, [setPageTitle]);

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();

  const { selectedMes: mes, setSelectedMes: setMes, selectedAno: ano, setSelectedAno: setAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
    syncWithUrl: true,
  });

  const [quinzenaFiltro, setQuinzenaFiltro] = useState<string>("todas");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [tipoMovimentacaoFiltro, setTipoMovimentacaoFiltro] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<string>("faturas");

  const filtrosFatura = useMemo(() => {
    const filtros: {
      mes?: number;
      ano?: number;
      quinzena?: number;
      status?: StatusFatura;
    } = {
      mes,
      ano,
    };
    if (quinzenaFiltro !== "todas") {
      filtros.quinzena = Number(quinzenaFiltro);
    }
    if (statusFiltro !== "todos") {
      filtros.status = statusFiltro as StatusFatura;
    }
    return filtros;
  }, [mes, ano, quinzenaFiltro, statusFiltro]);

  const { faturas, isLoading, deleteMutation, refetch: refetchFaturas } = useFaturas(filtrosFatura);
  const { data: aging, isLoading: isLoadingAging } = useAgingRecebiveis(mes, ano);
  const [agingFaixaFiltro, setAgingFaixaFiltro] = useState<string | null>(null);

  const faturasExibidas = useMemo(() => {
    if (!agingFaixaFiltro) return faturas;
    const hojeDate = new Date();

    return faturas.filter((f) => {
      if (f.status === STATUS_FATURA.LIQUIDADA || f.status === STATUS_FATURA.CANCELADA) {
        return false;
      }
      const saldo = (f.valor_faturado || 0) - (f.valor_pago || 0);
      if (saldo <= 0) return false;

      const venc = new Date(`${f.data_vencimento}T12:00:00Z`);
      const diffMs = hojeDate.getTime() - venc.getTime();
      const diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (agingFaixaFiltro === "A_VENCER") {
        return diasAtraso <= 0;
      }
      if (agingFaixaFiltro === "ATRASO_1_15") {
        return diasAtraso >= 1 && diasAtraso <= 15;
      }
      if (agingFaixaFiltro === "ATRASO_16_30") {
        return diasAtraso >= 16 && diasAtraso <= 30;
      }
      if (agingFaixaFiltro === "ATRASO_MAIOR_30") {
        return diasAtraso > 30;
      }
      return true;
    });
  }, [faturas, agingFaixaFiltro]);

  const { transferencias, matrizSaldos, isLoadingTransferencias, isLoadingMatriz, refetch: refetchIntercompany } = useIntercompany();
  const {
    movimentacoes,
    isLoading: isLoadingMovimentacoes,
    deleteMutation: deleteMovimentacaoMutation,
    refetch: refetchMovimentacoes,
  } = useMovimentacoesAvulsas({ mes, ano });

  const movimentacoesFiltradas = useMemo(() => {
    if (tipoMovimentacaoFiltro === "todos") return movimentacoes;
    return movimentacoes.filter((m) => m.tipo_movimentacao === tipoMovimentacaoFiltro);
  }, [movimentacoes, tipoMovimentacaoFiltro]);

  const kpisAvulsas = useMemo(() => {
    let totalEntradas = 0;
    let totalSaidas = 0;
    for (const m of movimentacoes) {
      if (m.tipo_movimentacao === "ENTRADA") {
        totalEntradas += Number(m.valor || 0);
      } else {
        totalSaidas += Number(m.valor || 0);
      }
    }
    const saldoLiquido = totalEntradas - totalSaidas;
    return { totalEntradas, totalSaidas, saldoLiquido, totalQtd: movimentacoes.length };
  }, [movimentacoes]);

  const handleDeleteMovimentacao = (mov: MovimentacaoAvulsa) => {
    openConfirmationDialog({
      title: "Excluir Movimentação Avulsa",
      description: `Tem certeza que deseja excluir o lançamento "${mov.descricao}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(mov.valor)}?`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMovimentacaoMutation.mutateAsync(mov.id);
      },
    });
  };

  const kpis = useMemo(() => {
    let totalFaturado = 0;
    let totalRecebido = 0;
    let totalPendente = 0;
    let totalVencido = 0;
    const hojeStr = toLocalDateString();

    for (const f of faturas) {
      if (f.status !== STATUS_FATURA.CANCELADA) {
        totalFaturado += f.valor_faturado || 0;
        totalRecebido += f.valor_pago || 0;
        const saldo = (f.valor_faturado || 0) - (f.valor_pago || 0);
        if (saldo > 0) {
          totalPendente += saldo;
          if (f.data_vencimento < hojeStr) {
            totalVencido += saldo;
          }
        }
      }
    }

    return { totalFaturado, totalRecebido, totalPendente, totalVencido };
  }, [faturas]);

  const handleDeleteFatura = (fatura: FaturaCliente) => {
    openConfirmationDialog({
      title: "Excluir Fatura",
      description: `Tem certeza que deseja excluir a fatura #${fatura.id.substring(0, 8)} de ${fatura.cliente?.nome_fantasia || "Cliente"}?`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(fatura.id);
      },
    });
  };

  const getStatusBadge = (status: StatusFatura) => {
    switch (status) {
      case STATUS_FATURA.EM_MEDICAO:
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Em Medição</Badge>;
      case STATUS_FATURA.AGUARDANDO_APROVACAO:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Aguardando Aprovação</Badge>;
      case STATUS_FATURA.EMITIDA_PENDENTE:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Aguardando Pagamento</Badge>;
      case STATUS_FATURA.PAGO_PARCIAL:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pago uma Parte</Badge>;
      case STATUS_FATURA.LIQUIDADA:
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Quitado / Recebido</Badge>;
      case STATUS_FATURA.CANCELADA:
        return <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Faturamento & Contas a Receber</h1>
            <p className="text-xs text-gray-500">
              Controle de cobranças quinzenais dos clientes e acertos automáticos entre empresas
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openContasBancariasDialog()}
            className="h-9 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Landmark className="h-4 w-4 text-indigo-600" />
            Contas Bancárias
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openLoteRecebimentoDialog({ onSuccess: () => { refetchFaturas(); refetchIntercompany(); } })}
            className="h-9 gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          >
            <Layers className="h-4 w-4" />
            Liquidação em Lote
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openDespesaFormDialog()}
            className="h-9 gap-1.5 border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          >
            <Receipt className="h-4 w-4" />
            Lançar Despesa
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openMovimentacaoAvulsaDialog({ onSuccess: () => refetchMovimentacoes() })}
            className="h-9 gap-1.5 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
          >
            <Banknote className="h-4 w-4" />
            Lançamento Avulso
          </Button>
          <Button
            size="sm"
            onClick={() => openFaturaFormDialog({ onSuccess: () => refetchFaturas() })}
            className="h-9 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Plus className="h-4 w-4" />
            Nova Fatura
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl">
          <TabsTrigger value="faturas" className="gap-2">
            <FileText className="h-4 w-4" />
            Faturas dos Clientes
          </TabsTrigger>
          <TabsTrigger value="intercompany" className="gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Acerto Entre Nossas Empresas ({transferencias.filter(t => t.status === "PENDENTE_ACERTO").length} pendentes)
          </TabsTrigger>
          <TabsTrigger value="avulsas" className="gap-2">
            <Banknote className="h-4 w-4" />
            Movimentações Avulsas ({movimentacoes.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faturas" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Faturado</span>
                <p className="text-lg font-black text-slate-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalFaturado)}
                </p>
                <p className="text-[10px] text-gray-500">Mês {mes}/{ano}</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Recebido / Baixado</span>
                <p className="text-lg font-black text-emerald-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalRecebido)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {kpis.totalFaturado > 0 ? `${Math.round((kpis.totalRecebido / kpis.totalFaturado) * 100)}% quitado` : "0%"}
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">Saldo a Receber</span>
                <p className="text-lg font-black text-amber-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalPendente)}
                </p>
                <p className="text-[10px] text-gray-500">Pendente no período</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Em Atraso</span>
                <p className="text-lg font-black text-rose-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpis.totalVencido)}
                </p>
                <p className="text-[10px] text-rose-500">Vencidas e não quitadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Curva de Vencimentos & Risco de Liquidez (Aging List) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <TrendingDown className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">
                    Curva de Vencimentos & Risco de Liquidez (Aging List)
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Distribuição de cobranças por tempo de atraso e identificação de glosas operacionais
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {aging?.total_glosas_periodo && aging.total_glosas_periodo > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span>Glosas no Período: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(aging.total_glosas_periodo)}</span>
                  </div>
                ) : null}

                <div className="px-3.5 py-1.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2">
                  <span className="text-[11px] font-bold text-rose-700 uppercase">Capital Retido na Rua:</span>
                  <span className="text-sm font-black text-rose-700">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(aging?.capital_giro_retido_rua || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Faixas de Aging Interativas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aging?.faixas.map((f) => {
                const isSelected = agingFaixaFiltro === f.faixa;
                const isCritical = f.faixa === "ATRASO_MAIOR_30" && f.valor_total > 0;

                let badgeColor = "border-slate-200 hover:border-slate-300 bg-slate-50/50";
                let textColor = "text-slate-700";
                let dotColor = "bg-slate-400";

                if (f.faixa === "A_VENCER") {
                  badgeColor = isSelected ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-blue-300 bg-white";
                  textColor = "text-blue-700";
                  dotColor = "bg-blue-500";
                } else if (f.faixa === "ATRASO_1_15") {
                  badgeColor = isSelected ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20" : "border-slate-200 hover:border-amber-300 bg-white";
                  textColor = "text-amber-700";
                  dotColor = "bg-amber-500";
                } else if (f.faixa === "ATRASO_16_30") {
                  badgeColor = isSelected ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20" : "border-slate-200 hover:border-orange-300 bg-white";
                  textColor = "text-orange-700";
                  dotColor = "bg-orange-500";
                } else if (f.faixa === "ATRASO_MAIOR_30") {
                  badgeColor = isSelected ? "border-rose-600 bg-rose-50/80 ring-2 ring-rose-600/20" : "border-rose-200 hover:border-rose-400 bg-rose-50/30";
                  textColor = "text-rose-700";
                  dotColor = "bg-rose-600";
                }

                return (
                  <button
                    key={f.faixa}
                    type="button"
                    onClick={() => setAgingFaixaFiltro(isSelected ? null : f.faixa)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${badgeColor}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${dotColor} ${isCritical ? "animate-pulse" : ""}`} />
                        {f.descricao}
                      </span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold">
                        {f.quantidade_faturas} fat.
                      </Badge>
                    </div>
                    <div className={`text-base font-black ${textColor}`}>
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.valor_total)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {isSelected ? "Filtro ativo (clique para limpar)" : "Clique para filtrar tabela"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700">Filtros:</span>
            </div>

            <Select value={String(mes)} onValueChange={(val) => setMes(Number(val))}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {new Date(2000, m - 1, 1).toLocaleString("pt-BR", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(ano)} onValueChange={(val) => setAno(Number(val))}>
              <SelectTrigger className="w-[90px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
                  <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={quinzenaFiltro} onValueChange={setQuinzenaFiltro}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas Quinzenas</SelectItem>
                <SelectItem value="1">1ª Quinzena (01-15)</SelectItem>
                <SelectItem value="2">2ª Quinzena (16-31)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
              <SelectTrigger className="w-[160px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value={STATUS_FATURA.EM_MEDICAO}>Em Medição</SelectItem>
                <SelectItem value={STATUS_FATURA.AGUARDANDO_APROVACAO}>Aguardando Aprovação</SelectItem>
                <SelectItem value={STATUS_FATURA.EMITIDA_PENDENTE}>Aguardando Pagamento</SelectItem>
                <SelectItem value={STATUS_FATURA.PAGO_PARCIAL}>Pago uma Parte</SelectItem>
                <SelectItem value={STATUS_FATURA.LIQUIDADA}>Quitado / Recebido</SelectItem>
                <SelectItem value={STATUS_FATURA.CANCELADA}>Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {agingFaixaFiltro && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-3.5 py-2 rounded-xl text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  Filtro de Aging ativo: <strong>{aging?.faixas.find((item) => item.faixa === agingFaixaFiltro)?.descricao}</strong> ({faturasExibidas.length} {faturasExibidas.length === 1 ? "fatura encontrada" : "faturas encontradas"})
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setAgingFaixaFiltro(null)}
                className="h-6 px-2.5 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-100"
              >
                Limpar Filtro
              </Button>
            </div>
          )}

          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Fatura / NF</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">CNPJ Emissor</th>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4 text-right">Valor Total</th>
                    <th className="py-3 px-4 text-right">Valor Pago</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        Carregando faturas...
                      </td>
                    </tr>
                  ) : faturasExibidas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-400">
                        Nenhuma fatura encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    faturasExibidas.map((f) => {
                      const hoje = new Date();
                      const hojeStr = hoje.toISOString().split("T")[0];
                      const saldoPendente = (f.valor_faturado || 0) - (f.valor_pago || 0);
                      const isVencido = f.status !== STATUS_FATURA.LIQUIDADA && f.status !== STATUS_FATURA.CANCELADA && f.data_vencimento < hojeStr;

                      let diasAtraso = 0;
                      if (isVencido) {
                        const venc = new Date(`${f.data_vencimento}T12:00:00Z`);
                        const diffMs = hoje.getTime() - venc.getTime();
                        diasAtraso = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                      }

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            #{f.id.substring(0, 8)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {f.cliente?.nome_fantasia || `Cliente #${f.cliente_id}`}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {f.empresa?.nome_fantasia || "CNPJ"}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            Q{f.quinzena} ({f.mes_competencia}/{f.ano_competencia})
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <span className={isVencido ? "font-bold text-rose-600 flex items-center gap-1" : "text-gray-700"}>
                                {isVencido && <AlertCircle className="h-3 w-3 shrink-0" />}
                                {formatDateToBR(f.data_vencimento)}
                              </span>
                              {isVencido && diasAtraso > 0 && (
                                <span className="text-[10px] text-rose-600 font-medium block">
                                  {diasAtraso} {diasAtraso === 1 ? "dia" : "dias"} de atraso
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.valor_faturado)}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.valor_pago || 0)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {getStatusBadge(f.status)}
                              {f.valor_glosa && f.valor_glosa > 0 ? (
                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-800 border-amber-300 font-semibold">
                                  Glosa: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.valor_glosa)}
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-blue-600"
                                onClick={() => openFaturaFormDialog({ faturaToEdit: f, onSuccess: () => refetchFaturas() })}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-gray-500 hover:text-rose-600"
                                onClick={() => handleDeleteFatura(f)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
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

        <TabsContent value="intercompany" className="space-y-6">
          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">
                    Acerto Entre Nossas Empresas (Matriz de Saldos)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Dinheiro que um CNPJ recebeu no lugar do outro entre as empresas do grupo Embu Express.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMatriz ? (
                <p className="text-xs text-gray-400 py-4 text-center">Calculando saldos da matriz...</p>
              ) : matrizSaldos.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  Todos os saldos entre as empresas estão compensados e equilibrados! Nenhum acerto pendente.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {matrizSaldos.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                          Recebeu o dinheiro: {item.empresa_devedora?.nome_fantasia}
                        </span>
                        <ArrowRightLeft className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Dona da Fatura: {item.empresa_credora?.nome_fantasia}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                        <span className="text-[11px] font-bold text-gray-500 uppercase">Valor a Repassar:</span>
                        <span className="text-base font-black text-indigo-700">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.saldo_devedor_liquido)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Histórico de Repasses e Acertos Entre Empresas
              </CardTitle>
              <CardDescription className="text-xs">
                Registros gerados automaticamente quando um cliente paga faturas de um CNPJ na conta de outro.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-gray-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">Data Origem</th>
                    <th className="py-3 px-4">Empresa Devedora</th>
                    <th className="py-3 px-4">Empresa Credora</th>
                    <th className="py-3 px-4">Motivo / Descrição</th>
                    <th className="py-3 px-4 text-right">Valor Mútuo</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingTransferencias ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Carregando transferências...
                      </td>
                    </tr>
                  ) : transferencias.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        Nenhuma transferência intercompany registrada.
                      </td>
                    </tr>
                  ) : (
                    transferencias.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-gray-700">{formatDateToBR(t.data_fato_gerador)}</td>
                        <td className="py-3 px-4 font-semibold text-rose-700">
                          {t.empresa_devedora?.nome_fantasia || "CNPJ"}
                        </td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {t.empresa_credora?.nome_fantasia || "CNPJ"}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-xs truncate">
                          {t.observacao || "Repasse de recebimento de cliente"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.valor)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.status === STATUS_INTERCOMPANY.COMPENSADO ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Acertado ({t.data_acerto ? formatDateToBR(t.data_acerto) : ""})
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              Pendente Acerto
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {t.status === STATUS_INTERCOMPANY.PENDENTE_ACERTO && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                              onClick={() => openAcertoIntercompanyDialog({ transferencia: t, onSuccess: () => refetchIntercompany() })}
                            >
                              Registrar Acerto
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="avulsas" className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Entradas Avulsas</span>
                <p className="text-lg font-black text-emerald-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpisAvulsas.totalEntradas)}
                </p>
                <p className="text-[10px] text-gray-500">Fretes à vista, rendimentos, etc.</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Saídas Avulsas</span>
                <p className="text-lg font-black text-rose-700">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpisAvulsas.totalSaidas)}
                </p>
                <p className="text-[10px] text-gray-500">Despesas diretas, tarifas</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Saldo Líquido Avulso</span>
                <p className={`text-lg font-black ${kpisAvulsas.saldoLiquido >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(kpisAvulsas.saldoLiquido)}
                </p>
                <p className="text-[10px] text-gray-500">Impacto direto no caixa</p>
              </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
              <CardContent className="p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operações</span>
                <p className="text-lg font-black text-slate-900">{kpisAvulsas.totalQtd}</p>
                <p className="text-[10px] text-gray-500">Mês {mes}/{ano}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-100 shadow-sm">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Extrato de Movimentações Avulsas</CardTitle>
                <CardDescription className="text-xs">
                  Lançamentos atípicos que afetam diretamente o saldo bancário e o DRE da empresa
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select value={tipoMovimentacaoFiltro} onValueChange={setTipoMovimentacaoFiltro}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos" className="text-xs">Todas as Operações</SelectItem>
                    <SelectItem value="ENTRADA" className="text-xs">Apenas Entradas</SelectItem>
                    <SelectItem value="SAIDA" className="text-xs">Apenas Saídas</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  onClick={() => openMovimentacaoAvulsaDialog({ onSuccess: () => refetchMovimentacoes() })}
                  className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo Lançamento
                </Button>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Descrição</th>
                    <th className="py-3 px-4">Empresa (CNPJ)</th>
                    <th className="py-3 px-4">Conta Bancária</th>
                    <th className="py-3 px-4 text-right">Valor</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingMovimentacoes ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        Carregando movimentações avulsas...
                      </td>
                    </tr>
                  ) : movimentacoesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        Nenhuma movimentação avulsa encontrada na competência selecionada.
                      </td>
                    </tr>
                  ) : (
                    movimentacoesFiltradas.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-gray-700 whitespace-nowrap">
                          {formatDateToBR(m.data_movimentacao)}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {m.tipo_movimentacao === "ENTRADA" ? (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                              <ArrowDownRight className="w-3 h-3" /> Entrada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1">
                              <ArrowUpRight className="w-3 h-3" /> Saída
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                          {CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[m.categoria] || m.categoria}
                        </td>
                        <td className="py-3 px-4 text-gray-800 max-w-xs truncate font-medium">
                          {m.descricao}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                          {m.empresa?.nome_fantasia || "Empresa"}
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {m.conta_bancaria ? (
                            <span>{m.conta_bancaria.banco_nome} {m.conta_bancaria.conta ? `(Cc: ${m.conta_bancaria.conta})` : ""}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                          m.tipo_movimentacao === "ENTRADA" ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          {m.tipo_movimentacao === "ENTRADA" ? "+ " : "- "}
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(m.valor)}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                              onClick={() => openMovimentacaoAvulsaDialog({ movimentacaoToEdit: m, onSuccess: () => refetchMovimentacoes() })}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                              onClick={() => handleDeleteMovimentacao(m)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
