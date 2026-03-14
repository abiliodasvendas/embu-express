import { useState } from "react";
import { useParams } from "react-router-dom";
import { usePublicTimeTracking, usePublicCollaborators } from "@/hooks/api/usePublicClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, FilterX, Users, Timer, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { formatTime, getStatusColorClass, getStatusLabel, formatMinutes } from "@/utils/ponto";
import { cn } from "@/lib/utils";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { Combobox } from "@/components/ui/combobox";
import { DateNavigation } from "@/components/common/DateNavigation";

export default function PublicTimeTracking() {
    const { uuid } = useParams();
    const [date, setDate] = useState(new Date());
    const [selectedCollabId, setSelectedCollabId] = useState<string>(STATUS_CADASTRO.TODOS);
    const [selectedShift, setSelectedShift] = useState<string>(STATUS_CADASTRO.TODOS);

    const { data: records, isLoading, refetch: refetchTracking } = usePublicTimeTracking(uuid, format(date, "yyyy-MM-dd"));
    const { data: collaborators, refetch: refetchCollabs } = usePublicCollaborators(uuid);

    const handleRefresh = async () => {
        await Promise.all([refetchTracking(), refetchCollabs()]);
    };

    // Filter Logic
    const filteredRecords = records?.filter(r => {
        const matchesCollab = selectedCollabId === STATUS_CADASTRO.TODOS || r.usuario_id === selectedCollabId;
        
        let matchesShift = selectedShift === STATUS_CADASTRO.TODOS;
        if (!matchesShift) {
            const recordShift = r.detalhes_calculo?.entrada?.turno_base && r.detalhes_calculo?.saida?.turno_base
                ? `${r.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${r.detalhes_calculo.saida.turno_base.substring(0, 5)}`
                : null;
            matchesShift = recordShift === selectedShift;
        }
        
        return matchesCollab && matchesShift;
    });

    const uniqueShifts = Array.from(new Set(
        collaborators?.flatMap(c => c.links?.map((l: any) => 
            (l.hora_inicio && l.hora_fim) ? `${l.hora_inicio.substring(0, 5)} - ${l.hora_fim.substring(0, 5)}` : null
        ).filter(Boolean)) || []
    )).sort();

    return (
        <PullToRefreshWrapper onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Date Navigation */}
                        <div className="flex-1 w-full lg:w-auto">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Data</label>
                            <DateNavigation date={date} onNavigate={setDate} />
                        </div>

                        {/* Collaborator Select */}
                        <div className="flex-[2]">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Colaborador</label>
                            <Combobox
                                options={[
                                    { value: STATUS_CADASTRO.TODOS, label: "Todos os colaboradores" },
                                    ...collaborators?.map((c: any) => ({ value: c.id, label: c.nome_completo })) || []
                                ]}
                                value={selectedCollabId}
                                onSelect={(val) => setSelectedCollabId(val || STATUS_CADASTRO.TODOS)}
                                placeholder="Selecione um colaborador..."
                                searchPlaceholder="Buscar colaborador..."
                                emptyText="Nenhum colaborador encontrado."
                                className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-primary/20 font-medium text-gray-700 hover:bg-white hover:text-gray-700 transition-none shadow-none"
                            />
                        </div>

                        {/* Shift Filter */}
                        <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Turno</label>
                            <Select value={selectedShift} onValueChange={setSelectedShift}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-gray-200 focus:ring-primary/20 font-medium text-gray-700 shadow-none">
                                    <SelectValue placeholder="Todos os turnos" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value={STATUS_CADASTRO.TODOS} className="font-medium">Todos os turnos</SelectItem>
                                    {uniqueShifts.map((label: string) => (
                                        <SelectItem key={label} value={label} className="font-medium">{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* List */}
            {isLoading ? (
                <ListSkeleton />
            ) : !filteredRecords || filteredRecords.length === 0 ? (
                <UnifiedEmptyState 
                    icon={FilterX}
                    title="Nenhum registro encontrado"
                    description="Não há registros de ponto para os filtros selecionados nesta data."
                />
            ) : (
                <div className="grid gap-4">
                    {filteredRecords.map((record) => (
                        <Card key={record.id} className={cn(
                            "border-none shadow-sm rounded-3xl group hover:shadow-md transition-all duration-300",
                            record.ausente && "opacity-60 grayscale-[0.5] hover:shadow-sm"
                        )}>
                            <CardContent className="p-5 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                    {/* Collab Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                            <Users className="h-6 w-6 text-primary/40" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{record.usuario?.nome_completo}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[10px] uppercase font-bold px-2 py-0 border-none h-5">
                                                    {record.detalhes_calculo?.entrada?.turno_base 
                                                        ? `${record.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${record.detalhes_calculo.saida?.turno_base?.substring(0, 5) || '...'}` 
                                                        : 'Turno não identificado'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Times */}
                                    <div className="grid grid-cols-2 sm:flex items-center gap-8 sm:gap-12">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entrada</p>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xl font-black text-gray-800">{formatTime(record.entrada_hora)}</span>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "text-[9px] w-fit", 
                                                        record.ausente ? "bg-gray-100 text-gray-400 border-gray-200" : getStatusColorClass(record.status_entrada)
                                                    )}
                                                >
                                                    {record.ausente ? "AUSENTE" : getStatusLabel(record.status_entrada, 'entrada')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saída</p>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xl font-black text-gray-800">{formatTime(record.saida_hora)}</span>
                                                <Badge 
                                                    variant="outline" 
                                                    className={cn(
                                                        "text-[9px] w-fit", 
                                                        record.ausente ? "bg-gray-100 text-gray-400 border-gray-200" : (record.saida_hora ? getStatusColorClass(record.status_saida) : "bg-blue-50 text-blue-400 border-blue-100")
                                                    )}
                                                >
                                                    {record.ausente ? "AUSENTE" : (record.saida_hora ? getStatusLabel(record.status_saida, 'saida') : "TRABALHANDO")}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 sm:gap-6 bg-gray-50 rounded-2xl p-4 sm:p-5">
                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                            <div className="flex items-center gap-1.5 font-bold text-gray-900 justify-center sm:justify-end">
                                                <Timer className="h-4 w-4 text-gray-400" />
                                                <span>{record.saida_hora ? formatMinutes(record.detalhes_calculo?.resumo?.liquido_minutos || 0) : '--:--'}</span>
                                            </div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                                        <div className="text-center sm:text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Saldo</p>
                                            <Badge variant="outline" className={cn(
                                                "font-black text-xs px-3",
                                                (record.ausente || !record.saida_hora) ? "bg-gray-100 text-gray-400 border-gray-200" : ((record.saldo_minutos || 0) >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100")
                                            )}>
                                                {(record.ausente || !record.saida_hora) ? "--:--" : formatMinutes(record.saldo_minutos || 0)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
        </PullToRefreshWrapper>
    );
}
