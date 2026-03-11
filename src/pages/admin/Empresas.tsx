import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EmpresaList } from "@/components/features/empresa/EmpresaList";
import { EmpresasToolbar } from "@/components/features/empresa/EmpresasToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { STATUS_CADASTRO } from "@/constants/cadastro";
import { messages } from "@/constants/messages";
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateEmpresa,
    useDeleteEmpresa,
    useToggleEmpresaStatus,
} from "@/hooks/api/useEmpresaMutations";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useFilters } from "@/hooks/ui/useFilters";
import { Empresa } from "@/types/database";
import { Building2 } from "lucide-react"; // Using Building2 for Empresas icon
import { useCallback, useEffect, useState } from "react";

export function Empresas() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog, openEmpresaFormDialog } = useLayout();

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus = STATUS_CADASTRO.TODOS,
    setSelectedStatus,
    setFilters,
    hasActiveFilters,
  } = useFilters({
    syncWithUrl: true,
    statusParam: "status",
  });

  const [isQuickCreateLoading, setIsQuickCreateLoading] = useState(false);

  const { data: empresas = [], isLoading, refetch } = useEmpresas({
    searchTerm: searchTerm || undefined,
    ativo: selectedStatus === STATUS_CADASTRO.TODOS ? undefined : selectedStatus === STATUS_CADASTRO.ATIVO ? "true" : "false",
  });

  const createEmpresa = useCreateEmpresa();
  const deleteEmpresa = useDeleteEmpresa();
  const toggleStatus = useToggleEmpresaStatus();

  useEffect(() => {
    setPageTitle("Empresas");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleEdit = (empresa: Empresa) => {
    openEmpresaFormDialog({ empresaToEdit: empresa });
  };

  const handleRegister = () => {
    openEmpresaFormDialog({});
  };

  const handleDelete = async (empresa: Empresa) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover a empresa "${empresa.nome_fantasia}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteEmpresa.mutateAsync(empresa.id);
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const handleToggleStatus = (empresa: Empresa) => {
    const action = empresa.ativo ? "desativar" : "ativar";
    openConfirmationDialog({
      title: `${empresa.ativo ? "Desativar" : "Ativar"} Empresa`,
      description: `Tem certeza que deseja ${action} a empresa "${empresa.nome_fantasia}"?`,
      confirmText: empresa.ativo ? "Desativar" : "Ativar",
      variant: empresa.ativo ? "destructive" : "default",
      onConfirm: async () => {
        try {
          await toggleStatus.mutateAsync({
            id: empresa.id,
            ativo: !empresa.ativo,
          });
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const isActionLoading = deleteEmpresa.isPending || toggleStatus.isPending || createEmpresa.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="mb-6">
                <EmpresasToolbar
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  selectedStatus={selectedStatus}
                  onStatusChange={setSelectedStatus}
                  onRegister={handleRegister}
                  onApplyFilters={(filters) => setFilters(filters)}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : empresas && empresas.length > 0 ? (
                <EmpresaList
                  empresas={empresas}
                  onEdit={handleEdit}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              ) : (
                <UnifiedEmptyState
                  icon={Building2}
                  title="Nenhuma empresa encontrada"
                  description={
                    searchTerm
                      ? "Não encontramos nenhuma empresa com os filtros atuais."
                      : "Cadastre a primeira empresa para começar."
                  }
                  action={!searchTerm ? { label: "Cadastrar Empresa", onClick: handleRegister } : undefined}
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

export default Empresas;
