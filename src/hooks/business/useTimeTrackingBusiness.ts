import { useMemo } from 'react';
import { getManagementStatus } from '@/utils/ponto';
import { ManagementStatus } from '@/types/enums';
import { RegistroPonto, Usuario, ColaboradorCliente } from '@/types/database';

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
        const counts: Record<string, number> = { 
            [ManagementStatus.ALL]: processedRecords.length, 
            [ManagementStatus.LATE]: 0, 
            [ManagementStatus.WORKING]: 0, 
            [ManagementStatus.DONE]: 0, 
            [ManagementStatus.WAITING]: 0, 
            [ManagementStatus.ABSENT]: 0 
        };
        processedRecords.forEach(r => {
            if (counts[r.mgtStatus] !== undefined) {
                counts[r.mgtStatus]++;
            }
        });
        return counts;
    }, [processedRecords]);

    // 3. Extract unique shifts from records for filtering (based on scheduled shift for THAT day)
    const uniqueShifts = useMemo(() => {
        const shifts = new Set<string>();
        
        processedRecords.forEach(r => {
            const entryShift = r.detalhes_calculo?.entrada?.turno_base;
            const exitShift = r.detalhes_calculo?.saida?.turno_base;
            if (entryShift && exitShift) {
                shifts.add(`${entryShift.substring(0, 5)} - ${exitShift.substring(0, 5)}`);
            }
        });

        return Array.from(shifts).sort();
    }, [processedRecords]);

    return {
        processedRecords,
        kpiCounts,
        uniqueShifts,
    };
}
