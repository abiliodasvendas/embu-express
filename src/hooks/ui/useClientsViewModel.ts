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

    const { searchTerm, setSearchTerm } = useSearchFilters();
    const { selectedStatus, setSelectedStatus } = useStatusFilters("status", true, StatusUsuario.ATIVO);
    const { hasActiveFilters } = useFiltersManager(["search", "status"]);
    const setFilters = useBatchFilters({ statusParam: "status", statusDefault: StatusUsuario.ATIVO });

    const {
        data: clientsResponse,
        isLoading,
        isFetching,
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

    const isInitialLoading = isLoading && !clientsResponse;
    const clients = clientsResponse || [];

    const createClient = useCreateClient();
    const deleteClient = useDeleteClient();
    const toggleStatus = useToggleClientStatus();

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
        if (newFilters.status !== undefined) {
            setSelectedStatus(newFilters.status);
        }
    }, [setSelectedStatus]);

    const clearFilters = useCallback(() => {
        setSearchTerm("");
        setSelectedStatus(StatusUsuario.ATIVO);
    }, [setSearchTerm, setSelectedStatus]);

    const isActionLoading = useMemo(() =>
        toggleStatus.isPending ||
        deleteClient.isPending ||
        createClient.isPending
        , [toggleStatus.isPending, deleteClient.isPending, createClient.isPending]);

    return {
        clients,
        isLoading,
        isInitialLoading,
        isFetching,
        isActionLoading,

        searchTerm,
        selectedStatus,
        hasActiveFilters,

        setSearchTerm,
        setSelectedStatus,
        handleApplyFilters,
        clearFilters,
        refetch,

        handleRegister,
        handleEdit,
        handleToggleStatus,
        handleDelete,
        setPageTitle
    };
}
