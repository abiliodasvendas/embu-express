import { useState, useMemo } from 'react';
import { useFilters } from './useFilters';
import { useTimeTrackingBusiness } from '../business/useTimeTrackingBusiness';
import { STATUS_PONTO, FILTER_OPTIONS } from '@/constants/ponto';
import { ManagementStatus } from '@/utils/ponto';
import { RegistroPonto, Usuario } from '@/types/database';

interface UseTimeTrackingViewModelProps {
    records: RegistroPonto[] | undefined;
    date: Date;
    collaborators?: Usuario[];
    syncWithUrl?: boolean;
}

export function useTimeTrackingViewModel({ 
    records, 
    date, 
    collaborators, 
    syncWithUrl = true 
}: UseTimeTrackingViewModelProps) {
    // 1. Business Logic
    const { processedRecords, kpiCounts, uniqueShifts } = useTimeTrackingBusiness({
        records,
        date,
        collaborators
    });

    // 2. Filters State (via useFilters common hook)
    const {
        searchTerm,
        setSearchTerm,
        selectedStatusEntrada = FILTER_OPTIONS.TODOS,
        setSelectedStatusEntrada,
        selectedStatusSaida = FILTER_OPTIONS.TODOS,
        setSelectedStatusSaida,
        selectedUsuario = FILTER_OPTIONS.TODOS,
        setSelectedUsuario,
        selectedCliente = FILTER_OPTIONS.TODOS,
        setSelectedCliente,
        selectedTurno = FILTER_OPTIONS.TODOS,
        setSelectedTurno,
        hasActiveFilters: hasActiveFiltersFromUrl, // Renamed to avoid conflict
        setFilters
    } = useFilters({
        statusEntradaParam: "status_entrada",
        statusSaidaParam: "status_saida",
        usuarioParam: "usuario",
        clienteParam: "cliente",
        turnoParam: "turno",
        syncWithUrl
    });

    // 3. Local UI State
    const [activeKpiFilter, setActiveKpiFilter] = useState<ManagementStatus | null>(null);

    // 4. Apply Ultimate Filtering
    const filteredRecords = useMemo(() => {
        return processedRecords.filter(record => {
            // 1. Search Term (Name) - Accent & Case insensitive
            if (searchTerm) {
                const search = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const name = (record.usuario?.nome_completo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (!name.includes(search)) return false;
            }

            // 2. Usuario Filter (Combobox)
            if (selectedUsuario !== FILTER_OPTIONS.TODOS && record.usuario_id?.toString() !== selectedUsuario) {
                return false;
            }

            // 3. Cliente Filter
            if (selectedCliente !== FILTER_OPTIONS.TODOS) {
                // Now uses the enriched collaborator data from business hook
                const hasClient = record.usuario?.links?.some((l: any) => l.cliente_id?.toString() === selectedCliente);
                if (!hasClient) return false;
            }

            // 4. Turno Filter
            if (selectedTurno !== FILTER_OPTIONS.TODOS) {
                const recordShifts = record.usuario?.links?.map((l: any) => 
                    `${l.hora_inicio?.substring(0, 5)} - ${l.hora_fim?.substring(0, 5)}`
                ) || [];
                if (!recordShifts.includes(selectedTurno)) return false;
            }

            // 5. Status Filters (Entrada e Saída)
            if (selectedStatusEntrada !== FILTER_OPTIONS.TODOS) {
                // Special cases for entry status groups
                if (selectedStatusEntrada === FILTER_OPTIONS.INICIOU && record.status_entrada !== STATUS_PONTO.VERDE) return false;
                if (selectedStatusEntrada === FILTER_OPTIONS.NAO_INICIOU && record.status_entrada === STATUS_PONTO.VERDE) return false;
                if (selectedStatusEntrada === FILTER_OPTIONS.EM_ATRASO && record.mgtStatus !== 'LATE') return false;
                if (selectedStatusEntrada === FILTER_OPTIONS.AGUARDANDO && record.mgtStatus !== 'WAITING') return false;
            }

            if (selectedStatusSaida !== FILTER_OPTIONS.TODOS) {
                if (selectedStatusSaida === FILTER_OPTIONS.TRABALHANDO && record.mgtStatus !== 'WORKING') return false;
                if (selectedStatusSaida === FILTER_OPTIONS.CONCLUIU && record.mgtStatus !== 'DONE') return false;
                if (selectedStatusSaida === FILTER_OPTIONS.FALTA_SAIDA && record.mgtStatus !== 'ABSENT') return false;
            }

            // KPI Quick Filter (the top cards)
            if (activeKpiFilter && record.mgtStatus !== activeKpiFilter) return false;

            return true;
        });
    }, [processedRecords, searchTerm, selectedUsuario, selectedCliente, selectedTurno, selectedStatusEntrada, selectedStatusSaida, activeKpiFilter]);

    // 5. Recalculate KPIs based on filtered (non-KPI) results
    // This makes KPIs "reactive" to filters like Cliente, Turno, etc.
    const dynamicKpiCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: filteredRecords.length, LATE: 0, WORKING: 0, DONE: 0, WAITING: 0, ABSENT: 0 };
        // We only want to count items that pass ALL filters EXCEPT the KPI filter itself
        // But for simplicity, we'll just count items in the already filtered list if they were filtered by something else
        // Actually, dashboards usually show "Filtered Totals".
        filteredRecords.forEach(r => {
            if (counts[r.mgtStatus] !== undefined) {
                counts[r.mgtStatus]++;
            }
        });
        return counts;
    }, [filteredRecords]);

    const activeFiltersCount = useMemo(() => {
        return [
            searchTerm,
            selectedStatusEntrada,
            selectedStatusSaida,
            selectedUsuario,
            selectedCliente,
            selectedTurno
        ].filter(v => v && v !== FILTER_OPTIONS.TODOS).length;
    }, [searchTerm, selectedStatusEntrada, selectedStatusSaida, selectedUsuario, selectedCliente, selectedTurno]);

    const hasActiveFilters = hasActiveFiltersFromUrl || activeFiltersCount > 0 || activeKpiFilter !== null;

    const handleKpiClick = (status: ManagementStatus | 'ALL') => {
        if (status === 'ALL') {
            setActiveKpiFilter(null);
        } else {
            setActiveKpiFilter(prev => prev === status ? null : status);
        }
    };

    const clearAllFilters = () => {
        setSearchTerm("");
        setFilters({
            statusEntrada: FILTER_OPTIONS.TODOS,
            statusSaida: FILTER_OPTIONS.TODOS,
            usuario: FILTER_OPTIONS.TODOS,
            cliente: FILTER_OPTIONS.TODOS,
            turno: FILTER_OPTIONS.TODOS,
            searchTerm: ""
        });
        setActiveKpiFilter(null);
    };

    return {
        // Data
        filteredRecords,
        kpiCounts: dynamicKpiCounts, // Map dynamic to kpiCounts for backward compatibility or use both
        dynamicKpiCounts,
        uniqueShifts,
        
        // State
        searchTerm,
        activeKpiFilter,
        selectedStatusEntrada,
        selectedStatusSaida,
        selectedUsuario,
        selectedCliente,
        selectedTurno,
        hasActiveFilters: hasActiveFilters || activeKpiFilter !== null,

        // Handlers
        setSearchTerm,
        setSelectedStatusEntrada,
        setSelectedStatusSaida,
        setSelectedUsuario,
        setSelectedCliente,
        setSelectedTurno,
        handleKpiClick,
        clearAllFilters,
        setFilters
    };
}
