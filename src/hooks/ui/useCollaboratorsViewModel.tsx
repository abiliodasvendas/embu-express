import { useCallback, useMemo } from 'react';
import { useLayout } from '@/contexts/LayoutContext';
import { useFilters } from './useFilters';
import { STATUS_CADASTRO } from '@/constants/cadastro';
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

    // 1. Filters (Source of Truth for Search/Params)
    const {
        searchTerm,
        setSearchTerm,
        selectedStatus = STATUS_CADASTRO.TODOS,
        setSelectedStatus,
        selectedCategoria: selectedRole = STATUS_CADASTRO.TODOS,
        setSelectedCategoria: setSelectedRole,
        selectedCliente: selectedClient = STATUS_CADASTRO.TODOS,
        setSelectedCliente: setSelectedClient,
        selectedEmpresa: selectedEmpresa = STATUS_CADASTRO.TODOS,
        setSelectedEmpresa: setSelectedEmpresa,
        hasActiveFilters,
        setFilters,
        clearFilters
    } = useFilters({
        statusParam: "status",
        categoriaParam: "cargo",
        clienteParam: "cliente",
        empresaParam: "empresa",
        syncWithUrl: true,
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
        status: selectedStatus === STATUS_CADASTRO.TODOS ? undefined : selectedStatus,
        perfil_id: selectedRole === STATUS_CADASTRO.TODOS ? undefined : selectedRole,
        cliente_id: selectedClient === STATUS_CADASTRO.TODOS ? undefined : selectedClient,
        empresa_id: selectedEmpresa === STATUS_CADASTRO.TODOS ? undefined : selectedEmpresa,
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
        const isActivating = newStatus === STATUS_CADASTRO.ATIVO;
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

                if (newStatus === STATUS_CADASTRO.ATIVO) {
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

    const handleApplyFilters = useCallback((newFilters: any) => {
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
