import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FINANCEIRO_STATUS,
  LANCAMENTO_TIPO,
} from "@/constants/financeiro.constants";
import { getMessage } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import { useFinanceiro } from "@/hooks/api/useFinanceiro";
import { useFinanceiroMutations } from "@/hooks/api/useFinanceiroMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useFilters } from "@/hooks/ui/useFilters";
import { cn } from "@/lib/utils";
import { meses } from "@/utils/formatters/constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateTimeToBR } from "@/utils/formatters/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Calendar,
  CheckCircle2,
  CreditCard,
  Info,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useMemo } from "react";

interface FinancialReportViewProps {
  usuarioId?: string;
  colaboradorNome?: string;
  selectedMonth?: number;
  selectedYear?: number;
}

export function FinancialReportView({
  usuarioId,
  colaboradorNome,
  selectedMonth: propMonth,
  selectedYear: propYear,
}: FinancialReportViewProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { can } = usePermissions();
  const {
    selectedMes: internalMonth = new Date().getMonth() + 1,
    setSelectedMes: setSelectedMonth = () => {},
    selectedAno: internalYear = new Date().getFullYear(),
    setSelectedAno: setSelectedYear = () => {},
  } = useFilters({
    mesParam: "mes",
    anoParam: "ano",
  });

  const selectedMonth = propMonth ?? internalMonth;
  const selectedYear = propYear ?? internalYear;

  const {
    data: extrato,
    isLoading,
    refetch,
  } = useFinanceiro(usuarioId || undefined, selectedMonth, selectedYear);

  const { 
    handlePaymentMutation, 
    confirmarAdiantamentoMutation, 
    desconfirmarAdiantamentoMutation,
    desfazerPagamentoMutation
  } = useFinanceiroMutations();

  const monthOptions = useMemo(
    () => meses.map((label, index) => ({ value: index + 1, label })),
    [],
  );

  return (
    <PullToRefreshWrapper
      onRefresh={async () => {
        await refetch();
      }}
    >
      <div className="space-y-6">
        {/* Filtros de Período - Ocultar se passados via props */}
        {!propMonth && !propYear && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50 p-4 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-3 ml-2">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Período de Referência
                </p>
                <p className="text-xs font-bold text-gray-600">
                  Selecione o mês para o cálculo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(selectedMonth)}
                onValueChange={(v) => setSelectedMonth(Number(v))}
              >
                <SelectTrigger className="h-11 w-[140px] rounded-2xl border-none bg-white shadow-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  {meses.map((label, index) => (
                    <SelectItem
                      key={index}
                      value={String(index + 1)}
                      className="font-medium focus:bg-blue-50 focus:text-blue-700 rounded-xl m-1 capitalize"
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(selectedYear)}
                onValueChange={(v) => setSelectedYear(Number(v))}
              >
                <SelectTrigger className="h-11 w-[100px] rounded-2xl border-none bg-white shadow-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                  {[new Date().getFullYear(), new Date().getFullYear() - 1].map(
                    (ano) => (
                      <SelectItem
                        key={ano}
                        value={String(ano)}
                        className="font-medium focus:bg-blue-50 focus:text-blue-700 rounded-xl m-1"
                      >
                        {ano}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {!usuarioId ? (
          <UnifiedEmptyState
            icon={Wallet}
            title="Selecione um colaborador"
            description="Escolha um colaborador para visualizar o rascunho do fechamento financeiro."
          />
        ) : isLoading ? (
          <ListSkeleton />
        ) : extrato ? (
          <div className="animate-in fade-in duration-500 space-y-8">
            {/* Status e Ações */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-widest",
                    extrato.status === FINANCEIRO_STATUS.PAGO
                      ? "bg-emerald-500 text-white"
                      : "bg-white text-blue-500 hover:bg-white hover:text-blue-600 border-blue-500 border",
                  )}
                >
                  {extrato.status}
                </Badge>
                {extrato.data_pagamento && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Pago em:{" "}
                    {formatDateTimeToBR(extrato.data_pagamento, {
                      includeTime: true,
                    })}
                  </span>
                )}
              </div>

              {extrato.status === FINANCEIRO_STATUS.RASCUNHO &&
                can(PERMISSIONS.FINANCEIRO.PAGAR) && (
                  <div className="flex items-center gap-3">
                    {!extrato.adiantamento_confirmado ? (
                      <Button
                        variant="outline"
                        className="rounded-2xl border-blue-600 text-blue-600 hover:bg-blue-50 font-bold h-11 px-6 shadow-sm transition-all"
                        disabled={confirmarAdiantamentoMutation.isPending}
                        onClick={() => {
                          const valorTotalAdiantamento = extrato.totais?.total_adiantamento ?? 
                            extrato.resumo_por_cliente?.reduce((acc: number, r: any) => acc + Number(r.valores_fixos?.adiantamento_config || 0), 0) ?? 0;

                          openConfirmationDialog({
                            title: "Confirmar Adiantamento",
                            description: `Deseja confirmar o pagamento do adiantamento no valor de ${formatCurrency(valorTotalAdiantamento)}? Ao confirmar, este valor será descontado automaticamente do fechamento final.`,
                            confirmText: "Confirmar",
                            onConfirm: async () => {
                              await confirmarAdiantamentoMutation.mutateAsync({
                                usuarioId,
                                mes: selectedMonth,
                                ano: selectedYear,
                              });
                              closeConfirmationDialog();
                            },
                          });
                        }}
                      >
                        <Wallet className="h-4 w-4 mr-2" />
                        Confirmar Adiantamento
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-11 px-6 transition-all"
                        disabled={desconfirmarAdiantamentoMutation.isPending}
                        onClick={() => {
                          openConfirmationDialog({
                            title: "Desfazer Adiantamento",
                            description: "Deseja remover a confirmação do adiantamento? O valor não será mais descontado do fechamento deste mês.",
                            confirmText: "Remover",
                            variant: "destructive",
                            onConfirm: async () => {
                              await desconfirmarAdiantamentoMutation.mutateAsync({
                                usuarioId,
                                mes: selectedMonth,
                                ano: selectedYear,
                              });
                              closeConfirmationDialog();
                            },
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Desfazer Adiantamento
                      </Button>
                    )}

                    <Button
                      className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                      disabled={handlePaymentMutation.isPending}
                      onClick={() => {
                        openConfirmationDialog({
                          title: getMessage("financeiro.confirmacao.titulo"),
                          description: `${getMessage("financeiro.confirmacao.descricao")} (${formatCurrency(extrato.totais?.saldo_final || 0)})`,
                          confirmText: getMessage("financeiro.confirmacao.botao"),
                          onConfirm: async () => {
                            await handlePaymentMutation.mutateAsync({
                              usuarioId,
                              mes: selectedMonth,
                              ano: selectedYear,
                            });
                            closeConfirmationDialog();
                          },
                        });
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Finalizar e Pagar
                    </Button>
                  </div>
                )}

              {extrato.status === FINANCEIRO_STATUS.PAGO &&
                can(PERMISSIONS.FINANCEIRO.PAGAR) && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      className="rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 font-bold h-11 px-6 transition-all"
                      disabled={desfazerPagamentoMutation.isPending}
                      onClick={() => {
                        openConfirmationDialog({
                          title: "Reabrir Fechamento",
                          description: "Atenção: ao reabrir o fechamento, ele voltará a ser um rascunho. Importante: os valores serão recalculados com base nas informações atuais do cadastro do colaborador (como valor de contrato e bônus), o que pode alterar o resultado final. Deseja continuar?",
                          confirmText: "Sim, Reabrir",
                          variant: "destructive",
                          onConfirm: async () => {
                            await desfazerPagamentoMutation.mutateAsync({
                              usuarioId,
                              mes: selectedMonth,
                              ano: selectedYear,
                            });
                            closeConfirmationDialog();
                          },
                        });
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Desfazer Pagamento
                    </Button>
                  </div>
                )}
            </div>

            {/* Dashboard Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main Balance */}
              <Card className="col-span-1 border-none shadow-xl rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Banknote className="h-24 w-24" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <p className="text-blue-100/70 uppercase font-black tracking-widest text-[10px] mb-3">
                    Saldo Líquido a Pagar
                  </p>
                  <h2 className="text-3xl xl:text-4xl font-black mb-4">
                    {formatCurrency(extrato.totais?.saldo_final || 0)}
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-xl text-[10px] font-bold backdrop-blur-sm border border-white/10">
                    <Info className="h-3.5 w-3.5" />
                    <span>
                      {extrato.status === FINANCEIRO_STATUS.RASCUNHO
                        ? "Cálculo em tempo real"
                        : "Valores confirmados"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Subtotal Turnos */}
              <Card className="border-none shadow-md rounded-[2.5rem] bg-gray-600 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <Calendar className="h-20 w-20" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <p className="text-emerald-100/70 uppercase font-black tracking-widest text-[10px] mb-3">
                    Total de Turnos
                  </p>
                  <h2 className="text-2xl font-black mb-1">
                    {formatCurrency(extrato.totais?.total_turnos || 0)}
                  </h2>
                  <p className="text-[10px] text-emerald-100/60 font-medium">
                    Soma dos turnos (contrato + ocorrências)
                  </p>
                </CardContent>
              </Card>

              {/* Subtotal Avulso */}
              <Card className="border-none shadow-md rounded-[2.5rem] bg-gray-600 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                  <CreditCard className="h-20 w-20" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <p className="text-indigo-100/70 uppercase font-black tracking-widest text-[10px] mb-3">
                    Total Avulso
                  </p>
                  <h2 className="text-2xl font-black mb-1">
                    {formatCurrency(
                      (extrato.totais?.total_avulso || 0) +
                        (extrato.totais?.total_mei || 0),
                    )}
                  </h2>
                  <p className="text-[10px] text-indigo-100/60 font-medium">
                    Lançamentos avulsos + MEI consolidado
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Turn Breakdown Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                <div className="h-1 w-8 bg-blue-600 rounded-full" />
                <h3 className="text-xl font-black text-gray-800 tracking-tight">
                  {getMessage("financeiro.labels.detalhamentoTurno")}
                </h3>
              </div>

              {extrato.resumo_por_cliente?.map((resumo: any, idx: number) => (
                <Card
                  key={idx}
                  className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 transition-all hover:shadow-xl group"
                >
                  {/* Header do Turno */}
                  <div className="bg-gray-50/50 px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group-hover:bg-white transition-colors">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-blue-100 transition-colors">
                        <User className="h-7 w-7 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">
                          {resumo.nome_fantasia}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                          {resumo.dias_ativos_no_mes < resumo.dias_base_mes && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-50 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border-blue-100"
                            >
                              {getMessage("financeiro.labels.criterioProRata")}
                            </Badge>
                          )}
                          {resumo.dias_ativos_no_mes < resumo.dias_base_mes && resumo.valores_fixos?.bonus_config > 0 && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-50 text-amber-600 hover:bg-amber-50 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border-amber-100"
                            >
                              Bônus não aplicado
                            </Badge>
                          )}
                          {(resumo.data_inicio || resumo.data_fim) && (
                            <p className="text-[11px] text-gray-400 font-bold">
                              {resumo.data_inicio
                                ? `Início: ${resumo.data_inicio.split("-").reverse().join("/")}`
                                : ""}
                              {resumo.data_inicio && resumo.data_fim
                                ? " · "
                                : ""}
                              {resumo.data_fim
                                ? `Término: ${resumo.data_fim.split("-").reverse().join("/")}`
                                : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-blue-50/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">
                        Valor do Turno
                      </p>
                      <p className="text-2xl font-black text-blue-600">
                        {formatCurrency(resumo.valor_calculado)}
                      </p>
                    </div>
                  </div>

                  <CardContent className="p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                      {/* Coluna Esquerda: Composição do Cálculo */}
                      <div className="space-y-8">
                        {/* Calendário de Dias Ativos */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">
                              Período de Atuação
                            </span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-bold text-gray-500">
                                Base {resumo.dias_base_mes} dias
                              </span>
                              <Badge className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-[11px] shadow-sm">
                                {resumo.dias_ativos_no_mes} dias ativos
                              </Badge>
                            </div>
                          </div>
                          {resumo.datas_ativas &&
                            resumo.datas_ativas.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {resumo.datas_ativas.map(
                                  (dateString: string) => {
                                    const [, , day] = dateString.split("-");
                                    return (
                                      <div
                                        key={dateString}
                                        className="h-8 w-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 shadow-sm"
                                      >
                                        {day}
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                            )}
                        </div>

                        {/* Composição do Contrato */}
                        <div className="bg-gray-50/50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-l-2 border-blue-600 pl-3">
                            Composição do Contrato
                          </p>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            {resumo.valores_fixos?.contrato > 0 && (
                              <div className="flex justify-between text-[13px] items-center">
                                <span className="text-gray-500 font-medium">
                                  Contrato
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(
                                    resumo.valores_fixos.contrato,
                                  )}
                                </span>
                              </div>
                            )}
                            {resumo.valores_fixos?.bonus > 0 && (
                              <div className="flex justify-between text-[13px] items-center">
                                <span className="text-gray-500 font-medium">
                                  Bônus
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(resumo.valores_fixos.bonus)}
                                </span>
                              </div>
                            )}
                            {resumo.valores_fixos?.ajuda_custo > 0 && (
                              <div className="flex justify-between text-[13px] items-center">
                                <span className="text-gray-500 font-medium">
                                  Ajuda Custo
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(
                                    resumo.valores_fixos.ajuda_custo,
                                  )}
                                </span>
                              </div>
                            )}
                            {resumo.valores_fixos?.aluguel > 0 && (
                              <div className="flex justify-between text-[13px] items-center">
                                <span className="text-gray-500 font-medium">
                                  Aluguel
                                </span>
                                <span className="font-bold text-emerald-600">
                                  {formatCurrency(resumo.valores_fixos.aluguel)}
                                </span>
                              </div>
                            )}
                            {resumo.valores_fixos?.adiantamento_config > 0 && extrato.adiantamento_confirmado && (
                              <div className="flex justify-between text-[13px] items-center">
                                <span className="text-red-400 font-bold italic">
                                  Adiantamento
                                </span>
                                <span className="font-bold text-red-600">
                                  -
                                  {formatCurrency(
                                    resumo.valores_fixos.adiantamento,
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center px-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                               Base mensal (Cheio)
                            </span>
                            <span className="text-lg font-black text-gray-400 line-through opacity-40">
                              {formatCurrency(resumo.saldo_fixo_original)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center px-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                              Valor Pro-Rata
                            </span>
                            <span className="text-lg font-black text-blue-600">
                              {formatCurrency(
                                (resumo.saldo_fixo_original /
                                  resumo.dias_base_mes) *
                                  resumo.dias_ativos_no_mes,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coluna Direita: Ocorrências / Histórico */}
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                          <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                            Ocorrências Vinculadas
                          </h5>
                        </div>

                        {(extrato.ocorrencias as any[]).filter(
                          (o) =>
                            o.colaborador_cliente_id === resumo.id_vinculo &&
                            o.impacto_financeiro,
                        ).length > 0 ? (
                          <div className="space-y-4">
                            {(extrato.ocorrencias as any[])
                              .filter(
                                (o) =>
                                  o.colaborador_cliente_id ===
                                    resumo.id_vinculo && o.impacto_financeiro,
                              )
                              .map((occ, oIdx) => (
                                <div
                                  key={oIdx}
                                  className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-md group/occ"
                                >
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/occ:scale-110",
                                        occ.tipo_lancamento ===
                                          LANCAMENTO_TIPO.ENTRADA
                                          ? "bg-emerald-50 text-emerald-600"
                                          : "bg-red-50 text-red-600",
                                      )}
                                    >
                                      {occ.tipo_lancamento ===
                                      LANCAMENTO_TIPO.ENTRADA ? (
                                        <ArrowUpCircle className="h-5 w-5" />
                                      ) : (
                                        <ArrowDownCircle className="h-5 w-5" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-gray-800 tracking-tight">
                                        {occ.tipo?.descricao}
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                                        {format(
                                          new Date(occ.data_ocorrencia),
                                          "PPP",
                                          { locale: ptBR },
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={cn(
                                      "text-sm font-black",
                                      occ.tipo_lancamento ===
                                        LANCAMENTO_TIPO.ENTRADA
                                        ? "text-emerald-600"
                                        : "text-red-500",
                                    )}
                                  >
                                    {occ.tipo_lancamento ===
                                    LANCAMENTO_TIPO.ENTRADA
                                      ? "+"
                                      : "-"}{" "}
                                    {formatCurrency(occ.valor)}
                                  </span>
                                </div>
                              ))}
                            <div className="pt-4 border-t border-gray-100 mt-2">
                              <div className="flex items-center justify-between px-2">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                                  Saldo das Ocorrências
                                </span>
                                <p
                                  className={cn(
                                    "text-lg font-black",
                                    resumo.creditos_ocorrencia -
                                      resumo.debitos_ocorrencia >=
                                      0
                                      ? "text-blue-600"
                                      : "text-red-600",
                                  )}
                                >
                                  {resumo.creditos_ocorrencia -
                                    resumo.debitos_ocorrencia >=
                                  0
                                    ? "+"
                                    : ""}
                                  {formatCurrency(
                                    resumo.creditos_ocorrencia -
                                      resumo.debitos_ocorrencia,
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[2.5rem] p-10 border border-dashed border-gray-200">
                            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                              <Info className="h-6 w-6 text-gray-300" />
                            </div>
                            <p className="text-xs text-gray-400 font-bold italic max-w-[150px] leading-relaxed">
                              Sem ocorrências financeiras para este turno.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Lançamentos Avulsos no Mês (Incluindo MEI se houver) */}
              {(extrato.totais?.total_mei > 0 ||
                extrato.ocorrencias?.filter(
                  (o: any) => !o.colaborador_cliente_id && o.impacto_financeiro,
                ).length > 0) && (
                <div className="mt-12 space-y-6">
                  <div className="flex items-center gap-3 ml-2">
                    <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">
                      Ocorrências Avulsas
                    </h3>
                  </div>
                  <Card className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 transition-all hover:shadow-xl group">
                    <CardContent className="p-10">
                      <div className="space-y-4">
                        {/* MEI Integrado (se houver valor) */}
                        {extrato.totais?.total_mei > 0 && (
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-md group/occ">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/occ:scale-110 bg-emerald-50 text-emerald-600">
                                <ArrowUpCircle className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-black text-gray-800 tracking-tight">
                                  MEI Consolidado
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">
                                  Pro-Rata do Período
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-black text-emerald-600">
                              + {formatCurrency(extrato.totais.total_mei)}
                            </span>
                          </div>
                        )}

                        {/* Ocorrências Avulsas */}
                        {extrato.ocorrencias
                          ?.filter(
                            (o: any) =>
                              !o.colaborador_cliente_id && o.impacto_financeiro,
                          )
                          .map((occ: any, oIdx: number) => (
                            <div
                              key={oIdx}
                              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-md group/occ"
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/occ:scale-110",
                                    occ.tipo_lancamento ===
                                      LANCAMENTO_TIPO.ENTRADA
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-red-50 text-red-600",
                                  )}
                                >
                                  {occ.tipo_lancamento ===
                                  LANCAMENTO_TIPO.ENTRADA ? (
                                    <ArrowUpCircle className="h-5 w-5" />
                                  ) : (
                                    <ArrowDownCircle className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-gray-800 tracking-tight">
                                    {occ.tipo?.descricao}
                                  </p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase">
                                    {format(
                                      new Date(occ.data_ocorrencia),
                                      "PPP",
                                      { locale: ptBR },
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "text-sm font-black",
                                  occ.tipo_lancamento ===
                                    LANCAMENTO_TIPO.ENTRADA
                                    ? "text-emerald-600"
                                    : "text-red-500",
                                )}
                              >
                                {occ.tipo_lancamento ===
                                LANCAMENTO_TIPO.ENTRADA
                                  ? "+"
                                  : "-"}{" "}
                                {formatCurrency(occ.valor)}
                              </span>
                            </div>
                          ))}

                        <div className="pt-4 border-t border-gray-100 mt-2">
                          <div className="flex items-center justify-between px-2">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                              Saldo Total Avulso
                            </span>
                            <p
                              className={cn(
                                "text-lg font-black",
                                (extrato.totais?.total_avulso || 0) +
                                  (extrato.totais?.total_mei || 0) >=
                                  0
                                  ? "text-blue-600"
                                  : "text-red-600",
                              )}
                            >
                              {(extrato.totais?.total_avulso || 0) +
                                (extrato.totais?.total_mei || 0) >=
                              0
                                ? "+"
                                : ""}
                              {formatCurrency(
                                (extrato.totais?.total_avulso || 0) +
                                  (extrato.totais?.total_mei || 0),
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        ) : (
          <UnifiedEmptyState
            icon={AlertCircle}
            title={getMessage("financeiro.erro.carregar")}
            description="Não foi possível processar o rascunho financeiro."
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}
