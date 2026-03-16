import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Ocorrencia } from "@/types/database";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Briefcase, Calendar, Clock, User, X } from "lucide-react";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";

interface OccurrenceDetailsDialogProps {
    occurrence: Ocorrencia | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete?: (id: number) => void | Promise<void>;
}

export function OccurrenceDetailsDialog({
    occurrence,
    open,
    onOpenChange,
    onDelete,
}: OccurrenceDetailsDialogProps) {
    if (!occurrence) return null;

    const isNegative = occurrence.tipo_lancamento === LANCAMENTO_TIPO.SAIDA;

    const formatTime = (time?: string) => {
        if (!time) return "";
        return time.slice(0, 5); // From HH:mm:ss to HH:mm
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-lg p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl" hideCloseButton>
                {/* Header Padronizado */}
                <div className="bg-blue-600 p-6 text-center relative shrink-0">
                    <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </DialogClose>

                    <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-white">
                        Detalhes da Ocorrência
                    </DialogTitle>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                    {/* Resumo Principal */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 px-4 py-1.5 rounded-xl text-sm font-bold mb-4">
                            {occurrence.tipo?.descricao || 'Ocorrência'}
                        </Badge>
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 px-4 italic">
                            "{occurrence.observacao}"
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Data e Hora */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="bg-gray-50 p-2.5 rounded-xl">
                                <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Data do Registro</p>
                                <p className="text-sm font-bold text-gray-700 mt-0.5">
                                    {format(new Date(occurrence.data_ocorrencia), "PPPP", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        {/* Vínculo/Turno */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="bg-gray-50 p-2.5 rounded-xl">
                                <Briefcase className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Turno</p>
                                {occurrence.colaborador_cliente_id ? (
                                    <p className="text-sm font-bold text-gray-700 mt-0.5">
                                        {occurrence.vinculo?.cliente?.nome_fantasia || 'Turno Vinculado'} 
                                        {occurrence.vinculo && (
                                            <span className="text-xs font-medium text-gray-500 ml-1">
                                                ({formatTime(occurrence.vinculo.hora_inicio)} - {formatTime(occurrence.vinculo.hora_fim)})
                                            </span>
                                        )}
                                    </p>
                                ) : (
                                    <p className="text-sm font-bold text-primary italic mt-0.5">
                                        Geral (Avulsa)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Impacto Financeiro (Condicional) */}
                        {occurrence.impacto_financeiro && (
                            <div className={cn(
                                "rounded-2xl p-5 shadow-sm border flex flex-col gap-4 transition-all",
                                isNegative ? "bg-red-50/30 border-red-100" : "bg-green-50/30 border-green-100"
                            )}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-2 rounded-xl",
                                            isNegative ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                                        )}>
                                            {isNegative ? <ArrowDownCircle className="w-5 h-5" /> : <ArrowUpCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Tipo de Lançamento</p>
                                            <p className={cn("text-xs font-bold", isNegative ? "text-red-700" : "text-green-700")}>
                                                {isNegative ? "Saída (Débito)" : "Entrada (Crédito)"}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Valor do Impacto</p>
                                        <p className={cn("text-xl font-black", isNegative ? "text-red-700" : "text-green-700")}>
                                            {isNegative ? "-" : "+"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(occurrence.valor || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Metadados Adicionais */}
                        <div className="bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                            <div className="p-4 border-b border-gray-50 flex items-center gap-3">
                                <User className="w-4 h-4 text-gray-300" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Registrado por</p>
                                    <p className="text-xs font-bold text-gray-600 mt-1">{occurrence.criado_por_usuario?.nome_completo || 'Sistema'}</p>
                                </div>
                            </div>
                            <div className="p-4 flex items-center gap-3">
                                <Clock className="w-4 h-4 text-gray-300" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Criado em</p>
                                    <p className="text-xs font-bold text-gray-600 mt-1">
                                        {occurrence.created_at ? format(new Date(occurrence.created_at), "Pp", { locale: ptBR }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Padronizado */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
                    {onDelete && (
                        <Button
                            variant="outline"
                            onClick={() => occurrence && onDelete(occurrence.id)}
                            className="flex-1 h-11 rounded-xl border-red-200 text-red-600 font-bold hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            Excluir
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className={cn("h-11 rounded-xl border-gray-200 font-bold text-gray-700 hover:bg-white shadow-sm", onDelete ? "flex-1" : "w-full")}
                    >
                        Fechar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
