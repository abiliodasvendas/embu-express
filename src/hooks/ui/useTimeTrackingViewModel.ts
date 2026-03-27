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
import { safeCloseDialog } from './useDialogClose';

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
        selectedTurno, setSelectedTurno
    } = usePontoFilters({
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

    const activeParams = ["search", "usuario", "cliente", "turno"];
    const { hasActiveFilters: hasActiveFiltersFromUrl, clearFilters } = useFiltersManager(activeParams, syncWithUrl);

    const setFilters = useBatchFilters({
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
                safeCloseDialog(closeConfirmationDialog);
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

    // 6. Apply Ultimate Filtering Strategy
    // Stage 1: Filter by general criteria (Search, Client, Shift, User)
    const baseFilteredRecords = useMemo(() => {
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

            return true;
        });
    }, [processedRecords, searchTerm, selectedUsuario, selectedCliente, selectedTurno]);

    // Stage 2: Calculate KPI counts based on Stage 1 (Independent of active KPI filter)
    const dynamicKpiCounts = useMemo(() => {
        const counts: Record<string, number> = {
            [ManagementStatus.ALL]: baseFilteredRecords.length,
            [ManagementStatus.LATE]: 0,
            [ManagementStatus.WORKING]: 0,
            [ManagementStatus.DONE]: 0,
            [ManagementStatus.WAITING]: 0,
            [ManagementStatus.ABSENT]: 0
        };
        baseFilteredRecords.forEach(r => {
            if (counts[r.mgtStatus] !== undefined) {
                counts[r.mgtStatus]++;
            }
        });
        return counts;
    }, [baseFilteredRecords]);

    // Stage 3: Final list further filtered by Active KPI card
    const filteredRecords = useMemo(() => {
        if (!activeKpiFilter) return baseFilteredRecords;
        return baseFilteredRecords.filter(r => r.mgtStatus === activeKpiFilter);
    }, [baseFilteredRecords, activeKpiFilter]);

    const activeFiltersCount = useMemo(() => {
        return [
            searchTerm,
            selectedUsuario,
            selectedCliente,
            selectedTurno
        ].filter(v => v && v !== FilterOptions.TODOS).length;
    }, [searchTerm, selectedUsuario, selectedCliente, selectedTurno]);

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
        selectedUsuario,
        selectedCliente,
        selectedTurno,
        hasActiveFilters: hasActiveFiltersFromUrl || activeFiltersCount > 0 || activeKpiFilter !== null,

        // Handlers
        setDate,
        setSearchTerm,
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
