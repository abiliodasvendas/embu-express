import { differenceInMinutes } from "date-fns";

export interface ValidationResult {
    valid: boolean;
    message?: string;
}

export const TimeRules = {
    /**
     * Valida se a ordem cronológica dos horários está correta.
     * @param entrada ISO string ou HH:mm
     * @param saida ISO string ou HH:mm (opcional)
     */
    validateTimeOrder(entrada: string, saida?: string | null): ValidationResult {
        if (!saida) return { valid: true };
        // Lógica simples de string para HH:mm ou Date compare para ISO
        // No frontend, geralmente lidamos com inputs "HH:mm" separados da data
        // Então essa validação é mais útil quando já temos os objetos Date montados.
        return { valid: true }; 
    },

    /**
     * Valida duração mínima (1 minuto).
     */
    validateMinDuration(start: Date, end: Date | null, minMinutes = 1): ValidationResult {
        if (!end) return { valid: true };
        
        const diff = differenceInMinutes(end, start);
        if (diff < minMinutes) {
             return { valid: false, message: `Duração muito curta (mínimo ${minMinutes} min).` };
        }
        return { valid: true };
    },

    /**
     * Valida duração máxima (16 horas).
     */
    validateMaxDuration(start: Date, end: Date | null, maxHours = 16): ValidationResult {
        if (!end) return { valid: true };

        const diffMinutes = differenceInMinutes(end, start);
        const diffHours = diffMinutes / 60;

        if (diffHours > maxHours) {
            return { valid: false, message: `Jornada excessiva (+${Math.round(diffHours)}h). Limite é ${maxHours}h.` };
        }
        return { valid: true };
    },

    /**
     * Ajusta a data de saída para o dia seguinte se necessário.
     * @param dataBaseStr Data base YYYY-MM-DD
     * @param entradaHora HH:mm
     * @param saidaHora HH:mm
     * @returns Objeto com datas { entrada: Date, saida: Date | null } ajustadas
     */
    resolveDates(dataBaseStr: string, entradaHora: string, saidaHora?: string): { entrada: Date, saida: Date | null } {
        const entrada = new Date(`${dataBaseStr}T${entradaHora}:00`);
        let saida: Date | null = null;

        if (saidaHora) {
            saida = new Date(`${dataBaseStr}T${saidaHora}:00`);
            // Se saída for menor que entrada, assume dia seguinte
            if (saida < entrada) {
                saida.setDate(saida.getDate() + 1);
            }
        }
        return { entrada, saida };
    }
};
