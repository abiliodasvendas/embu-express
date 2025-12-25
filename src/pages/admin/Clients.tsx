import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ClientList } from "@/components/features/client/ClientList";
import { ClientsToolbar } from "@/components/features/client/ClientsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import { useClients, useCreateClient, useDeleteClient, useToggleClientStatus } from "@/hooks";
import { useFilters } from "@/hooks/ui/useFilters";
import { Client } from "@/types/client";
import { mockGenerator } from "@/utils/mocks/generator";
import { Users, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Clients() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  
  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    setFilters,
    hasActiveFilters,
  } = useFilters();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clients, isLoading, refetch } = useClients({ 
    searchTerm: searchTerm || undefined, 
    ativo: selectedStatus === "todos" ? undefined : selectedStatus === "ativo" ? "true" : "false" 
  });
  const toggleStatus = useToggleClientStatus();
  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();

  useEffect(() => {
    setPageTitle("Gestão de Clientes");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const [isQuickCreateLoading, setIsQuickCreateLoading] = useState(false);

  const handleQuickCreate = async () => {
    setIsQuickCreateLoading(true);
    const fakeClient = mockGenerator.client();
    try {
      await createClient.mutateAsync({
        ...fakeClient,
        ativo: true,
        silent: true 
      });
      // toast.success("Cliente fake criado com sucesso!"); // Silent mode handles this or we rely on UI update
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuickCreateLoading(false);
    }
  };

  const handleToggleStatus = (client: Client) => {
    toggleStatus.mutate({ id: client.id, ativo: !client.ativo });
  };

  const handleDelete = (client: Client) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover o cliente "${client.nome_fantasia}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteClient.mutateAsync(client.id);
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const isActionLoading = toggleStatus.isPending || deleteClient.isPending || createClient.isPending || isQuickCreateLoading;

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
                    GERAR CLIENTE FAKE
                  </Button>
                </div>
                <div className="hidden md:flex justify-end mb-4">
                  <Button
                    onClick={handleQuickCreate}
                    variant="outline"
                    className="gap-2 text-uppercase font-bold text-blue-600 border-blue-100 hover:bg-blue-50 rounded-xl h-11 px-6"
                  >
                    <Zap className="h-4 w-4" />
                    GERAR CLIENTE FAKE
                  </Button>
                </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="mb-6">
                <ClientsToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  onRegister={handleAdd}
                  onQuickCreate={handleQuickCreate}
                  onApplyFilters={setFilters}
                />
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : clients && clients.length > 0 ? (
                <ClientList
                  clients={clients}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ) : (
                <UnifiedEmptyState
                  icon={Users}
                  title={messages.emptyState.cliente.titulo}
                  description={
                    searchTerm
                      ? messages.emptyState.cliente.semResultados
                      : messages.emptyState.cliente.descricao
                  }
                  action={!searchTerm ? { label: "Cadastrar Cliente", onClick: handleAdd } : undefined}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      <ClientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingClient={editingClient}
      />

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
