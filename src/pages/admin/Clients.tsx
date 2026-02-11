import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { ClientList } from "@/components/features/client/ClientList";
import { ClientsToolbar } from "@/components/features/client/ClientsToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useToggleClientStatus,
} from "@/hooks";
import { useFilters } from "@/hooks/ui/useFilters";
import { Client } from "@/types/client";
import { Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function Clients() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } =
    useLayout();

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus,
    setSelectedStatus,
    setFilters,
    hasActiveFilters,
  } = useFilters();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    data: clients,
    isLoading,
    refetch,
  } = useClients({
    searchTerm: searchTerm || undefined,
    ativo:
      selectedStatus === "todos"
        ? undefined
        : selectedStatus === "ativo"
          ? "true"
          : "false",
  });
  const toggleStatus = useToggleClientStatus();
  const deleteClient = useDeleteClient();
  const createClient = useCreateClient();

  useEffect(() => {
    setPageTitle("Clientes");
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

  const isActionLoading =
    toggleStatus.isPending || deleteClient.isPending || createClient.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="mb-6">
                <ClientsToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  onRegister={handleAdd}
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
                  action={
                    !searchTerm
                      ? { label: "Cadastrar Cliente", onClick: handleAdd }
                      : undefined
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>

      {isFormOpen && (
        <ClientFormDialog
          key={editingClient?.id ? `edit-${editingClient.id}` : "new"}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          editingClient={editingClient}
        />
      )}

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}
