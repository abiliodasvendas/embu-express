import { STATUS_PONTO } from "@/constants/ponto";

export const getStatusLabel = (status: string | null, type: 'entrada' | 'saida') => {
    if (!status) return type === 'saida' ? "Em Andamento" : "Pendente";

    switch (status) {
        case STATUS_PONTO.VERDE: return "No Horário";
        case STATUS_PONTO.AMARELO: return type === 'entrada' ? "Atraso" : "Hora Extra";
        case STATUS_PONTO.ANTECIPADA: return type === 'entrada' ? "Entrada Antecipada" : "Saída Antecipada";
        case STATUS_PONTO.VERMELHO: return type === 'entrada' ? "Atraso Crítico" : "HE Excessiva";
        case STATUS_PONTO.CINZA: return "Aguardando";
        case STATUS_PONTO.EM_ANDAMENTO: return "Em Andamento";
        case STATUS_PONTO.PENDENTE: return "Pendente";
        default: return status;
    }
};

export const getStatusColorClass = (status: string | null, type?: 'entrada' | 'saida') => {
    switch (status) {
        case STATUS_PONTO.VERDE: return "bg-green-100 text-green-700 border-green-200";
        case STATUS_PONTO.AMARELO: return "bg-amber-100 text-amber-700 border-amber-200";
        case STATUS_PONTO.ANTECIPADA:
            return type === 'entrada'
                ? "bg-blue-100 text-blue-700 border-blue-200" // Entrada cedo é bom/neutro
                : "bg-orange-100 text-orange-700 border-orange-200"; // Saída cedo é alerta
        case STATUS_PONTO.VERMELHO: return "bg-red-100 text-red-700 border-red-200";
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

export const formatMinutes = (totalMinutes: number) => {
    const absMinutes = Math.abs(totalMinutes);
    const sign = totalMinutes < 0 ? "-" : "+";

    if (absMinutes < 60) return `${sign}${absMinutes} min`;

    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;

    return `${sign}${hours}h ${minutes}min`;
};
