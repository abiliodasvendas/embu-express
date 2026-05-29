import { useMemo } from 'react';
import { getManagementStatus } from '@/utils/ponto';
import { ManagementStatus } from '@/types/enums';
import { RegistroPonto, Usuario, ColaboradorCliente } from '@/types/database';

interface UseTimeTrackingBusinessProps {
    records: RegistroPonto[] | undefined;
    date: Date;
    collaborators?: Usuario[];
    manualAbsenceIds?: string[];
}

export function useTimeTrackingBusiness({ records, date, collaborators, manualAbsenceIds = [] }: UseTimeTrackingBusinessProps) {
    // 1. Process records with unified management status and enriched collaborator data
    const processedRecords = useMemo(() => {
        return records?.map(r => {
            const collaborator = collaborators?.find(c => c.id === r.usuario_id);
            
            // Se o usuário está marcado manualmente como ausente e não tem entrada registrada, forçamos o status ABSENT
            const isManuallyAbsent = manualAbsenceIds.includes(r.usuario_id) && !r.entrada_hora;
            const status = isManuallyAbsent 
                ? ManagementStatus.ABSENT 
                : getManagementStatus(r, date) as ManagementStatus;

            return {
                ...r,
                // Ensure the full collaborator object (with links) is available for filtering
                usuario: collaborator || r.usuario, 
                mgtStatus: status,
                isManual: isManuallyAbsent
            };
        }) || [];
    }, [records, date, collaborators, manualAbsenceIds]);

    // 2. Calculate KPI counts
    const kpiCounts = useMemo(() => {
        const counts: Record<string, number> = { 
            [ManagementStatus.ALL]: processedRecords.length, 
            [ManagementStatus.LATE]: 0, 
            [ManagementStatus.WORKING]: 0, 
            [ManagementStatus.OVERTIME]: 0,
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

    // 3. Extract unique shifts from all collaborators (not just those with records)
    const uniqueShifts = useMemo(() => {
        const shifts = new Set<string>();
        
        // From existing records
        processedRecords.forEach(r => {
            const entryShift = r.detalhes_calculo?.entrada?.turno_base;
            const exitShift = r.detalhes_calculo?.saida?.turno_base;
            if (entryShift && exitShift) {
                shifts.add(`${entryShift.substring(0, 5)} - ${exitShift.substring(0, 5)}`);
            }
        });

        // From all collaborators (to ensure all scheduled shifts are visible)
        collaborators?.forEach(c => {
            c.links?.forEach((link: any) => {
                if (link.hora_inicio && link.hora_fim) {
                    shifts.add(`${link.hora_inicio.substring(0, 5)} - ${link.hora_fim.substring(0, 5)}`);
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
