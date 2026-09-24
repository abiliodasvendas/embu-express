import { useState, useMemo, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FinanceiroTab } from "./relatorios/FinanceiroTab";
import { DreTab } from "./relatorios/DreTab";
import { FluxoCaixaTab } from "./relatorios/FluxoCaixaTab";
import { useLayout, useDateFilters } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { Calendar, Wallet, BarChart3, TrendingUp } from "lucide-react";

export default function Reports() {
    const { setPageTitle } = useLayout();
    const { can, isAnyAdmin } = usePermissions();

    const canViewDre = isAnyAdmin || can(PERMISSIONS.DRE.VER);
    const canViewFluxoCaixa = isAnyAdmin || can(PERMISSIONS.FLUXO_CAIXA.VER);

    useEffect(() => {
        setPageTitle("Relatórios");
    }, [setPageTitle]);

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const [selectedTab, setSelectedTab] = useState(() => {
        if (canViewDre) return "dre";
        if (canViewFluxoCaixa) return "fluxo-caixa";
        return "financeiro";
    });
    const { selectedMes: mes, setSelectedMes: setMes, selectedAno: ano, setSelectedAno: setAno } = useDateFilters({
        mesParam: "mes",
        anoParam: "ano",
        syncWithUrl: true,
    });

    const meses = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => i + 1).map(m => ({
            valor: m,
            label: new Date(2000, m - 1, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
        }));
    }, []);

    const anos = useMemo(() => {
        const anosPossiveis = [];
        for (let a = anoAtual - 2; a <= anoAtual + 1; a++) {
            anosPossiveis.push(a);
        }
        return anosPossiveis;
    }, [anoAtual]);

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
                        value={String(mes)}
                        onValueChange={(v) => setMes(Number(v))}
                    >
                        <SelectTrigger className="h-11 flex-1 sm:w-[140px] rounded-2xl border-none bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20">
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                            {meses.map((m) => (
                                <SelectItem
                                    key={m.valor}
                                    value={String(m.valor)}
                                    className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-xl m-1 capitalize"
                                >
                                    {m.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={String(ano)}
                        onValueChange={(v) => setAno(Number(v))}
                    >
                        <SelectTrigger className="h-11 w-[90px] sm:w-[100px] rounded-2xl border-none bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20">
                            <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                            {anos.map((a) => (
                                <SelectItem
                                    key={a}
                                    value={String(a)}
                                    className="font-medium focus:bg-emerald-50 focus:text-emerald-700 rounded-xl m-1"
                                >
                                    {a}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-6">
                <TabsList className="flex w-full justify-start overflow-x-auto lg:w-max h-12 rounded-2xl bg-gray-100 p-1 no-scrollbar scroll-smooth whitespace-nowrap">
                    {canViewDre && (
                        <TabsTrigger
                            value="dre"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4"
                        >
                            <BarChart3 className="h-4 w-4 text-current" />
                            <span>Resultado Real do Mês (Lucro da Empresa)</span>
                        </TabsTrigger>
                    )}
                    {canViewFluxoCaixa && (
                        <TabsTrigger
                            value="fluxo-caixa"
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4"
                        >
                            <TrendingUp className="h-4 w-4 text-current" />
                            <span>Fluxo de Caixa Diário</span>
                        </TabsTrigger>
                    )}
                    <TabsTrigger
                        value="financeiro"
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4"
                    >
                        <Wallet className="h-4 w-4 text-current" />
                        <span>Folha de Pagamento</span>
                    </TabsTrigger>
                </TabsList>

                {canViewDre && (
                    <TabsContent value="dre">
                        {selectedTab === "dre" && (
                            <DreTab mes={mes} ano={ano} />
                        )}
                    </TabsContent>
                )}

                {canViewFluxoCaixa && (
                    <TabsContent value="fluxo-caixa">
                        {selectedTab === "fluxo-caixa" && (
                            <FluxoCaixaTab mes={mes} ano={ano} />
                        )}
                    </TabsContent>
                )}

                <TabsContent value="financeiro">
                    {selectedTab === "financeiro" && (
                        <FinanceiroTab mes={mes} ano={ano} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
