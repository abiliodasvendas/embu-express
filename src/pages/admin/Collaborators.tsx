import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CollaboratorList } from "@/components/features/collaborator/CollaboratorList";
import { CollaboratorsToolbar } from "@/components/features/collaborator/CollaboratorsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { useFilters } from "@/hooks";
import {
  useCreateCollaborator,
  useDeleteCollaborator,
  useUpdateCollaboratorStatus,
} from "@/hooks/api/useCollaboratorMutations";
import { useCollaborators, useRoles } from "@/hooks/api/useCollaborators";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { Usuario as Collaborator } from "@/types/database";
import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function Collaborators() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openCollaboratorFormDialog,
  } = useLayout();
  // Filters Hook
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus = "todos",
    setSelectedStatus,
    selectedCategoria: selectedRole = "todos",
    setSelectedCategoria: setSelectedRole,
    selectedCliente: selectedClient = "todos",
    setSelectedCliente: setSelectedClient,
    selectedEmpresa: selectedEmpresa = "todos",
    setSelectedEmpresa: setSelectedEmpresa,
    hasActiveFilters,
    setFilters,
  } = useFilters({
    statusParam: "status",
    categoriaParam: "cargo",
    clienteParam: "cliente",
    empresaParam: "empresa",
    syncWithUrl: true,
  });

  const [isQuickCreateLoading, setIsQuickCreateLoading] = useState(false);

  // Queries
  const { data: roles } = useRoles();
  const { data: clients } = useClientSelection();
  const { data: empresas } = useEmpresas({ ativo: "true" });

  const {
    data: collaborators = [],
    isLoading,
    refetch,
  } = useCollaborators({
    searchTerm: searchTerm || undefined,
    status: selectedStatus === "todos" ? undefined : selectedStatus,
    perfil_id: selectedRole === "todos" ? undefined : selectedRole,
    cliente_id: selectedClient === "todos" ? undefined : selectedClient,
    empresa_id: selectedEmpresa === "todos" ? undefined : selectedEmpresa,
  });

  // Mutations
  const createCollaborator = useCreateCollaborator();
  const deleteCollaborator = useDeleteCollaborator();
  const updateStatus = useUpdateCollaboratorStatus();

  useEffect(() => {
    setPageTitle("Colaboradores");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (collaborator: Collaborator) => {
    openCollaboratorFormDialog({
      mode: "edit",
      editingCollaborator: collaborator,
    });
  };

  const handleRegister = () => {
    openCollaboratorFormDialog({
      mode: "create",
      editingCollaborator: null,
    });
  };

  const handleDelete = async (collaborator: Collaborator) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover "${collaborator.nome_completo}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteCollaborator.mutateAsync(collaborator.id);
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleStatusChange = async (
    collaborator: Collaborator,
    newStatus: string,
  ) => {
    await updateStatus.mutateAsync({
      id: collaborator.id,
      status: newStatus,
    });
  };

  const isCreatingCollaborator = createCollaborator.isPending;
  const isActionLoading =
    deleteCollaborator.isPending ||
    updateStatus.isPending ||
    isCreatingCollaborator ||
    isQuickCreateLoading;

  const handleApplyFilters = (newFilters: {
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
  };

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="mb-6">
                <CollaboratorsToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  selectedRole={selectedRole}
                  onRoleChange={setSelectedRole}
                  onRegister={handleRegister}
                  onApplyFilters={handleApplyFilters}
                  roles={roles || []}
                  clients={clients || []}
                  selectedClient={selectedClient}
                  onClientChange={setSelectedClient}
                  empresas={empresas || []}
                  selectedEmpresa={selectedEmpresa}
                  onEmpresaChange={setSelectedEmpresa}
                />
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : collaborators && collaborators.length > 0 ? (
                <CollaboratorList
                  collaborators={collaborators}
                  onEdit={handleEdit}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ) : (
                <UnifiedEmptyState
                  icon={Users}
                  title={messages.emptyState.colaborador.titulo}
                  description={
                    searchTerm
                      ? messages.emptyState.colaborador.semResultados
                      : messages.emptyState.colaborador.descricao
                  }
                  action={
                    !searchTerm
                      ? {
                          label: "Cadastrar Colaborador",
                          onClick: handleRegister,
                        }
                      : undefined
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}

export default Collaborators;
