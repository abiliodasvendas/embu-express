import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinanceiroDashboard } from "@/hooks/api/useFinanceiroDashboard";
import { Wallet, TrendingUp, AlertCircle, Users } from "lucide-react";

interface FinanceiroTabProps {
    mes: number;
    ano: number;
}

export function FinanceiroTab({ mes, ano }: FinanceiroTabProps) {
    const { data, isLoading, isError } = useFinanceiroDashboard(mes, ano);

    const formatarMoeda = (valor: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        }).format(valor);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[1, 2, 3, 4].map(i => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-3 w-1/4" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="mt-6 flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-red-50 text-red-600 border-red-200">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p>Ocorreu um erro ao carregar os dados financeiros do mês.</p>
            </div>
        );
    }

    const totalFolhaBruta = data.totalFolhaBruta || data.totalFolha;
    const totalAdiantamento = data.totalAdiantamentoPago || 0;
    const totalDescontos = (data.totalDescontoFaltas || 0) + (data.totalDescontoConvenios || 0);
    const saldoFinal = data.saldoFinalFolha || data.totalFolha;
    const totalColabs = data.totalColaboradores || (data.pendentesCount + (data.pagosCount || 0));
    const pagosCount = data.pagosCount || 0;
    const percentPago = saldoFinal > 0 ? Math.min(100, Math.round((data.valorPago / saldoFinal) * 100)) : 0;

    return (
        <div className="space-y-6 mt-6">
            {/* Régua de Conciliação Contábil */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white p-4 rounded-2xl border border-blue-100/80 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-500 uppercase tracking-wider">Composição do Mês:</span>
                        <span className="font-bold text-gray-900 text-sm">{formatarMoeda(totalFolhaBruta)}</span>
                        <span className="text-gray-400 font-medium">(Bruto)</span>
                    </div>
                    <div className="flex items-center gap-2 text-rose-600 font-semibold">
                        <span>- {formatarMoeda(totalDescontos)}</span>
                        <span className="text-gray-400 text-[11px] font-normal">(Faltas/Convênios)</span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                        <span>- {formatarMoeda(totalAdiantamento)}</span>
                        <span className="text-gray-400 text-[11px] font-normal">(Vales Dia 20)</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-700 font-bold text-sm bg-blue-100/60 px-3 py-1 rounded-xl">
                        <span>= {formatarMoeda(saldoFinal)}</span>
                        <span className="text-blue-600 text-xs font-normal">(Saldo Dia 07)</span>
                    </div>
                </div>
            </div>

            {/* Grid de Cards Analíticos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Folha Bruta Produzida */}
                <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Folha Bruta Prevista</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-gray-900 tracking-tight">{formatarMoeda(totalFolhaBruta)}</div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span>Total contratado ({totalColabs} prestadores)</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Adiantamento Salarial (Dia 20) */}
                <Card className="rounded-2xl border-amber-100 bg-amber-50/20 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider">Adiantamentos (Dia 20)</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-700 tracking-tight">{formatarMoeda(totalAdiantamento)}</div>
                        <div className="text-xs text-amber-800/80 mt-1.5 flex flex-wrap items-center justify-between gap-1">
                            <span>Previsto em contrato:</span>
                            <span className="font-bold">{formatarMoeda(data.totalAdiantamentoPrevisto || 0)}</span>
                        </div>
                        <p className="text-[11px] text-amber-600/80 mt-1">
                            {data.colaboradoresAdiantamentoCount || 0} de {totalColabs} colaboradores confirmados
                        </p>
                    </CardContent>
                </Card>

                {/* Descontos Totais de Extrato */}
                <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descontos da Folha</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-rose-600 tracking-tight">-{formatarMoeda(totalDescontos)}</div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center justify-between">
                            <span>Faltas: {formatarMoeda(data.totalDescontoFaltas || 0)}</span>
                            <span>Convênios: {formatarMoeda(data.totalDescontoConvenios || 0)}</span>
                        </p>
                    </CardContent>
                </Card>

                {/* Saldo Líquido do Dia 07 */}
                <Card className="rounded-2xl border-indigo-100 bg-indigo-50/20 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Saldo Líquido da Folha (Dia 07)</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-indigo-950 tracking-tight">{formatarMoeda(saldoFinal)}</div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-1.5">
                            <span>Progresso de Pagamento:</span>
                            <span className="font-bold text-indigo-700">{percentPago}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${percentPago}%` }} />
                        </div>
                    </CardContent>
                </Card>

                {/* Já Liquidado / Pago */}
                <Card className="rounded-2xl border-emerald-100 bg-emerald-50/20 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Já Liquidado (Dia 07)</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-600 tracking-tight">{formatarMoeda(data.valorPago)}</div>
                        <p className="text-xs text-emerald-700 mt-1.5 font-medium">
                            {pagosCount} de {totalColabs} colaboradores liquidados
                        </p>
                    </CardContent>
                </Card>

                {/* Resta Liquidar / Pendente */}
                <Card className="rounded-2xl border-amber-100 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider">Resta Liquidar (Dia 07)</CardTitle>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <AlertCircle className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-600 tracking-tight">{formatarMoeda(data.restaPagar)}</div>
                        <p className="text-xs text-amber-700 mt-1.5 font-medium">
                            {data.pendentesCount} colaboradores aguardando pagamento
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
