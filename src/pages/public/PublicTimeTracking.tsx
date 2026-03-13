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

export default function PublicTimeTracking() {
    const { uuid } = useParams();
    const [date, setDate] = useState(new Date());
    const [selectedCollabId, setSelectedCollabId] = useState("todos");
    const [selectedShift, setSelectedShift] = useState("todos");

    const { data: records, isLoading } = usePublicTimeTracking(uuid, format(date, "yyyy-MM-dd"));
    const { data: collaborators } = usePublicCollaborators(uuid);

    // Filter Logic
    const filteredRecords = records?.filter(r => {
        const matchesCollab = selectedCollabId === "todos" || r.usuario_id === selectedCollabId;
        const matchesShift = selectedShift === "todos" || String(r.colaborador_cliente_id) === selectedShift;
        return matchesCollab && matchesShift;
    });

    const shifts = Array.from(new Set(collaborators?.flatMap(c => c.links?.map((l: any) => ({
        id: l.id,
        label: `${l.hora_inicio.substring(0, 5)} - ${l.hora_fim.substring(0, 5)}`
    }))) || []));

    // Remove duplicate shifts by ID
    const uniqueShifts = Array.from(new Map(shifts.map(s => [s.id, s])).values());

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar */}
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Date Picker (Simplified) */}
                        <div className="flex-1 max-w-sm">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Data do Controle</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input 
                                    type="date" 
                                    value={format(date, "yyyy-MM-dd")} 
                                    onChange={(e) => setDate(new Date(e.target.value + 'T12:00:00'))}
                                    className="pl-10 rounded-xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all h-11"
                                />
                            </div>
                        </div>

                        {/* Collaborator Select */}
                        <div className="flex-[2]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Colaborador</label>
                            <Select value={selectedCollabId} onValueChange={setSelectedCollabId}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue placeholder="Todos os colaboradores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os colaboradores</SelectItem>
                                    {collaborators?.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Shift Filter */}
                        <div className="flex-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Turno</label>
                            <Select value={selectedShift} onValueChange={setSelectedShift}>
                                <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 h-11">
                                    <SelectValue placeholder="Todos os turnos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os turnos</SelectItem>
                                    {uniqueShifts.map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.label}</SelectItem>
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
                        <Card key={record.id} className="border-none shadow-sm rounded-3xl group hover:shadow-md transition-all duration-300">
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
                                                        ? `${record.detalhes_calculo.entrada.turno_base.substring(0, 5)} - ${(record.detalhes_calculo.saida?.turno_base || record.turno_hora_fim || collaborators?.find((c: any) => c.links?.some((l: any) => l.id === record.colaborador_cliente_id))?.links?.find((l: any) => l.id === record.colaborador_cliente_id)?.hora_fim || '...').substring(0, 5)}` 
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
                                                <Badge variant="outline" className={cn("text-[9px] w-fit", getStatusColorClass(record.status_entrada))}>
                                                    {getStatusLabel(record.status_entrada, 'entrada')}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saída</p>
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-xl font-black text-gray-800">{formatTime(record.saida_hora)}</span>
                                                {record.saida_hora && (
                                                    <Badge variant="outline" className={cn("text-[9px] w-fit", getStatusColorClass(record.status_saida))}>
                                                        {getStatusLabel(record.status_saida, 'saida')}
                                                    </Badge>
                                                )}
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
                                                (record.saldo_minutos || 0) >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                                            )}>
                                                {formatMinutes(record.saldo_minutos || 0)}
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
    );
}
