import { useMemo } from 'react';
import { getManagementStatus, ManagementStatus } from '@/utils/ponto';
import { RegistroPonto, Usuario } from '@/types/database';

interface UseTimeTrackingBusinessProps {
    records: RegistroPonto[] | undefined;
    date: Date;
    collaborators?: Usuario[];
}

export function useTimeTrackingBusiness({ records, date, collaborators }: UseTimeTrackingBusinessProps) {
    // 1. Process records with unified management status and enriched collaborator data
    const processedRecords = useMemo(() => {
        return records?.map(r => {
            const collaborator = collaborators?.find(c => c.id === r.usuario_id);
            return {
                ...r,
                // Ensure the full collaborator object (with links) is available for filtering
                usuario: collaborator || r.usuario, 
                mgtStatus: getManagementStatus(r, date) as ManagementStatus
            };
        }) || [];
    }, [records, date, collaborators]);

    // 2. Calculate KPI counts
    const kpiCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: processedRecords.length, LATE: 0, WORKING: 0, DONE: 0, WAITING: 0, ABSENT: 0 };
        processedRecords.forEach(r => {
            if (counts[r.mgtStatus] !== undefined) {
                counts[r.mgtStatus]++;
            }
        });
        return counts;
    }, [processedRecords]);

    // 3. Extract unique shifts from collaborators for filtering
    const uniqueShifts = useMemo(() => {
        const shifts = new Set<string>();
        
        // Try to get from records first (active shifts today)
        processedRecords.forEach(r => {
            const entryShift = r.detalhes_calculo?.entrada?.turno_base;
            const exitShift = r.detalhes_calculo?.saida?.turno_base;
            if (entryShift && exitShift) {
                shifts.add(`${entryShift.substring(0, 5)} - ${exitShift.substring(0, 5)}`);
            }
        });

        // Supplement with all collaborator links if provided
        collaborators?.forEach(c => {
            c.links?.forEach((l: any) => {
                if (l.hora_inicio && l.hora_fim) {
                    shifts.add(`${l.hora_inicio.substring(0, 5)} - ${l.hora_fim.substring(0, 5)}`);
                }
            });
        });

        return Array.from(shifts).sort();
    }, [processedRecords, collaborators]);

    return {
        processedRecords,
        kpiCounts,
        uniqueShifts,
    };
}
