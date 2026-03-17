import { useCallback, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useFilters } from './useFilters';
import { STATUS_CADASTRO } from '@/constants/cadastro';
import { messages } from '@/constants/messages';
import { 
    useClients,
    useCreateClient,
    useDeleteClient,
    useToggleClientStatus
} from '@/hooks';
import { Client } from '@/types/client';

export function useClientsViewModel() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openClientFormDialog,
    } = useLayout();

    // 1. Filters
    const {
        searchTerm,
        setSearchTerm,
        selectedStatus = STATUS_CADASTRO.TODOS,
        setSelectedStatus,
        setFilters,
        hasActiveFilters,
        clearFilters
    } = useFilters({
        statusParam: "status",
        syncWithUrl: true,
    });

    // 2. Data Query
    const {
        data: clients = [],
        isLoading,
        refetch,
    } = useClients({
        searchTerm: searchTerm || undefined,
        ativo:
            selectedStatus === STATUS_CADASTRO.TODOS
                ? undefined
                : selectedStatus === STATUS_CADASTRO.ATIVO
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
                closeConfirmationDialog();
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
                closeConfirmationDialog();
            },
        });
    }, [deleteClient, openConfirmationDialog, closeConfirmationDialog]);

    const handleApplyFilters = useCallback((newFilters: any) => {
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
