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
import { AlertCircle, Filter, User, X, Calendar as CalendarIcon, Plus, Settings } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { ChevronRight } from "lucide-react";
import { OccurrenceDetailsDialog } from "@/components/dialogs/OccurrenceDetailsDialog";
import { DateNavigation } from "@/components/common/DateNavigation";


export function Occurrences() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openOccurrenceFormDialog,
        openOccurrenceTypesDialog
    } = useLayout();

    // States for filtering
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedCollaborator, setSelectedCollaborator] = useState<string>("TODOS");

    const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Calculated range for API
    const dateRange = useMemo(() => {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        return {
            inicio: formattedDate,
            fim: formattedDate
        };
    }, [selectedDate]);


    const { data: occurrences = [], isLoading, refetch } = useOcorrencias({
        data_inicio: dateRange.inicio,
        data_fim: dateRange.fim,
        usuario_id: selectedCollaborator !== "TODOS" ? selectedCollaborator : undefined,
        order: "data_ocorrencia",
        ascending: false,
    });

    const { data: collaborators = [] } = useCollaborators({});
    const deleteMutation = useDeleteOcorrencia();



    useEffect(() => {
        setPageTitle("Ocorrências");
    }, [setPageTitle]);

    const onRefresh = useCallback(async () => {
        await refetch();
    }, [refetch]);

    const handleDelete = (occurrence: Ocorrencia) => {
        openConfirmationDialog({
            title: "Remover Ocorrência",
            description: `Deseja realmente remover esta ocorrência de ${occurrence.tipo?.descricao}?`,
            confirmText: "Remover",
            variant: "destructive",
            onConfirm: async () => {
                await deleteMutation.mutateAsync(occurrence.id);
                setIsDetailsOpen(false);
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
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Data da Ocorrência</label>
                                    <DateNavigation 
                                        date={selectedDate} 
                                        onNavigate={setSelectedDate} 
                                    />
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
                                <Badge variant="outline" className="rounded-full bg-white border-gray-100 text-gray-500 font-medium font-bold">
                                    {occurrences.length} {occurrences.length === 1 ? 'registro' : 'registros'}
                                </Badge>
                                <Button
                                    onClick={() => openOccurrenceTypesDialog()}
                                    variant="outline"
                                    className="rounded-xl h-9 px-4 gap-2 shadow-sm font-semibold border-gray-200 bg-white"
                                    size="sm"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline">Gerenciar Tipos</span>
                                </Button>
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

                    {/* Timeline View */}
                    <Card className="border-0 shadow-sm rounded-3xl overflow-hidden">
                        <CardContent className="p-8">
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />)}
                                </div>
                            ) : occurrences.length > 0 ? (
                                <div className="relative space-y-0">
                                    {/* Linha Vertical da TimeLine */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

                                    {occurrences.map((oc, index) => (
                                        <div
                                            key={oc.id}
                                            onClick={() => {
                                                setSelectedOccurrence(oc);
                                                setIsDetailsOpen(true);
                                            }}
                                            className="relative pl-9 py-4 group cursor-pointer transition-all hover:bg-gray-50/50 rounded-2xl"
                                        >
                                            {/* Ponto da Timeline */}
                                            <div className={cn(
                                                "absolute left-0 top-[22px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110",
                                                oc.tipo_lancamento === "SAIDA" ? "bg-red-500" : "bg-green-500"
                                            )}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                            </div>

                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                                                            {format(new Date(oc.data_ocorrencia), "dd 'de' MMM", { locale: ptBR })}
                                                        </span>
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-gray-200 text-gray-500 font-bold bg-white">
                                                            {oc.tipo?.descricao || 'Ocorrência'}
                                                        </Badge>
                                                        <span className="text-[11px] font-bold text-gray-900 truncate max-w-[150px]">
                                                            {oc.colaborador?.nome_completo}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-semibold text-gray-700 truncate pr-4 italic">
                                                        {oc.observacao || 'Sem observação'}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-3 shrink-0">
                                                    {oc.impacto_financeiro && (
                                                        <div className={cn(
                                                            "text-xs font-black px-2 py-1 rounded-lg",
                                                            oc.tipo_lancamento === "SAIDA" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                                                        )}>
                                                            {oc.tipo_lancamento === "SAIDA" ? "-" : "+"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(oc.valor || 0)}
                                                        </div>
                                                    )}
                                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <UnifiedEmptyState
                                    icon={AlertCircle}
                                    title="Nenhuma ocorrência"
                                    description="Não há registros para os filtros selecionados."
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </PullToRefreshWrapper>
            <LoadingOverlay active={deleteMutation.isPending} text="Removendo..." />

            <OccurrenceDetailsDialog
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
                occurrence={selectedOccurrence}
                onDelete={() => handleDelete(selectedOccurrence)}
            />
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
