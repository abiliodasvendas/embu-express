import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLayout } from '@/contexts/LayoutContext';
import { useSearchFilters, useStatusFilters, useCategoryFilters, useHierarchyFilters, useFiltersManager, useUrlState } from './useFilters';
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
import { safeCloseDialog } from './useDialogClose';

export function useCollaboratorsViewModel() {
    const {
        setPageTitle,
        openConfirmationDialog,
        closeConfirmationDialog,
        openCollaboratorFormDialog,
        openSuccessRegistrationDialog,
    } = useLayout();

    const [, setSearchParams] = useSearchParams();

    const updateUrlParams = useCallback((updates: Record<string, string | number | boolean | null | undefined>) => {
        setSearchParams((prev) => {
            const newParams = new URLSearchParams(prev);
            Object.entries(updates).forEach(([paramKey, val]) => {
                if (val === null || val === undefined || val === "" || val === FilterOptions.TODOS || (paramKey === "page" && Number(val) === 1)) {
                    newParams.delete(paramKey);
                } else {
                    newParams.set(paramKey, String(val));
                }
            });
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);

    const [page] = useUrlState<number>({ key: "page", defaultValue: 1 });
    const [pageSize] = useUrlState<number>({ key: "pageSize", defaultValue: 10 });

    const setPage = useCallback((newPage: number) => {
        updateUrlParams({ page: newPage });
    }, [updateUrlParams]);

    const setPageSize = useCallback((newPageSize: number) => {
        updateUrlParams({ pageSize: newPageSize, page: 1 });
    }, [updateUrlParams]);

    const { searchTerm } = useSearchFilters();
    const { selectedStatus } = useStatusFilters("status");
    const { selectedCategoria: selectedRole } = useCategoryFilters("cargo");
    const {
        selectedCliente: selectedClient,
        selectedEmpresa
    } = useHierarchyFilters({
        clienteParam: "cliente",
        empresaParam: "empresa"
    });

    const activeParams = ["search", "status", "cargo", "cliente", "empresa", "page", "pageSize"];
    const { hasActiveFilters } = useFiltersManager(activeParams);

    const setSearchTerm = useCallback((val: string | null | undefined) => {
        updateUrlParams({ search: val, page: 1 });
    }, [updateUrlParams]);

    const setSelectedStatus = useCallback((val: string | null | undefined) => {
        updateUrlParams({ status: val, page: 1 });
    }, [updateUrlParams]);

    const setSelectedRole = useCallback((val: string | null | undefined) => {
        updateUrlParams({ cargo: val, page: 1 });
    }, [updateUrlParams]);

    const setSelectedClient = useCallback((val: string | null | undefined) => {
        updateUrlParams({ cliente: val, page: 1 });
    }, [updateUrlParams]);

    const setSelectedEmpresa = useCallback((val: string | null | undefined) => {
        updateUrlParams({ empresa: val, page: 1 });
    }, [updateUrlParams]);

    const clearFilters = useCallback(() => {
        updateUrlParams({
            search: "",
            status: "",
            cargo: "",
            cliente: "",
            empresa: "",
            page: 1,
        });
    }, [updateUrlParams]);

    const handleApplyFilters = useCallback((newFilters: {
        status?: string;
        categoria?: string;
        cliente?: string;
        empresa?: string;
    }) => {
        updateUrlParams({
            status: newFilters.status,
            cargo: newFilters.categoria,
            cliente: newFilters.cliente,
            empresa: newFilters.empresa,
            page: 1,
        });
    }, [updateUrlParams]);

    const { data: roles = [] } = useRoles();
    const { data: clients = [] } = useClientSelection();
    const { data: empresas = [] } = useEmpresas({ ativo: "true" });

    const {
        data: collaboratorsResponse,
        isLoading,
        refetch,
    } = useCollaborators({
        searchTerm: searchTerm || undefined,
        status: selectedStatus === FilterOptions.TODOS ? undefined : selectedStatus,
        perfil_id: selectedRole === FilterOptions.TODOS ? undefined : selectedRole,
        cliente_id: selectedClient === FilterOptions.TODOS ? undefined : selectedClient,
        empresa_id: selectedEmpresa === FilterOptions.TODOS ? undefined : selectedEmpresa,
        page,
        pageSize,
    });

    const collaborators = useMemo(() => {
        if (!collaboratorsResponse) return [];
        if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse;
        return collaboratorsResponse.data || [];
    }, [collaboratorsResponse]);

    const total = useMemo(() => {
        if (!collaboratorsResponse) return 0;
        if (Array.isArray(collaboratorsResponse)) return collaboratorsResponse.length;
        return collaboratorsResponse.total || 0;
    }, [collaboratorsResponse]);

    const totalPages = useMemo(() => {
        if (!collaboratorsResponse) return 1;
        if (Array.isArray(collaboratorsResponse)) return 1;
        return collaboratorsResponse.totalPages || 1;
    }, [collaboratorsResponse]);

    const createCollaborator = useCreateCollaborator();
    const deleteCollaborator = useDeleteCollaborator();
    const updateStatus = useUpdateCollaboratorStatus();

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
                safeCloseDialog(closeConfirmationDialog);
            },
        });
    }, [deleteCollaborator, openConfirmationDialog, closeConfirmationDialog]);

    const handleStatusChange = useCallback((collaborator: Collaborator, newStatus: string) => {
        const isActivating = newStatus === StatusUsuario.ATIVO;
        openConfirmationDialog({
            title: isActivating ? "Ativar Colaborador" : "Desligar Colaborador",
            description: `Tem certeza que deseja ${isActivating ? "ativar" : "desligar"} o colaborador "${collaborator.nome_completo}"?`,
            confirmText: isActivating ? "Ativar" : "Desligar",
            variant: isActivating ? "default" : "destructive",
            onConfirm: async () => {
                await updateStatus.mutateAsync({
                    id: collaborator.id,
                    status: newStatus,
                });

                safeCloseDialog(closeConfirmationDialog);

                if (newStatus === StatusUsuario.ATIVO) {
                    setTimeout(() => {
                        openSuccessRegistrationDialog({
                            collaborator: collaborator,
                            title: "Aprovação Realizada!",
                            hideNewCollaboratorButton: true,
                            hideTurnButton: collaborator.status !== StatusUsuario.PENDENTE,
                            description: (
                                <>
                                    O cadastro do colaborador <span className="text-gray-900 font-bold">{collaborator.nome_completo}</span> foi ativado com sucesso.
                                </>
                            )
                        });
                    }, 300);
                }
            },
        });
    }, [updateStatus, openConfirmationDialog, closeConfirmationDialog, openSuccessRegistrationDialog]);

    const isActionLoading = useMemo(() =>
        deleteCollaborator.isPending ||
        updateStatus.isPending ||
        createCollaborator.isPending
        , [deleteCollaborator.isPending, updateStatus.isPending, createCollaborator.isPending]);

    return {
        collaborators,
        roles,
        clients,
        empresas,
        isLoading,
        isActionLoading,

        page,
        pageSize,
        total,
        totalPages,
        setPage,
        setPageSize,

        searchTerm,
        selectedStatus,
        selectedRole,
        selectedClient,
        selectedEmpresa,
        hasActiveFilters,

        setSearchTerm,
        setSelectedStatus,
        setSelectedRole,
        setSelectedClient,
        setSelectedEmpresa,
        handleApplyFilters,
        clearFilters,
        refetch,

        handleRegister,
        handleEdit,
        handleDelete,
        handleStatusChange,
        setPageTitle
    };
}
