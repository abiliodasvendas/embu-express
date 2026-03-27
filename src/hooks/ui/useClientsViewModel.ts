import { useCallback, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useSearchFilters, useStatusFilters, useFiltersManager, useBatchFilters } from './useFilters';
import { StatusUsuario, FilterOptions } from '@/types/enums';
import { messages } from '@/constants/messages';
import {
    useClients,
    useCreateClient,
    useDeleteClient,
    useToggleClientStatus,
    safeCloseDialog
} from '@/hooks';
import { Client } from '@/types/database';

export function useClientsViewModel() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openClientFormDialog,
    } = useLayout();

    // 1. Filters (Modularizado)
    const { searchTerm, setSearchTerm } = useSearchFilters();
    const { selectedStatus, setSelectedStatus } = useStatusFilters();
    const { hasActiveFilters, clearFilters } = useFiltersManager(["search", "status"]);
    const setFilters = useBatchFilters({ statusParam: "status" });

    // 2. Data Query
    const {
        data: clients = [],
        isLoading,
        refetch,
    } = useClients({
        searchTerm: searchTerm || undefined,
        ativo:
            selectedStatus === FilterOptions.TODOS
                ? undefined
                : selectedStatus === StatusUsuario.ATIVO
                    ? "true"
                    : "false",
    });

    // 3. Mutations
    const createClient = useCreateClient();
    const deleteClient = useDeleteClient();
    const toggleStatus = useToggleClientStatus();

    // 4. Actions Handlers
    const handleRegister = useCallback(() => {
        openClientFormDialog({});
    }, [openClientFormDialog]);

    const handleEdit = useCallback((client: Client) => {
        openClientFormDialog({
            editingClient: client,
        });
    }, [openClientFormDialog]);

    const handleToggleStatus = useCallback((client: Client) => {
        const action = client.ativo ? "desativar" : "ativar";
        openConfirmationDialog({
            title: `${client.ativo ? "Desativar" : "Ativar"} Cliente`,
            description: `Tem certeza que deseja ${action} o cliente "${client.nome_fantasia}"?`,
            confirmText: client.ativo ? "Desativar" : "Ativar",
            variant: client.ativo ? "destructive" : "default",
            onConfirm: async () => {
                await toggleStatus.mutateAsync({ id: client.id, ativo: !client.ativo });
                safeCloseDialog(closeConfirmationDialog);
            },
        });
    }, [toggleStatus, openConfirmationDialog, closeConfirmationDialog]);

    const handleDelete = useCallback((client: Client) => {
        openConfirmationDialog({
            title: messages.dialogo.remover.titulo,
            description: `Tem certeza que deseja remover o cliente "${client.nome_fantasia}"? Esta ação não pode ser desfeita.`,
            confirmText: messages.dialogo.remover.botao,
            variant: "destructive",
            onConfirm: async () => {
                await deleteClient.mutateAsync(client.id);
                safeCloseDialog(closeConfirmationDialog);
            },
        });
    }, [deleteClient, openConfirmationDialog, closeConfirmationDialog]);

    const handleApplyFilters = useCallback((newFilters: {
        status?: string;
    }) => {
        setFilters(newFilters);
    }, [setFilters]);

    const isActionLoading = useMemo(() =>
        toggleStatus.isPending ||
        deleteClient.isPending ||
        createClient.isPending
        , [toggleStatus.isPending, deleteClient.isPending, createClient.isPending]);

    return {
        // Data
        clients,
        isLoading,
        isActionLoading,

        // State/Filters
        searchTerm,
        selectedStatus,
        hasActiveFilters,

        // Handlers
        setSearchTerm,
        setSelectedStatus,
        handleApplyFilters,
        clearFilters,
        refetch,

        // Actions
        handleRegister,
        handleEdit,
        handleToggleStatus,
        handleDelete,
        setPageTitle
    };
}
