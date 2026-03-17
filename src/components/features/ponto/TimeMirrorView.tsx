import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { useTimeMirror } from "@/hooks/api/useTimeMirror";
import { cn } from "@/lib/utils";
import { Calendar, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { useTimeRecord } from "@/hooks/api/useTimeRecord";
import { useDeletePonto } from "@/hooks/api/usePontoMutations";
import { RegistroPonto } from "@/types/database";
import { usePermissions } from "@/hooks/business/usePermissions";
import { formatMinutes } from "@/utils/ponto";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { useTimeMirrorBusiness } from "@/hooks/business/useTimeMirrorBusiness";
import { TimeMirrorDailyCard } from "./TimeMirrorDailyCard";

interface TimeMirrorViewProps {
    usuarioId?: string;
    selectedMonth?: number;
    selectedYear?: number;
    selectedShift?: string;
    hideCollaboratorSelect?: boolean;
}

export function TimeMirrorView({ 
    usuarioId, 
    selectedMonth,
    selectedYear,
    selectedShift = STATUS_CADASTRO.TODOS,
    hideCollaboratorSelect = false 
}: TimeMirrorViewProps) {
    const month = selectedMonth || new Date().getMonth() + 1;
    const year = selectedYear || new Date().getFullYear();

    const { data: rawReport = [], isLoading, refetch } = useTimeMirror(
        usuarioId || undefined,
        month,
        year
    );

    const { processRecords } = useTimeMirrorBusiness();
    
    const { records: report, totals } = useMemo(() => 
        processRecords(rawReport, selectedShift), 
    [rawReport, selectedShift, processRecords]);

    const { openTimeRecordDetailsDialog, openTimeRecordDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
    const { mutateAsync: deletePonto } = useDeletePonto();
    const [selectedPontoId, setSelectedPontoId] = useState<number | null>(null);
    const { data: fullRecord, isFetching: isFetchingRecord } = useTimeRecord(selectedPontoId);

    const handleDelete = (record: RegistroPonto) => {
        openConfirmationDialog({
            title: "Excluir Registro",
            description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
            confirmText: "Sim, excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deletePonto(Number(record.id));
                closeConfirmationDialog();
            }
        });
    };

    const handleEditFromDetails = (record: RegistroPonto) => {
        openTimeRecordDialog({ record });
    };

    useEffect(() => {
        if (fullRecord && selectedPontoId) {
            openTimeRecordDetailsDialog({
                record: fullRecord,
                onEdit: handleEditFromDetails,
                onDelete: handleDelete
            });
            setSelectedPontoId(null);
        }
    }, [fullRecord, selectedPontoId]);

    const { can } = usePermissions();
    const canViewAll = can(PERMISSIONS.PONTO.ADMIN_VER);

    return (
        <div className="space-y-6">
                {!usuarioId ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-primary/5 rounded-full">
                            <Calendar className="h-8 w-8 text-primary/40" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Nenhum colaborador selecionado</h3>
                            <p className="text-sm text-gray-500 max-w-[280px]">Escolha um colaborador acima para visualizar o espelho de ponto.</p>
                        </div>
                    </div>
                ) : isLoading ? (
                    <ListSkeleton />
                ) : report.length > 0 ? (
                    <>
                        {/* Summary Cards */}
                        <div className={cn(
                            "grid gap-4",
                            canViewAll ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"
                        )}>
                            {canViewAll && (
                                <>
                                    <Card className="border-none shadow-sm rounded-3xl bg-blue-50/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-100 rounded-2xl">
                                                    <Clock className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Trabalhado</p>
                                                    <h3 className="text-xl font-black text-blue-900">{formatMinutes(totals.worked)}</h3>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm rounded-3xl bg-amber-50/50">
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-amber-100 rounded-2xl">
                                                    <Calendar className="h-6 w-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider mb-1">Total Esperado</p>
                                                    <h3 className="text-xl font-black text-amber-900">{formatMinutes(totals.expected)}</h3>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className={cn(
                                        "border-none shadow-sm rounded-3xl",
                                        totals.balance >= 0 ? "bg-emerald-50/50" : "bg-red-50/50"
                                    )}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-3 rounded-2xl",
                                                    totals.balance >= 0 ? "bg-emerald-100" : "bg-red-100"
                                                )}>
                                                    {totals.balance >= 0 ? <TrendingUp className="h-6 w-6 text-emerald-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "text-xs font-bold uppercase tracking-wider mb-1",
                                                        totals.balance >= 0 ? "text-emerald-600" : "text-red-600"
                                                    )}>Saldo do Mês</p>
                                                    <h3 className={cn(
                                                        "text-2xl font-black",
                                                        totals.balance >= 0 ? "text-emerald-900" : "text-red-900"
                                                    )}>{formatMinutes(totals.balance)}</h3>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>

                        {/* Daily Logs */}
                        <div className="grid gap-3">
                            <div className={cn(
                                "hidden md:grid px-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pb-2",
                                canViewAll ? "grid-cols-8" : "grid-cols-4"
                            )}>
                                <div className="col-span-1">Data</div>
                                <div className="col-span-1">Turno</div>
                                <div className="col-span-1">Entrada</div>
                                <div className="col-span-1 text-right md:text-left">Saída</div>
                                {canViewAll && (
                                    <>
                                        <div className="col-span-1 text-center">Intervalo</div>
                                        <div className="col-span-1 text-center">Trabalhado</div>
                                        <div className="col-span-1 text-center">Esperado</div>
                                        <div className="col-span-1 text-right">Saldo</div>
                                    </>
                                )}
                            </div>

                            {report.map((day, idx) => (
                                <TimeMirrorDailyCard
                                    key={idx}
                                    day={day}
                                    canViewAll={canViewAll}
                                    isFetchingRecord={isFetchingRecord}
                                    selectedPontoId={selectedPontoId}
                                    onClick={(id) => setSelectedPontoId(id)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <UnifiedEmptyState
                        icon={Calendar}
                        title="Sem registros neste mês"
                        description="Não foram encontrados pontos batidos para este colaborador no período selecionado."
                    />
                )}
            </div>
    );
}
