import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FINANCEIRO_STATUS, LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { getMessage } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import { useFinanceiro } from "@/hooks/api/useFinanceiro";
import { useFinanceiroMutations } from "@/hooks/api/useFinanceiroMutations";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useFilters } from "@/hooks/ui/useFilters";
import { cn } from "@/lib/utils";
import { anos, meses } from "@/utils/formatters/constants";
import { formatCurrency } from "@/utils/formatters/currency";
import { formatDateTimeToBR } from "@/utils/formatters/date";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Banknote, Calendar, CheckCircle2, CreditCard, Info, User, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

interface FinancialReportViewProps {
    usuarioId?: string;
    colaboradorNome?: string;
}

export function FinancialReportView({ usuarioId, colaboradorNome }: FinancialReportViewProps) {
    const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
    const { can } = usePermissions();
    const {
        selectedMes: selectedMonth = new Date().getMonth() + 1,
        setSelectedMes: setSelectedMonth = () => {},
        selectedAno: selectedYear = new Date().getFullYear(),
        setSelectedAno: setSelectedYear = () => {},
    } = useFilters({
        mesParam: "mes",
        anoParam: "ano",
    });

    const { data: extrato, isLoading, refetch } = useFinanceiro(
        usuarioId || undefined,
        selectedMonth,
        selectedYear
    );

    const { handlePaymentMutation } = useFinanceiroMutations();

    const monthOptions = useMemo(() =>
        meses.map((label, index) => ({ value: index + 1, label })),
        []);

    return (
        <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
            <div className="space-y-6">
                {/* Context Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                            <SelectTrigger className="h-9 w-[130px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {monthOptions.map(m => (
                                    <SelectItem key={m.value} value={String(m.value)} className="text-xs">{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                            <SelectTrigger className="h-9 w-[90px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {anos.map(a => (
                                    <SelectItem key={a.value} value={a.value} className="text-xs">{a.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

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
                                <Badge className={cn(
                                    "rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-widest",
                                    extrato.status === FINANCEIRO_STATUS.PAGO ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                )}>
                                    {extrato.status}
                                </Badge>
                                {extrato.data_pagamento && (
                                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Pago em: {formatDateTimeToBR(extrato.data_pagamento, { includeTime: true })}
                                    </span>
                                )}
                            </div>

                            {extrato.status === FINANCEIRO_STATUS.RASCUNHO && can(PERMISSIONS.FINANCEIRO.PAGAR) && (
                                <Button
                                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5"
                                    disabled={handlePaymentMutation.isPending}
                                    onClick={() => {
                                        openConfirmationDialog({
                                            title: getMessage("financeiro.confirmacao.titulo"),
                                            description: `${getMessage("financeiro.confirmacao.descricao")} (${formatCurrency(extrato.totais?.saldo_final || 0)})`,
                                            confirmText: getMessage("financeiro.confirmacao.botao"),
                                            onConfirm: async () => {
                                                await handlePaymentMutation.mutateAsync({ usuarioId, mes: selectedMonth, ano: selectedYear });
                                                closeConfirmationDialog();
                                            }
                                        });
                                    }}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Confirmar Pagamento
                                </Button>
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
                                    <h2 className="text-4xl font-black mb-4">{formatCurrency(extrato.totais?.saldo_final || 0)}</h2>
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
                            <Card className="border-none shadow-md rounded-[2.5rem] bg-emerald-500 text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <Calendar className="h-20 w-20" />
                                </div>
                                <CardContent className="p-8 relative z-10">
                                    <p className="text-emerald-100/70 uppercase font-black tracking-widest text-[10px] mb-3">
                                        Total de Turnos
                                    </p>
                                    <h2 className="text-3xl font-black mb-1">{formatCurrency(extrato.totais?.total_turnos || 0)}</h2>
                                    <p className="text-[10px] text-emerald-100/60 font-medium">Soma de todos os vínculos ativos</p>
                                </CardContent>
                            </Card>

                            {/* Subtotal Avulso */}
                            <Card className="border-none shadow-md rounded-[2.5rem] bg-indigo-600 text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                    <CreditCard className="h-20 w-20" />
                                </div>
                                <CardContent className="p-8 relative z-10">
                                    <p className="text-indigo-100/70 uppercase font-black tracking-widest text-[10px] mb-3">
                                        Total Avulso
                                    </p>
                                    <h2 className="text-3xl font-black mb-1">{formatCurrency(extrato.totais?.total_avulso || 0)}</h2>
                                    <p className="text-[10px] text-indigo-100/60 font-medium">Lançamentos sem vínculo direto</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Turn Breakdown Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="h-1 w-8 bg-blue-600 rounded-full" />
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">Detalhamento por Cliente</h3>
                            </div>

                            {extrato.resumo_por_cliente?.map((resumo: any, idx: number) => (
                                <Card key={idx} className="border-none shadow-lg rounded-[2.5rem] overflow-hidden bg-white border border-gray-100 transition-all hover:shadow-xl group">
                                    {/* Header do Turno */}
                                    <div className="bg-gray-50/50 px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 group-hover:bg-white transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center shrink-0 group-hover:border-blue-100 transition-colors">
                                                <User className="h-7 w-7 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 text-xl uppercase tracking-tight">{resumo.nome_fantasia}</h4>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50 text-[10px] font-bold px-2.5 py-0.5 rounded-lg border-blue-100">Cálculo Pro-rata Aplicado</Badge>
                                                    {(resumo.data_inicio || resumo.data_fim) && (
                                                        <p className="text-[11px] text-gray-400 font-bold">
                                                            {resumo.data_inicio ? `Início: ${resumo.data_inicio.split('-').reverse().join('/')}` : ''}
                                                            {resumo.data_inicio && resumo.data_fim ? ' · ' : ''}
                                                            {resumo.data_fim ? `Término: ${resumo.data_fim.split('-').reverse().join('/')}` : ''}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right bg-blue-50/50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Valor do Turno</p>
                                            <p className="text-3xl font-black text-blue-600">{formatCurrency(resumo.valor_calculado)}</p>
                                        </div>
                                    </div>

                                    <CardContent className="p-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                            {/* Coluna Esquerda: Composição do Cálculo */}
                                            <div className="space-y-8">
                                                {/* Calendário de Dias Ativos */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Período de Atuação</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs font-bold text-gray-500">Base {resumo.dias_base_mes} dias</span>
                                                            <Badge className="bg-blue-600 text-white font-black px-3 py-1 rounded-xl text-[11px] shadow-sm">{resumo.dias_ativos_no_mes} dias ativos</Badge>
                                                        </div>
                                                    </div>
                                                    {resumo.datas_ativas && resumo.datas_ativas.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {resumo.datas_ativas.map((dateString: string) => {
                                                                const [,, day] = dateString.split('-');
                                                                return (
                                                                    <div key={dateString} className="h-8 w-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-[11px] font-bold text-gray-600 shadow-sm">
                                                                        {day}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Composição Fixa do Contrato */}
                                                <div className="bg-gray-50/50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-l-2 border-blue-600 pl-3">Composição Fixa do Contrato</p>
                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                                                        {resumo.valores_fixos?.contrato > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-gray-500 font-medium">Contrato</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(resumo.valores_fixos.contrato)}</span>
                                                            </div>
                                                        )}
                                                        {resumo.valores_fixos?.mei > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-gray-500 font-medium">MEI</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(resumo.valores_fixos.mei)}</span>
                                                            </div>
                                                        )}
                                                        {resumo.valores_fixos?.bonus > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-gray-500 font-medium">Bônus</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(resumo.valores_fixos.bonus)}</span>
                                                            </div>
                                                        )}
                                                        {resumo.valores_fixos?.ajuda_custo > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-gray-500 font-medium">Ajuda Custo</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(resumo.valores_fixos.ajuda_custo)}</span>
                                                            </div>
                                                        )}
                                                        {resumo.valores_fixos?.aluguel > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-gray-500 font-medium">Aluguel</span>
                                                                <span className="font-bold text-emerald-600">{formatCurrency(resumo.valores_fixos.aluguel)}</span>
                                                            </div>
                                                        )}
                                                        {resumo.valores_fixos?.adiantamento > 0 && (
                                                            <div className="flex justify-between text-[13px] items-center">
                                                                <span className="text-red-400 font-bold italic">Adiantamento</span>
                                                                <span className="font-bold text-red-600">-{formatCurrency(resumo.valores_fixos.adiantamento)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center px-2">
                                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Valor total planejado</span>
                                                        <span className="text-lg font-black text-gray-400 line-through opacity-40">{formatCurrency(resumo.saldo_fixo_original)}</span>
                                                    </div>
                                                </div>

                                                {/* Resumo Base Lógica */}
                                                <div className="flex items-center justify-between p-6 bg-blue-600 rounded-3xl text-white shadow-lg shadow-blue-500/20">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Base Pro-Rata Aplicado</p>
                                                        <p className="text-2xl font-black">{formatCurrency((resumo.saldo_fixo_original / resumo.dias_base_mes) * resumo.dias_ativos_no_mes)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Saldo Variável</p>
                                                        <p className={cn(
                                                            "text-xl font-black",
                                                            (resumo.creditos_ocorrencia - resumo.debitos_ocorrencia) >= 0 ? "text-emerald-300" : "text-red-300"
                                                        )}>
                                                            {(resumo.creditos_ocorrencia - resumo.debitos_ocorrencia) >= 0 ? "+" : ""}
                                                            {formatCurrency(resumo.creditos_ocorrencia - resumo.debitos_ocorrencia)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Coluna Direita: Ocorrências / Histórico */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="h-0.5 w-6 bg-gray-200" />
                                                    <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Lançamentos Variáveis</h5>
                                                </div>

                                                {(extrato.ocorrencias as any[]).filter(o => o.colaborador_cliente_id === resumo.id_vinculo && o.impacto_financeiro).length > 0 ? (
                                                    <div className="space-y-4">
                                                        {(extrato.ocorrencias as any[])
                                                            .filter(o => o.colaborador_cliente_id === resumo.id_vinculo && o.impacto_financeiro)
                                                            .map((occ, oIdx) => (
                                                                <div key={oIdx} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 transition-all hover:shadow-md group/occ">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={cn(
                                                                            "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/occ:scale-110",
                                                                            occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                                        )}>
                                                                            {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-black text-gray-800 tracking-tight">{occ.tipo?.descricao}</p>
                                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(occ.data_ocorrencia), "PPP", { locale: ptBR })}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-sm font-black",
                                                                        occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "text-emerald-600" : "text-red-500"
                                                                    )}>
                                                                        {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"} {formatCurrency(occ.valor)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center bg-gray-50/50 rounded-[2.5rem] p-10 border border-dashed border-gray-200">
                                                        <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4">
                                                            <Info className="h-6 w-6 text-gray-300" />
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-bold italic max-w-[150px] leading-relaxed">Sem ocorrências financeiras para este turno.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* General Section */}
                            {extrato.ocorrencias?.filter((o: any) => !o.colaborador_cliente_id && o.impacto_financeiro).length > 0 && (
                                <div className="mt-12 space-y-6">
                                    <div className="flex items-center gap-3 ml-2">
                                        <div className="h-1 w-8 bg-indigo-600 rounded-full" />
                                        <h3 className="text-xl font-black text-gray-800 tracking-tight">Lançamentos Gerais</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {extrato.ocorrencias.filter((o: any) => !o.colaborador_cliente_id && o.impacto_financeiro).map((occ: any, oIdx: number) => (
                                            <Card key={oIdx} className="border-none shadow-lg rounded-[2.5rem] bg-white hover:bg-indigo-50/10 transition-colors border border-gray-100 overflow-hidden group">
                                                <CardContent className="p-8">
                                                    <div className="flex items-start justify-between mb-6">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110",
                                                            occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-red-500 text-white shadow-red-200"
                                                        )}>
                                                            <CreditCard className="h-6 w-6" />
                                                        </div>
                                                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-[10px] font-black uppercase px-3 rounded-lg border-indigo-200">Avulso</Badge>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-black text-gray-900 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{occ.tipo?.descricao}</h5>
                                                        <p className="text-xs text-gray-400 font-bold mb-6">{format(new Date(occ.data_ocorrencia), "PPP", { locale: ptBR })}</p>
                                                        <div className="pt-4 border-t border-gray-50">
                                                            <p className={cn(
                                                                "text-2xl font-black",
                                                                occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "text-emerald-600" : "text-red-500"
                                                            )}>
                                                                {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"} {formatCurrency(occ.valor)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
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
