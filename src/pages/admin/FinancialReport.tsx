import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborators, useFinancialReportViewModel } from "@/hooks";
import { useSearchParams } from "react-router-dom";
import { useFinanceiroGeral } from "@/hooks/api/useFinanceiro";
import { useUrlState } from "@/hooks/ui/useUrlState";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { Combobox } from "@/components/ui/combobox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wallet, CheckCircle2, Eye, Loader2, Calendar, Users
} from "lucide-react";
import { meses } from "@/utils/formatters/constants";
import { StatusGeralFechamento } from "@/services/api/financeiro.api";

const FinancialReportMobileItem = ({
    colab,
    onSelect,
}: {
    colab: StatusGeralFechamento;
    onSelect: () => void;
}) => {
    return (
        <div
            onClick={onSelect}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-all cursor-pointer space-y-3"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-green-100 text-green-700">
                            {colab.nome_completo.charAt(0)}
                        </div>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 text-sm truncate">
                            {colab.nome_completo}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                            {colab.clientes && colab.clientes.length > 0 ? (
                                colab.clientes.slice(0, 2).map((cliente, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        {i > 0 && <span className="text-gray-300 scale-75">•</span>}
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {cliente}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <span className="text-[10px] text-gray-400 font-medium">
                                    Sem turnos ativos
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50 text-xs">
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">
                        Adiantamento
                    </p>
                    <Badge className={colab.adiantamento_confirmado ? "bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[9px] hover:bg-emerald-50 px-2 py-0.5 rounded-lg" : "bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[9px] hover:bg-amber-50 px-2 py-0.5 rounded-lg"}>
                        {colab.adiantamento_confirmado ? "Confirmado" : "Pendente"}
                    </Badge>
                </div>
                <div>
                    <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider mb-1">
                        Fechamento
                    </p>
                    <Badge className={colab.pago ? "bg-emerald-500 text-white font-bold text-[9px] hover:bg-emerald-600 px-2 py-0.5 rounded-lg border border-transparent" : "bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[9px] hover:bg-amber-50 px-2 py-0.5 rounded-lg border border-transparent"}>
                        {colab.pago ? "Confirmado" : "Pendente"}
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export function FinancialReport() {
    const { setPageTitle } = useLayout();
    const [, setSearchParams] = useSearchParams();
    const vm = useFinancialReportViewModel();
    const [activeTab, setActiveTab] = useUrlState<string>({ key: "tab", defaultValue: "geral" });
    const [statusFilter, setStatusFilter] = useState<"todos" | "pendentes">("pendentes");

    useEffect(() => {
        setPageTitle("Relatório Financeiro");
    }, [setPageTitle]);

    const { data: collaborators = [] } = useCollaborators({}, { enabled: vm.canViewAll });

    const {
        data: statusGeral = [],
        isLoading: isGeralLoading,
        isFetching: isGeralFetching,
        refetch: refetchGeral
    } = useFinanceiroGeral(vm.filters.selectedMes, vm.filters.selectedAno, vm.canViewAll);

    const isGlobalLoading = isGeralLoading || isGeralFetching;

    const estatisticas = useMemo(() => {
        const total = statusGeral.length;
        const adiantamentosConfirmados = statusGeral.filter(s => s.adiantamento_confirmado).length;
        const pagamentosConcluidos = statusGeral.filter(s => s.pago).length;

        return { total, adiantamentosConfirmados, pagamentosConcluidos };
    }, [statusGeral]);

    const colaboradoresFiltrados = useMemo(() => {
        if (statusFilter === "todos") return statusGeral;
        return statusGeral.filter(colab => !colab.adiantamento_confirmado || !colab.pago);
    }, [statusGeral, statusFilter]);

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 ml-2">
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                            Período Global
                        </p>
                        <p className="text-[11px] font-bold text-gray-500 leading-none">
                            Ano e mês de referência
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select
                        value={String(vm.filters.selectedMes)}
                        onValueChange={(v) => {
                            vm.setMonth(Number(v));
                            setTimeout(() => refetchGeral(), 100);
                        }}
                    >
                        <SelectTrigger className="h-11 flex-1 sm:w-[140px] rounded-2xl border-none bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                            {meses.map((label, index) => (
                                <SelectItem
                                    key={index}
                                    value={String(index + 1)}
                                    className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-xl m-1 capitalize"
                                >
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(vm.filters.selectedAno)}
                        onValueChange={(v) => {
                            vm.setYear(Number(v));
                            setTimeout(() => refetchGeral(), 100);
                        }}
                    >
                        <SelectTrigger className="h-11 w-[90px] sm:w-[100px] rounded-2xl border-none bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                            {[new Date().getFullYear(), new Date().getFullYear() - 1].map(
                                (ano) => (
                                    <SelectItem
                                        key={ano}
                                        value={String(ano)}
                                        className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-xl m-1"
                                    >
                                        {ano}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {vm.canViewAll ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-2xl max-w-md border border-gray-200/50">
                        <TabsList className="bg-transparent border-none w-full grid grid-cols-2">
                            <TabsTrigger
                                value="geral"
                                className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                            >
                                Visão Geral
                            </TabsTrigger>
                            <TabsTrigger
                                value="detalhado"
                                className="rounded-xl font-bold transition-all data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm"
                            >
                                Detalhamento Individual
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="geral" className="space-y-6 outline-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden relative group">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 shadow-sm border border-amber-100">
                                            <Wallet className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 uppercase font-black tracking-widest text-[10px] mb-1">
                                                Adiantamentos Pagos
                                            </p>
                                            {isGlobalLoading ? (
                                                <Loader2 className="h-6 w-6 text-amber-600 animate-spin" />
                                            ) : (
                                                <h2 className="text-3xl font-black text-gray-850">
                                                    {estatisticas.adiantamentosConfirmados} <span className="text-gray-300 text-lg">/ {estatisticas.total}</span>
                                                </h2>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-sm rounded-[2.5rem] bg-white border border-gray-100 overflow-hidden relative group">
                                <CardContent className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm border border-emerald-100">
                                            <CheckCircle2 className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-400 uppercase font-black tracking-widest text-[10px] mb-1">
                                                Fechamento Mensal Pago
                                            </p>
                                            {isGlobalLoading ? (
                                                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                                            ) : (
                                                <h2 className="text-3xl font-black text-gray-850">
                                                    {estatisticas.pagamentosConcluidos} <span className="text-gray-300 text-lg">/ {estatisticas.total}</span>
                                                </h2>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 bg-gray-150/50 p-1 rounded-xl border border-gray-200/50 max-w-xs">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStatusFilter("pendentes")}
                                    className={statusFilter === "pendentes" ? "bg-white text-emerald-700 shadow-sm font-bold rounded-lg h-9 px-4" : "text-gray-500 font-bold rounded-lg h-9 px-4"}
                                >
                                    Pendentes
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStatusFilter("todos")}
                                    className={statusFilter === "todos" ? "bg-white text-emerald-700 shadow-sm font-bold rounded-lg h-9 px-4" : "text-gray-500 font-bold rounded-lg h-9 px-4"}
                                >
                                    Todos
                                </Button>
                            </div>
                        </div>

                        {isGlobalLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2rem] border border-gray-150 shadow-sm">
                                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                                <p className="text-xs text-gray-400 font-bold">Carregando painel de fechamentos...</p>
                            </div>
                        ) : colaboradoresFiltrados.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 font-medium italic bg-white rounded-[2rem] border border-gray-150 shadow-sm">
                                Nenhum colaborador localizado com os filtros selecionados.
                            </div>
                        ) : (
                            <ResponsiveDataList
                                data={colaboradoresFiltrados}
                                mobileContainerClassName="space-y-3 animate-in fade-in duration-350"
                                mobileItemRenderer={(colab) => (
                                    <FinancialReportMobileItem
                                        key={colab.colaborador_id}
                                        colab={colab}
                                        onSelect={() => {
                                            setSearchParams((prev) => {
                                                const newParams = new URLSearchParams(prev);
                                                newParams.set("usuario", colab.colaborador_id);
                                                newParams.set("tab", "detalhado");
                                                return newParams;
                                            }, { replace: true });
                                        }}
                                    />
                                )}
                            >
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm animate-in fade-in duration-350">
                                    <table className="w-full">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-gray-100 text-left">
                                                <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Colaborador
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Adiantamento
                                                </th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Fechamento
                                                </th>
                                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    Ações
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {colaboradoresFiltrados.map((colab) => (
                                                <tr
                                                    key={colab.colaborador_id}
                                                    className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                                                    onClick={() => {
                                                        setSearchParams((prev) => {
                                                            const newParams = new URLSearchParams(prev);
                                                            newParams.set("usuario", colab.colaborador_id);
                                                            newParams.set("tab", "detalhado");
                                                            return newParams;
                                                        }, { replace: true });
                                                    }}
                                                >
                                                    <td className="py-4 pl-6 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative">
                                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-green-100 text-green-700">
                                                                    {colab.nome_completo.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm">
                                                                    {colab.nome_completo}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-0.5 leading-none">
                                                                    {colab.clientes && colab.clientes.length > 0 ? (
                                                                        colab.clientes.slice(0, 2).map((cliente, i) => (
                                                                            <div key={i} className="flex items-center gap-1.5">
                                                                                {i > 0 && <span className="text-gray-300 scale-75">•</span>}
                                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                                    {cliente}
                                                                                </span>
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-[10px] text-gray-400 font-medium">
                                                                            Sem turnos ativos
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle">
                                                        <Badge className={colab.adiantamento_confirmado ? "bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold text-[10px] hover:bg-emerald-50 px-2.5 py-0.5 rounded-lg" : "bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[10px] hover:bg-amber-50 px-2.5 py-0.5 rounded-lg"}>
                                                            {colab.adiantamento_confirmado ? "Confirmado" : "Pendente"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 align-middle">
                                                        <Badge className={colab.pago ? "bg-emerald-500 text-white font-bold text-[10px] hover:bg-emerald-600 px-2.5 py-0.5 rounded-lg border border-transparent" : "bg-amber-50 text-amber-600 border border-amber-200 font-bold text-[10px] hover:bg-amber-50 px-2.5 py-0.5 rounded-lg border border-transparent"}>
                                                            {colab.pago ? "Confirmado" : "Pendente"}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="rounded-xl border-gray-200 hover:border-emerald-600 hover:text-emerald-700 font-bold text-xs h-9 transition-all"
                                                            onClick={() => {
                                                                setSearchParams((prev) => {
                                                                    const newParams = new URLSearchParams(prev);
                                                                    newParams.set("usuario", colab.colaborador_id);
                                                                    newParams.set("tab", "detalhado");
                                                                    return newParams;
                                                                }, { replace: true });
                                                            }}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                            Ver Fechamento
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ResponsiveDataList>
                        )}
                    </TabsContent>

                    <TabsContent value="detalhado" className="space-y-6 outline-none">
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 shrink-0">
                                    <Users className="h-5 w-5 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                        Colaborador Selecionado
                                    </p>
                                    <p className="text-[11px] font-bold text-gray-500 leading-none">
                                        Selecione para detalhar o fechamento
                                    </p>
                                </div>
                            </div>
                            <div className="w-full sm:w-[250px]">
                                <Combobox
                                    options={[
                                        { value: "todos", label: "Selecionar Colaborador" },
                                        ...collaborators.map(c => ({ value: c.id, label: c.nome_completo }))
                                    ]}
                                    value={vm.filters.selectedUsuario || "todos"}
                                    onSelect={(val) => vm.setUsuario(val === "todos" ? "todos" : val)}
                                    placeholder="Selecionar Colaborador"
                                    className="h-11 w-full rounded-2xl border-none bg-gray-50 font-bold text-gray-700 hover:border-emerald-500 transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        <FinancialReportView
                            usuarioId={vm.usuarioId}
                            colaboradorNome={vm.colaboradorNome}
                            selectedMonth={vm.filters.selectedMes}
                            selectedYear={vm.filters.selectedAno}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                <FinancialReportView
                    usuarioId={vm.usuarioId}
                    colaboradorNome={vm.colaboradorNome}
                    selectedMonth={vm.filters.selectedMes}
                    selectedYear={vm.filters.selectedAno}
                />
            )}
        </div>
    );
}

export default FinancialReport;
