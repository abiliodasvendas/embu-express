import { useState, useMemo, useCallback } from 'react';
import { useSearchFilters, usePontoFilters, useHierarchyFilters, useFiltersManager, useBatchFilters } from './useFilters';
import { useTimeTrackingBusiness } from '../business/useTimeTrackingBusiness';
import { getManagementStatus } from "@/utils/ponto";
import { FilterOptions, ManagementStatus, StatusVisualPonto } from '@/types/enums';
import { RegistroPonto, Usuario, ColaboradorCliente } from '@/types/database';
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
    const collaborators = uuid ? (publicCollabs as Usuario[]) : externalCollaborators;
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

    // 4. Filters State (Modularizado)
    const { searchTerm, setSearchTerm } = useSearchFilters("search", syncWithUrl);
    
    const { 
        selectedStatusEntrada, setSelectedStatusEntrada, 
        selectedStatusSaida, setSelectedStatusSaida, 
        selectedTurno, setSelectedTurno 
    } = usePontoFilters({
        statusEntradaParam: "status_entrada",
        statusSaidaParam: "status_saida",
        turnoParam: "turno",
        syncWithUrl
    });

    const { 
        selectedUsuario, setSelectedUsuario, 
        selectedCliente, setSelectedCliente 
    } = useHierarchyFilters({
        usuarioParam: "usuario",
        clienteParam: "cliente",
        syncWithUrl
    });

    const activeParams = ["search", "status_entrada", "status_saida", "usuario", "cliente", "turno"];
    const { hasActiveFilters: hasActiveFiltersFromUrl, clearFilters } = useFiltersManager(activeParams, syncWithUrl);
    
    const setFilters = useBatchFilters({
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

            if (selectedUsuario !== FilterOptions.TODOS && record.usuario_id?.toString() !== selectedUsuario) {
                return false;
            }

            if (selectedCliente !== FilterOptions.TODOS) {
                const hasClient = record.usuario?.links?.some((l: ColaboradorCliente) => l.cliente_id?.toString() === selectedCliente);
                if (!hasClient) return false;
            }

            if (selectedTurno !== FilterOptions.TODOS) {
                const shiftStr = `${record.detalhes_calculo?.entrada?.turno_base?.substring(0, 5)} - ${record.detalhes_calculo?.saida?.turno_base?.substring(0, 5)}`;
                if (shiftStr !== selectedTurno) return false;
            }

            if (selectedStatusEntrada !== FilterOptions.TODOS) {
                if (selectedStatusEntrada === FilterOptions.INICIOU && record.status_entrada !== StatusVisualPonto.VERDE) return false;
                if (selectedStatusEntrada === FilterOptions.NAO_INICIOU && record.status_entrada === StatusVisualPonto.VERDE) return false;
                if (selectedStatusEntrada === FilterOptions.EM_ATRASO && record.mgtStatus !== ManagementStatus.LATE) return false;
                if (selectedStatusEntrada === FilterOptions.AGUARDANDO && record.mgtStatus !== ManagementStatus.WAITING) return false;
            }

            if (selectedStatusSaida !== FilterOptions.TODOS) {
                if (selectedStatusSaida === FilterOptions.TRABALHANDO && record.mgtStatus !== ManagementStatus.WORKING) return false;
                if (selectedStatusSaida === FilterOptions.CONCLUIU && record.mgtStatus !== ManagementStatus.DONE) return false;
                if (selectedStatusSaida === FilterOptions.FALTA_SAIDA && record.mgtStatus !== ManagementStatus.ABSENT) return false;
            }

            if (activeKpiFilter && record.mgtStatus !== activeKpiFilter) return false;

            return true;
        });
    }, [processedRecords, searchTerm, selectedUsuario, selectedCliente, selectedTurno, selectedStatusEntrada, selectedStatusSaida, activeKpiFilter]);

    const dynamicKpiCounts = useMemo(() => {
        const counts: Record<string, number> = { 
            [ManagementStatus.ALL]: filteredRecords.length, 
            [ManagementStatus.LATE]: 0, 
            [ManagementStatus.WORKING]: 0, 
            [ManagementStatus.DONE]: 0, 
            [ManagementStatus.WAITING]: 0, 
            [ManagementStatus.ABSENT]: 0 
        };
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
        ].filter(v => v && v !== FilterOptions.TODOS).length;
    }, [searchTerm, selectedStatusEntrada, selectedStatusSaida, selectedUsuario, selectedCliente, selectedTurno]);

    const handleKpiClick = (status: ManagementStatus) => {
        if (status === ManagementStatus.ALL) {
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
