import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import { useOcorrencias } from "@/hooks/api/useOcorrencias";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { Ocorrencia } from "@/types/database";
import { AlertCircle, Filter, User, X, Calendar as CalendarIcon, Search, Plus } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { meses, anos } from "@/utils/formatters/constants";

export function Occurrences() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openOccurrenceFormDialog
    } = useLayout();

    // States for filtering
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedCollaborator, setSelectedCollaborator] = useState<string>("TODOS");

    // Calculated range for API
    const dateRange = useMemo(() => {
        const date = new Date(selectedYear, selectedMonth - 1, 1);
        return {
            inicio: format(startOfMonth(date), "yyyy-MM-dd"),
            fim: format(endOfMonth(date), "yyyy-MM-dd")
        };
    }, [selectedMonth, selectedYear]);

    const { data: occurrences = [], isLoading, refetch } = useOcorrencias({
        data_inicio: dateRange.inicio,
        data_fim: dateRange.fim,
        usuario_id: selectedCollaborator !== "TODOS" ? selectedCollaborator : undefined,
    });

    const { data: collaborators = [] } = useCollaborators({});
    const deleteMutation = useDeleteOcorrencia();

    const monthOptions = useMemo(() =>
        meses.map((label, index) => ({ value: index + 1, label })),
        []);

    useEffect(() => {
        setPageTitle("Ocorrências");
    }, [setPageTitle]);

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleDelete = (occurrence: Ocorrencia) => {
        openConfirmationDialog({
            title: "Remover Ocorrência",
            description: `Deseja realmente remover esta ocorrência de ${occurrence.tipo?.nome}?`,
            confirmText: "Remover",
            variant: "destructive",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(occurrence.id);
                closeConfirmationDialog();
            },
        });
    };

    return (
        <>
            <PullToRefreshWrapper onRefresh={onRefresh}>
                <div className="space-y-6 pb-24">
                    {/* Filter Card */}
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Colaborador</label>
                                    <Select value={selectedCollaborator} onValueChange={setSelectedCollaborator}>
                                        <SelectTrigger className="rounded-xl border-gray-100 h-11 bg-gray-50/50">
                                            <SelectValue placeholder="Todos os colaboradores" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="TODOS">Todos os colaboradores</SelectItem>
                                            {collaborators.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.nome_completo}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Período</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                                            <SelectTrigger className="rounded-xl border-gray-100 h-11 bg-gray-50/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map(m => (
                                                    <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                                            <SelectTrigger className="rounded-xl border-gray-100 h-11 bg-gray-50/50">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {anos.map(a => (
                                                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-end">
                                    <Button
                                        onClick={() => refetch()}
                                        className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 gap-2"
                                        disabled={isLoading}
                                    >
                                        <Search className="h-4 w-4" />
                                        Filtrar
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <History className="h-5 w-5 text-primary" />
                                Histórico
                            </h2>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="rounded-full bg-white border-gray-100 text-gray-500 font-medium">
                                    {occurrences.length} {occurrences.length === 1 ? 'registro' : 'registros'}
                                </Badge>
                                <Button
                                    onClick={() => openOccurrenceFormDialog({ onSuccess: refetch })}
                                    className="rounded-xl h-9 px-4 gap-2 shadow-sm font-bold"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Nova Ocorrência</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <ListSkeleton />
                    ) : occurrences.length > 0 ? (
                        <div className="grid gap-4">
                            {occurrences.map((occ) => (
                                <Card key={occ.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge className={cn(
                                                        "rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider",
                                                        occ.impacto_financeiro ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                    )}>
                                                        {occ.tipo?.nome}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                                        <CalendarIcon className="h-3 w-3" />
                                                        {format(new Date(occ.data_ocorrencia), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                                                    </div>
                                                </div>

                                                <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {occ.colaborador?.nome_completo}
                                                </h3>

                                                {occ.observacao && (
                                                    <div className="relative pl-3 border-l-2 border-primary/10 py-1">
                                                        <p className="text-sm text-gray-600 line-clamp-2 italic leading-relaxed">
                                                            "{occ.observacao}"
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 pt-1 text-[11px] text-gray-500 font-medium">
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <User className="h-3 w-3 text-gray-400" />
                                                        </div>
                                                        <span>Por: {occ.criado_por_usuario?.nome_completo?.split(' ')[0]}</span>
                                                    </div>
                                                    {occ.vinculo?.cliente?.nome_fantasia && (
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-50 rounded-lg">
                                                            <Filter className="h-3 w-3 text-gray-400" />
                                                            <span>{occ.vinculo.cliente.nome_fantasia}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-between self-stretch">
                                                <div className="text-right">
                                                    <p className={cn(
                                                        "text-lg font-black tracking-tight",
                                                        occ.impacto_financeiro ? "text-red-600" : "text-gray-900"
                                                    )}>
                                                        {occ.valor ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(occ.valor) : '—'}
                                                    </p>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                    onClick={() => handleDelete(occ)}
                                                >
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <UnifiedEmptyState
                            icon={AlertCircle}
                            title="Nenhuma ocorrência encontrada"
                            description="Tente ajustar o período ou o colaborador nos filtros acima."
                        />
                    )}
                </div>
            </PullToRefreshWrapper>
            <LoadingOverlay active={deleteMutation.isPending} text="Removendo..." />
        </>
    );
}

const History = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
    </svg>
);

export default Occurrences;
