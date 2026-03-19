import { useCallback, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useSearchFilters, useStatusFilters, useCategoryFilters, useHierarchyFilters, useFiltersManager, useBatchFilters } from './useFilters';
import { StatusUsuario, FilterOptions } from '@/types/enums';
import { messages } from '@/constants/messages';
import { 
    useCollaborators, 
    useRoles 
} from '@/hooks/api/useCollaborators';
import { useEmpresas } from '@/hooks/api/useEmpresas';
import { useClientSelection } from '@/hooks/ui/useClientSelection';
import { 
    useCreateCollaborator, 
    useDeleteCollaborator, 
    useUpdateCollaboratorStatus 
} from '@/hooks/api/useCollaboratorMutations';
import { Usuario as Collaborator } from '@/types/database';

export function useCollaboratorsViewModel() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openCollaboratorFormDialog,
        openSuccessRegistrationDialog,
    } = useLayout();

    // 1. Filters (Modularizado)
    const { searchTerm, setSearchTerm } = useSearchFilters();
    const { selectedStatus, setSelectedStatus } = useStatusFilters("status");
    const { selectedCategoria: selectedRole, setSelectedCategoria: setSelectedRole } = useCategoryFilters("cargo");
    const { 
        selectedCliente: selectedClient, setSelectedCliente: setSelectedClient,
        selectedEmpresa, setSelectedEmpresa 
    } = useHierarchyFilters({
        clienteParam: "cliente",
        empresaParam: "empresa"
    });

    const activeParams = ["search", "status", "cargo", "cliente", "empresa"];
    const { hasActiveFilters, clearFilters } = useFiltersManager(activeParams);
    const setFilters = useBatchFilters({
        statusParam: "status",
        categoriaParam: "cargo",
        clienteParam: "cliente",
        empresaParam: "empresa"
    });

    // 2. Data Queries
    const { data: roles = [] } = useRoles();
    const { data: clients = [] } = useClientSelection();
    const { data: empresas = [] } = useEmpresas({ ativo: "true" });

    const {
        data: collaborators = [],
        isLoading,
        refetch,
    } = useCollaborators({
        searchTerm: searchTerm || undefined,
        status: selectedStatus === FilterOptions.TODOS ? undefined : selectedStatus,
        perfil_id: selectedRole === FilterOptions.TODOS ? undefined : selectedRole,
        cliente_id: selectedClient === FilterOptions.TODOS ? undefined : selectedClient,
        empresa_id: selectedEmpresa === FilterOptions.TODOS ? undefined : selectedEmpresa,
    });

    // 3. Mutations
    const createCollaborator = useCreateCollaborator();
    const deleteCollaborator = useDeleteCollaborator();
    const updateStatus = useUpdateCollaboratorStatus();

    // 4. Actions Handlers
    const handleRegister = useCallback(() => {
        openCollaboratorFormDialog({
            mode: "create",
            editingCollaborator: null,
        });
    }, [openCollaboratorFormDialog]);

    const handleEdit = useCallback((collaborator: Collaborator) => {
        openCollaboratorFormDialog({
            mode: "edit",
            editingCollaborator: collaborator,
        });
    }, [openCollaboratorFormDialog]);

    const handleDelete = useCallback(async (collaborator: Collaborator) => {
        openConfirmationDialog({
            title: messages.dialogo.remover.titulo,
            description: `Tem certeza que deseja remover "${collaborator.nome_completo}"? Esta ação não pode ser desfeita.`,
            confirmText: messages.dialogo.remover.botao,
            variant: "destructive",
            onConfirm: async () => {
                await deleteCollaborator.mutateAsync(collaborator.id);
                closeConfirmationDialog();
            },
        });
    }, [deleteCollaborator, openConfirmationDialog, closeConfirmationDialog]);

    const handleStatusChange = useCallback((collaborator: Collaborator, newStatus: string) => {
        const isActivating = newStatus === StatusUsuario.ATIVO;
        openConfirmationDialog({
            title: isActivating ? "Ativar Colaborador" : "Desativar Colaborador",
            description: `Tem certeza que deseja ${isActivating ? "ativar" : "desativar"} o colaborador "${collaborator.nome_completo}"?`,
            confirmText: isActivating ? "Ativar" : "Desativar",
            variant: isActivating ? "default" : "destructive",
            onConfirm: async () => {
                await updateStatus.mutateAsync({
                    id: collaborator.id,
                    status: newStatus,
                });

                closeConfirmationDialog();

                if (newStatus === StatusUsuario.ATIVO) {
                    setTimeout(() => {
                        openSuccessRegistrationDialog({
                            collaborator: collaborator,
                            title: "Aprovação Realizada!",
                            hideNewCollaboratorButton: true,
                            description: (
                                <>
                                    O colaborador <span className="text-gray-900 font-bold">{collaborator.nome_completo}</span> foi aprovado com sucesso.
                                </>
                            )
                        });
                    }, 300);
                }
            },
        });
    }, [updateStatus, openConfirmationDialog, closeConfirmationDialog, openSuccessRegistrationDialog]);

    const handleApplyFilters = useCallback((newFilters: {
        status?: string;
        categoria?: string;
        cliente?: string;
        empresa?: string;
    }) => {
        setFilters({
            status: newFilters.status,
            categoria: newFilters.categoria,
            cliente: newFilters.cliente,
            empresa: newFilters.empresa,
        });
    }, [setFilters]);

    const isActionLoading = useMemo(() => 
        deleteCollaborator.isPending || 
        updateStatus.isPending || 
        createCollaborator.isPending
    , [deleteCollaborator.isPending, updateStatus.isPending, createCollaborator.isPending]);

    return {
        // Data
        collaborators,
        roles,
        clients,
        empresas,
        isLoading,
        isActionLoading,

        // State/Filters
        searchTerm,
        selectedStatus,
        selectedRole,
        selectedClient,
        selectedEmpresa,
        hasActiveFilters,

        // Handlers
        setSearchTerm,
        setSelectedStatus,
        setSelectedRole,
        setSelectedClient,
        setSelectedEmpresa,
        handleApplyFilters,
        clearFilters,
        refetch,

        // Actions
        handleRegister,
        handleEdit,
        handleDelete,
        handleStatusChange,
        setPageTitle
    };
}
