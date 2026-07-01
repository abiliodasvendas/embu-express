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

    return (
        <div className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total da Folha */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total da Folha</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatarMoeda(data.totalFolha)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Soma total do período</p>
                    </CardContent>
                </Card>

                {/* Valor Pago */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Valor Pago</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatarMoeda(data.valorPago)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Colaboradores já fechados</p>
                    </CardContent>
                </Card>

                {/* Resta Pagar */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Resta Pagar</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">{formatarMoeda(data.restaPagar)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Valores em aberto</p>
                    </CardContent>
                </Card>

                {/* Pendentes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Colaboradores Pendentes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.pendentesCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">Aguardando fechamento</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
