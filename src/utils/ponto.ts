import { STATUS_PONTO } from "@/constants/ponto";

export const getStatusLabel = (status: string | null, type: 'entrada' | 'saida') => {
    if (!status) return type === 'saida' ? "Em Andamento" : "Pendente";

    switch (status) {
        case STATUS_PONTO.VERDE: return "No Horário";
        case STATUS_PONTO.AMARELO: return type === 'entrada' ? "Atraso" : "Hora Extra";
        case STATUS_PONTO.ANTECIPADA: return type === 'entrada' ? "Entrada Antecipada" : "Saída Antecipada";
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
            return type === 'entrada'
                ? "bg-amber-100 text-amber-700 border-amber-200" // Atraso entry
                : "bg-sky-100 text-sky-700 border-sky-200"; // HE normal (Blue)
        case STATUS_PONTO.ANTECIPADA:
            return type === 'entrada'
                ? "bg-sky-100 text-sky-700 border-sky-200" // Entrada Antecipada (Blue)
                : "bg-orange-100 text-orange-700 border-orange-200"; // Saída Antecipada (Orange)
        case STATUS_PONTO.VERMELHO: 
            return type === 'entrada'
                ? "bg-rose-100 text-rose-700 border-rose-200" // Atraso Crítico
                : "bg-indigo-900/10 text-indigo-800 border-indigo-200"; // HE Excessiva (Dark Blue)
        case 'AUSENTE': return "bg-slate-100 text-slate-500 border-slate-200 opacity-60";
        case STATUS_PONTO.CINZA: return "bg-gray-100 text-gray-500 border-gray-200";
        case STATUS_PONTO.EM_ANDAMENTO: return "bg-blue-50 text-blue-600 border-blue-100";
        case 'iniciou': return "bg-sky-50 text-sky-600 border-sky-100";
        case 'concluiu': return "bg-indigo-50 text-indigo-700 border-indigo-100";
        case STATUS_PONTO.PENDENTE: return "bg-orange-50 text-orange-600 border-orange-100";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
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
