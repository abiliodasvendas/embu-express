import { CollaboratorFormDialog } from "@/components/dialogs/CollaboratorFormDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { CollaboratorList } from "@/components/features/collaborator/CollaboratorList";
import { CollaboratorsToolbar } from "@/components/features/collaborator/CollaboratorsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { useFilters } from "@/hooks";
import {
  useCreateCollaborator,
  useDeleteCollaborator,
  useToggleCollaboratorStatus,
  useUpdateCollaborator,
} from "@/hooks/api/useCollaboratorMutations";
import {
  useCollaborators,
  useRoles
} from "@/hooks/api/useCollaborators";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { Usuario as Collaborator } from "@/types/database";
import { mockGenerator } from "@/utils/mocks/generator";
import { Users, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function Collaborators() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } = useLayout();
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
      setFilters
  } = useFilters({
      statusParam: "status",
      categoriaParam: "cargo",
      clienteParam: "cliente",
      empresaParam: "empresa",
      syncWithUrl: true
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | undefined>(undefined);
  const [isQuickCreateLoading, setIsQuickCreateLoading] = useState(false);

  // Queries
  const { data: roles } = useRoles();
  const { data: clients } = useClientSelection();
  const { data: empresas } = useEmpresas({ ativo: "true" });

  const { data: collaborators = [], isLoading, refetch } = useCollaborators({
    searchTerm: searchTerm || undefined,
    ativo: selectedStatus === "todos" ? undefined : selectedStatus === "ativo" ? "true" : "false",
    perfil_id: selectedRole === "todos" ? undefined : selectedRole,
    cliente_id: selectedClient === "todos" ? undefined : selectedClient,
    empresa_id: selectedEmpresa === "todos" ? undefined : selectedEmpresa,
  });

  // Mutations
  const createCollaborator = useCreateCollaborator();
  const updateCollaborator = useUpdateCollaborator();
  const deleteCollaborator = useDeleteCollaborator();
  const toggleStatus = useToggleCollaboratorStatus();



  useEffect(() => {
    setPageTitle("Colaboradores");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);



  const handleEdit = (collaborator: Collaborator) => {
    setEditingCollaborator(collaborator);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    setEditingCollaborator(undefined);
    setIsFormOpen(true);
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

  const handleToggleStatus = async (collaborator: Collaborator) => {
    await toggleStatus.mutateAsync({
      id: collaborator.id,
      ativo: !collaborator.ativo,
    });
  };

  const handleQuickCreate = async () => {
    setIsQuickCreateLoading(true);
    const clientId = clients?.[0]?.id;
    const empresaId = empresas?.[0]?.id;
    
    // Pass both client and empresa to generator
    const fakeData = mockGenerator.collaborator(clientId, empresaId);
    
    try {
      await createCollaborator.mutateAsync(fakeData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuickCreateLoading(false);
    }
  };

  const isCreatingCollaborator = createCollaborator.isPending;
  const isActionLoading = deleteCollaborator.isPending || toggleStatus.isPending || isCreatingCollaborator || isQuickCreateLoading;

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
             <CardHeader className="p-0">
                <div className="flex justify-end mb-4 md:hidden">
                  <Button
                    onClick={handleQuickCreate}
                    variant="outline"
                    className="gap-2 text-uppercase w-full font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11"
                  >
                    <Zap className="h-4 w-4" />
                    GERAR FAKE
                  </Button>
                </div>
                <div className="hidden md:flex justify-end mb-4">
                  <Button
                    onClick={handleQuickCreate}
                    variant="outline"
                    className="gap-2 text-uppercase font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11 px-6"
                  >
                    <Zap className="h-4 w-4" />
                    GERAR COLABORADOR FAKE
                  </Button>
                </div>
            </CardHeader>
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
                  onQuickCreate={handleQuickCreate}
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
                  onToggleStatus={handleToggleStatus}
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
                  action={!searchTerm ? { label: "Cadastrar Colaborador", onClick: handleRegister } : undefined}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      {isFormOpen && (
        <CollaboratorFormDialog
          key={editingCollaborator?.id ? `edit-${editingCollaborator.id}` : 'new'}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          collaboratorToEdit={editingCollaborator}
        />
      )}
      
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}

export default Collaborators;
