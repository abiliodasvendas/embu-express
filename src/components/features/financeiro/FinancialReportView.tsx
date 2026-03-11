import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
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
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const { data: extrato, isLoading } = useFinanceiro(
        usuarioId || undefined,
        selectedMonth,
        selectedYear
    );

    const { handlePaymentMutation } = useFinanceiroMutations();

    const monthOptions = useMemo(() =>
        meses.map((label, index) => ({ value: index + 1, label })),
        []);

    return (
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
                <>
                    {/* Main Balance Header */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <Badge className={cn(
                                    "rounded-full px-4 py-1.5 font-bold text-xs uppercase tracking-widest",
                                    extrato.status === FINANCEIRO_STATUS.PAGO ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"
                                )}>
                                    {extrato.status}
                                </Badge>
                                {extrato.data_pagamento && (
                                    <span className="text-xs text-emerald-600 font-bold">
                                        Pago em: {formatDateTimeToBR(extrato.data_pagamento, { includeTime: true })}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {extrato.status === FINANCEIRO_STATUS.RASCUNHO && can(PERMISSIONS.FINANCEIRO.PAGAR) && (
                                    <Button
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 shadow-md"
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
                        </div>

                        <Card className="border-none shadow-lg rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-700 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Banknote className="h-32 w-32" />
                            </div>
                            <CardContent className="p-10 relative z-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
                                <div>
                                    <p className="text-primary-foreground/70 uppercase font-bold tracking-[0.2em] text-xs mb-2">
                                        {getMessage("financeiro.labels.saldoLiquido")}
                                    </p>
                                    <h2 className="text-5xl font-black">{formatCurrency(extrato.totais?.saldo_final || 0)}</h2>
                                    <div className="flex items-center gap-2 mt-4 text-primary-foreground/80 bg-white/10 w-max px-4 py-1.5 rounded-full text-sm mx-auto sm:mx-0">
                                        <Info className="h-4 w-4" />
                                        <span>
                                            {extrato.status === FINANCEIRO_STATUS.RASCUNHO 
                                                ? getMessage("financeiro.labels.infoRascunho") 
                                                : getMessage("financeiro.labels.infoPago")}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-md">
                                        <Calendar className="h-8 w-8" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold opacity-80 uppercase leading-none">{meses[selectedMonth - 1]}</p>
                                        <p className="text-2xl font-black">{selectedYear}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Breakdown by Turn */}
                    <div className="grid grid-cols-1 gap-6">
                        <h3 className="text-xl font-bold text-gray-800 ml-2">{getMessage("financeiro.labels.detalhamentoCliente")}</h3>

                        {extrato.resumo_por_cliente?.map((resumo: any, idx: number) => (
                            <Card key={idx} className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white">
                                <div className="bg-gray-50/50 px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg uppercase tracking-tight">{resumo.nome_fantasia}</h4>
                                            <span className="text-xs text-muted-foreground font-medium">{getMessage("financeiro.labels.criterioProRata")}</span>
                                            {(resumo.data_inicio || resumo.data_fim) && (
                                                <p className="text-[11px] text-gray-500 font-semibold mt-1">
                                                    {resumo.data_inicio ? `Início: ${resumo.data_inicio.split('-').reverse().join('/')}` : ''}
                                                    {resumo.data_inicio && resumo.data_fim ? ' · ' : ''}
                                                    {resumo.data_fim ? `Término: ${resumo.data_fim.split('-').reverse().join('/')}` : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Valor do Turno</p>
                                        <p className="text-2xl font-black text-primary">{formatCurrency(resumo.valor_calculado)}</p>
                                    </div>
                                </div>

                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                        {/* Left: Logic details */}
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between text-sm pb-4 border-b border-dashed border-gray-100">
                                                <span className="text-gray-500 font-medium">Dias base no mês</span>
                                                <span className="font-bold text-gray-900">{resumo.dias_base_mes} dias</span>
                                            </div>
                                            <div className="flex flex-col gap-3 pb-4 border-b border-dashed border-gray-100">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-500 font-medium">Dias ativos no período</span>
                                                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 font-bold px-3">{resumo.dias_ativos_no_mes} dias</Badge>
                                                </div>
                                                {resumo.datas_ativas && resumo.datas_ativas.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1 bg-white/50 p-2 rounded-xl border border-gray-100/50">
                                                        {resumo.datas_ativas.map((dateString: string) => {
                                                            // Força a interpretação da data mantendo o timezone local para evitar shifts (-1 dia)
                                                            const [year, month, day] = dateString.split('-');
                                                            return (
                                                                <Badge key={dateString} variant="outline" className="text-[10px] text-gray-500 bg-white shadow-sm font-semibold border-gray-200 pointer-events-none">
                                                                    {`${day}/${month}`}
                                                                </Badge>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-sm pb-4 border-b border-dashed border-gray-100">
                                                <span className="text-gray-500 font-medium">Valor fixo original</span>
                                                <span className="font-bold text-gray-400 line-through decoration-gray-300">{formatCurrency(resumo.saldo_fixo_original)}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Base Pro-rata</p>
                                                    <p className="text-lg font-bold text-gray-700">
                                                        {formatCurrency((resumo.saldo_fixo_original / resumo.dias_base_mes) * resumo.dias_ativos_no_mes)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Saldo Variável</p>
                                                    <p className={cn(
                                                        "text-lg font-black",
                                                        (resumo.creditos_ocorrencia - resumo.debitos_ocorrencia) >= 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>
                                                        {(resumo.creditos_ocorrencia - resumo.debitos_ocorrencia) >= 0 ? "+" : ""}
                                                        {formatCurrency(resumo.creditos_ocorrencia - resumo.debitos_ocorrencia)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Specific Occurrences */}
                                        <div className="space-y-4 pb-4">
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Lançamentos Variáveis</h5>
                                            {(extrato.ocorrencias as any[]).filter(o => o.colaborador_cliente_id === resumo.id_vinculo && o.impacto_financeiro).length > 0 ? (
                                                <div className="space-y-3">
                                                    {(extrato.ocorrencias as any[])
                                                        .filter(o => o.colaborador_cliente_id === resumo.id_vinculo && o.impacto_financeiro)
                                                        .map((occ, oIdx) => (
                                                            <div key={oIdx} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 group hover:bg-white border border-transparent hover:border-gray-100 transition-all">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                                                                        occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                                                                    )}>
                                                                        {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-800">{occ.tipo?.nome}</p>
                                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{format(new Date(occ.data_ocorrencia), "dd MMM", { locale: ptBR })}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={cn(
                                                                    "text-sm font-black",
                                                                    occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "text-emerald-600" : "text-red-400"
                                                                )}>
                                                                    {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"} {formatCurrency(occ.valor)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                </div>
                                            ) : (
                                                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-center bg-gray-50 rounded-3xl p-6 border border-dashed border-gray-200">
                                                    <Info className="h-6 w-6 text-gray-300 mb-2" />
                                                    <p className="text-xs text-gray-400 font-medium italic">Sem ocorrências financeiras para este turno.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* General Occurrences */}
                        {extrato.ocorrencias?.filter((o: any) => !o.colaborador_cliente_id && o.impacto_financeiro).length > 0 && (
                            <div className="mt-4 space-y-4">
                                <h3 className="text-xl font-bold text-gray-800 ml-2">{getMessage("financeiro.labels.lancamentosGerais")}</h3>
                                <Card className="border-none shadow-sm rounded-[2rem] bg-indigo-50/30 overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {extrato.ocorrencias.filter((o: any) => !o.colaborador_cliente_id && o.impacto_financeiro).map((occ: any, oIdx: number) => (
                                                <div key={oIdx} className="bg-white p-5 rounded-3xl shadow-sm border border-indigo-100/50 flex flex-col justify-between h-full">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                                            occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                                        )}>
                                                            <CreditCard className="h-5 w-5" />
                                                        </div>
                                                        <Badge variant="outline" className="border-gray-100 text-[10px] font-black uppercase">Geral</Badge>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-gray-900 leading-tight mb-1">{occ.tipo?.nome}</h5>
                                                        <p className="text-xs text-gray-400 font-medium mb-4">{format(new Date(occ.data_ocorrencia), "PPP", { locale: ptBR })}</p>
                                                        <p className={cn(
                                                            "text-xl font-black",
                                                            occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "text-emerald-600" : "text-red-500"
                                                        )}>
                                                            {occ.tipo_lancamento === LANCAMENTO_TIPO.ENTRADA ? "+" : "-"} {formatCurrency(occ.valor)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <UnifiedEmptyState
                    icon={AlertCircle}
                    title={getMessage("financeiro.erro.carregar")}
                    description="Não foi possível processar o rascunho financeiro."
                />
            )}
        </div>
    );
}
