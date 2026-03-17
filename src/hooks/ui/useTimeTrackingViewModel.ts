import { useState, useMemo, useCallback } from 'react';
import { useFilters } from './useFilters';
import { useTimeTrackingBusiness } from '../business/useTimeTrackingBusiness';
import { STATUS_PONTO, FILTER_OPTIONS } from '@/constants/ponto';
import { ManagementStatus } from '@/utils/ponto';
import { RegistroPonto, Usuario } from '@/types/database';
import { useLayout } from '@/contexts/LayoutContext';
import { useCreatePonto, useUpdatePonto, useDeletePonto } from '../api/usePontoMutations';
import { format } from 'date-fns';

import { useTimeRecords } from '../api/useTimeRecords';
import { usePublicTimeTracking, usePublicCollaborators } from '../api/usePublicClient';

interface UseTimeTrackingViewModelProps {
    uuid?: string; // If provided, uses public fetches
    isAdmin?: boolean; // If true, uses admin fetches
    initialDate?: Date;
    syncWithUrl?: boolean;
    records?: RegistroPonto[]; // Support manual override if needed
    collaborators?: Usuario[]; // Optional manual override
}

export function useTimeTrackingViewModel({ 
    uuid,
    isAdmin = false,
    initialDate = new Date(), 
    syncWithUrl = true,
    records: externalRecords,
    collaborators: externalCollaborators
}: UseTimeTrackingViewModelProps) {
    const { setPageTitle, openTimeRecordDialog, openTimeRecordDetailsDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
    
    // 1. Local UI State
    const [date, setDate] = useState<Date>(initialDate);
    const [activeKpiFilter, setActiveKpiFilter] = useState<ManagementStatus | null>(null);

    // 2. Data Fetching
    const formattedDateString = format(date, "yyyy-MM-dd");
    
    // Admin Fetch
    const { data: adminRecords, isLoading: isAdminLoading, refetch: refetchAdmin } = useTimeRecords({
        date: formattedDateString,
        incluirTodos: true,
    });

    // Public Fetch
    const { data: publicRecords, isLoading: isPublicLoading, refetch: refetchPublic } = usePublicTimeTracking(uuid, formattedDateString);
    const { data: publicCollabs } = usePublicCollaborators(uuid);

    const records = uuid ? (publicRecords || []) : (externalRecords || adminRecords);
    const collaborators = uuid ? publicCollabs : externalCollaborators;
    const isLoading = uuid ? isPublicLoading : isAdminLoading;
    const refetch = uuid ? refetchPublic : refetchAdmin;

    // 3. Mutations (Admin Only)
    const createRecord = useCreatePonto();
    const updateRecord = useUpdatePonto();
    const deleteRecord = useDeletePonto();

    // 3. Business Logic
    const { processedRecords, uniqueShifts } = useTimeTrackingBusiness({
        records,
        date,
        collaborators
    });

    // 4. Filters State
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
        hasActiveFilters: hasActiveFiltersFromUrl,
        setFilters,
        clearFilters
    } = useFilters({
        statusEntradaParam: "status_entrada",
        statusSaidaParam: "status_saida",
        usuarioParam: "usuario",
        clienteParam: "cliente",
        turnoParam: "turno",
        syncWithUrl
    });

    // 5. Actions Handlers
    const handleCreate = useCallback(() => {
        openTimeRecordDialog({});
    }, [openTimeRecordDialog]);

    const handleEdit = useCallback((record: RegistroPonto) => {
        openTimeRecordDialog({ record });
    }, [openTimeRecordDialog]);

    const handleDelete = useCallback((record: RegistroPonto) => {
        openConfirmationDialog({
            title: "Excluir Registro",
            description: "Tem certeza que deseja excluir permanentemente este registro de ponto? Esta ação não pode ser desfeita.",
            confirmText: "Sim, excluir",
            variant: "destructive",
            onConfirm: async () => {
                await deleteRecord.mutateAsync(Number(record.id));
                closeConfirmationDialog();
            }
        });
    }, [deleteRecord, openConfirmationDialog, closeConfirmationDialog]);

    const handleOpenDetails = useCallback((record: RegistroPonto) => {
        openTimeRecordDetailsDialog({
            record,
            onEdit: handleEdit,
            onDelete: handleDelete
        });
    }, [handleEdit, handleDelete, openTimeRecordDetailsDialog]);

    // 6. Apply Ultimate Filtering
    const filteredRecords = useMemo(() => {
        return processedRecords.filter(record => {
            if (searchTerm) {
                const search = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const name = (record.usuario?.nome_completo || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if (!name.includes(search)) return false;
            }

            if (selectedUsuario !== FILTER_OPTIONS.TODOS && record.usuario_id?.toString() !== selectedUsuario) {
                return false;
            }

            if (selectedCliente !== FILTER_OPTIONS.TODOS) {
                const hasClient = record.usuario?.links?.some((l: any) => l.cliente_id?.toString() === selectedCliente);
                if (!hasClient) return false;
            }

            if (selectedTurno !== FILTER_OPTIONS.TODOS) {
                const recordShifts = record.usuario?.links?.map((l: any) => 
                    `${l.hora_inicio?.substring(0, 5)} - ${l.hora_fim?.substring(0, 5)}`
                ) || [];
                if (!recordShifts.includes(selectedTurno)) return false;
            }

            if (selectedStatusEntrada !== FILTER_OPTIONS.TODOS) {
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

            if (activeKpiFilter && record.mgtStatus !== activeKpiFilter) return false;

            return true;
        });
    }, [processedRecords, searchTerm, selectedUsuario, selectedCliente, selectedTurno, selectedStatusEntrada, selectedStatusSaida, activeKpiFilter]);

    const dynamicKpiCounts = useMemo(() => {
        const counts: Record<string, number> = { ALL: filteredRecords.length, LATE: 0, WORKING: 0, DONE: 0, WAITING: 0, ABSENT: 0 };
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

    const handleKpiClick = (status: ManagementStatus | 'ALL') => {
        if (status === 'ALL') {
            setActiveKpiFilter(null);
        } else {
            setActiveKpiFilter(prev => prev === status ? null : status);
        }
    };

    const clearAllFiltersFinal = () => {
        setSearchTerm("");
        clearFilters();
        setActiveKpiFilter(null);
    };

    return {
        // Data
        date,
        formattedDate: format(date, "yyyy-MM-dd"),
        filteredRecords,
        dynamicKpiCounts,
        uniqueShifts,
        collaborators,
        
        // State
        isLoading,
        isActionLoading: createRecord.isPending || updateRecord.isPending || deleteRecord.isPending,
        searchTerm,
        activeKpiFilter,
        selectedStatusEntrada,
        selectedStatusSaida,
        selectedUsuario,
        selectedCliente,
        selectedTurno,
        hasActiveFilters: hasActiveFiltersFromUrl || activeFiltersCount > 0 || activeKpiFilter !== null,

        // Handlers
        setDate,
        setSearchTerm,
        setSelectedStatusEntrada,
        setSelectedStatusSaida,
        setSelectedUsuario,
        setSelectedCliente,
        setSelectedTurno,
        handleKpiClick,
        clearAllFilters: clearAllFiltersFinal,
        setFilters,
        
        // Actions
        handleCreate,
        handleEdit,
        handleDelete,
        handleOpenDetails,
        setPageTitle,
        refetch
    };
}
