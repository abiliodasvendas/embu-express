import { STATUS_PONTO } from "@/constants/ponto";
import { format, isAfter, startOfToday, addDays } from "date-fns";

export type ManagementStatus = 'LATE' | 'WORKING' | 'DONE' | 'WAITING' | 'ABSENT';

export const getStatusLabel = (status: string | null, type: 'entrada' | 'saida') => {
    if (!status) return type === 'saida' ? "Trabalhando" : "Pendente";

    switch (status) {
        case STATUS_PONTO.VERDE: return "No Horário";
        case STATUS_PONTO.AMARELO: return type === 'entrada' ? "Atraso" : "Hora Extra";
        case STATUS_PONTO.ANTECIPADA: return type === 'entrada' ? "Antecipada" : "Antecipada";
        case STATUS_PONTO.VERMELHO: return type === 'entrada' ? "Atraso Crítico" : "HE Excessiva";
        case STATUS_PONTO.CINZA: return "Aguardando";
        case STATUS_PONTO.EM_ANDAMENTO: return "Trabalhando";
        case STATUS_PONTO.PENDENTE: return "Falta de Saída";
        case 'AUSENTE': return "Ausente";
        case 'iniciou': return "Iniciou";
        case 'concluiu': return "Concluiu";
        case 'trabalhando': return "Trabalhando";
        default: return status;
    }
};

export const getStatusColorClass = (status: string | null, type?: 'entrada' | 'saida') => {
    switch (status) {
        case STATUS_PONTO.VERDE: return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case STATUS_PONTO.AMARELO:
            return type === 'saida'
                ? "bg-sky-100 text-sky-700 border-sky-200" // Hora Extra (Blue)
                : "bg-amber-100 text-amber-700 border-amber-200"; // Atraso (Amber/Yellow/Orange)
        case STATUS_PONTO.ANTECIPADA:
            return type === 'entrada'
                ? "bg-sky-100 text-sky-700 border-sky-200" // Entrada Antecipada (Blue)
                : "bg-orange-100 text-orange-700 border-orange-200"; // Saída Antecipada (Orange)
        case STATUS_PONTO.VERMELHO:
            return type === 'entrada'
                ? "bg-rose-100 text-rose-700 border-rose-200" // Atraso Crítico
                : "bg-indigo-900/10 text-indigo-800 border-indigo-200"; // HE Excessiva (Dark Blue)
        case 'AUSENTE':
        case STATUS_PONTO.AUSENTE:
            return "bg-rose-50 text-rose-700 border-rose-100"; // Ausente (Rose tone for both)
        case STATUS_PONTO.CINZA:
            return "bg-gray-100 text-gray-500 border-gray-200";
        case STATUS_PONTO.EM_ANDAMENTO: return "bg-blue-50 text-blue-600 border-blue-100";
        case 'iniciou': return "bg-sky-50 text-sky-600 border-sky-100";
        case 'concluiu': return "bg-indigo-50 text-indigo-700 border-indigo-100";
        case STATUS_PONTO.PENDENTE: return "bg-orange-50 text-orange-600 border-orange-100";
        default: return "bg-gray-100 text-gray-500 border-gray-200";
    }
};

export const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const calculateTotalTime = (entrada?: string | null, saida?: string | null, pausasMinutos: number = 0) => {
    if (!entrada || !saida) return null;
    const start = new Date(entrada);
    const end = new Date(saida);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000) - pausasMinutos;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};

export const formatMinutes = (minutes: number, showSign: boolean = false) => {
    const roundedMin = Math.round(minutes);
    const absMin = Math.abs(roundedMin);
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    const sign = roundedMin < 0 ? "-" : (showSign && roundedMin > 0 ? "+" : "");

    return `${sign}${h}h ${String(m).padStart(2, "0")}m`;
};

/**
 * Determines the management status of a time record
 * Used for KPI filtering and status badges (Internal/Public)
 */
export const getManagementStatus = (record: any, dateReference: Date): ManagementStatus => {
    const isToday = format(dateReference, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    const isPast = !isToday && dateReference < startOfToday();

    // 1. Finalizado
    if (record.saida_hora) return 'DONE';

    // 2. Trabalhando (Se tem entrada mas não tem saída)
    if (record.entrada_hora) return 'WORKING';

    // 3. Se não tem entrada:
    if (!record.entrada_hora) {
        // Se for data passada -> Faltou
        if (isPast) return 'ABSENT';

        // Se for hoje
        if (isToday) {
            if (record.detalhes_calculo?.entrada?.turno_base) {
                const now = new Date();
                
                // Horário esperado de entrada
                const [hIn, mIn] = record.detalhes_calculo.entrada.turno_base.split(':').map(Number);
                const shiftStart = new Date(dateReference);
                shiftStart.setHours(hIn, mIn, 0, 0);

                // Horário esperado de saída
                const [hOut, mOut] = record.detalhes_calculo.saida?.turno_base?.split(':').map(Number) || [23, 59];
                let shiftEnd = new Date(dateReference);
                shiftEnd.setHours(hOut, mOut, 0, 0);

                // BUG FIX: Se o horário de saída é menor ou igual ao de entrada, o turno vira a noite (ex: 18:00 às 00:00)
                if (hOut < hIn || (hOut === hIn && mOut <= mIn)) {
                    shiftEnd = addDays(shiftEnd, 1);
                }

                // Se já passou do horário de FIM do turno e ele nunca entrou -> Faltou
                if (isAfter(now, shiftEnd)) return 'ABSENT';

                // Se já passou do horário de INÍCIO do turno e ele não entrou -> Atrasado
                if (isAfter(now, shiftStart)) return 'LATE';
            }
            
            // Se o turno ainda não começou (ex: agora é 10h e o turno é às 18h)
            return 'WAITING';
        }
    }

    return 'WAITING';
};
