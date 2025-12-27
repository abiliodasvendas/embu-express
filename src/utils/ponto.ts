
export const getStatusLabel = (status: string | null, type: 'entrada' | 'saida') => {
    if (!status) return type === 'saida' ? "Em Andamento" : "Pendente";
    
    switch (status) {
        case "VERDE": return "No Horário";
        case "AMARELO": return type === 'entrada' ? "Atraso" : "Hora Extra";
        case "VERMELHO": return type === 'entrada' ? "Atraso Crítico" : "HE Excessiva";
        case "CINZA": return "Indefinido";
        case "EM_ANDAMENTO": return "Em Andamento";
        default: return status;
    }
};

export const getStatusColorClass = (status: string | null) => {
    switch (status) {
        case "VERDE": return "bg-green-100 text-green-700 border-green-200";
        case "AMARELO": return "bg-yellow-100 text-yellow-700 border-yellow-200";
        case "VERMELHO": return "bg-red-100 text-red-700 border-red-200";
        default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
};

export const formatTime = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const calculateTotalTime = (entrada?: string | null, saida?: string | null) => {
    if (!entrada || !saida) return null;
    const start = new Date(entrada);
    const end = new Date(saida);
    const totalMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}min`;
};
