import { EmpresaFormDialog } from "@/components/dialogs/EmpresaFormDialog";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { EmpresaList } from "@/components/features/empresa/EmpresaList";
import { EmpresasToolbar } from "@/components/features/empresa/EmpresasToolbar";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
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
import { mockGenerator } from "@/utils/mocks/generator";
import { Building2, Zap } from "lucide-react"; // Using Building2 for Empresas icon
import { useCallback, useEffect, useState } from "react";

export function Empresas() {
  const { setPageTitle, openConfirmationDialog, closeConfirmationDialog } = useLayout();

  const {
    searchTerm,
    setSearchTerm,
    selectedStatus = "todos",
    setSelectedStatus,
    setFilters,
    hasActiveFilters,
  } = useFilters({
    syncWithUrl: true,
    statusParam: "status",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | undefined>(undefined);
  const [isQuickCreateLoading, setIsQuickCreateLoading] = useState(false);

  const { data: empresas = [], isLoading, refetch } = useEmpresas({
    searchTerm: searchTerm || undefined,
    ativo: selectedStatus === "todos" ? undefined : selectedStatus === "ativo" ? "true" : "false",
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
    setEditingEmpresa(empresa);
    setIsFormOpen(true);
  };

  const handleRegister = () => {
    setEditingEmpresa(undefined);
    setIsFormOpen(true);
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

  const handleToggleStatus = async (empresa: Empresa) => {
    await toggleStatus.mutateAsync({
      id: empresa.id,
      ativo: !empresa.ativo,
    });
  };

  const handleQuickCreate = async () => {
    setIsQuickCreateLoading(true);
    const fakeEmpresa = mockGenerator.empresa();
    try {
      await createEmpresa.mutateAsync({
        ...fakeEmpresa,
        ativo: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuickCreateLoading(false);
    }
  };

  const isActionLoading = deleteEmpresa.isPending || toggleStatus.isPending || createEmpresa.isPending || isQuickCreateLoading;

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
                    GERAR EMPRESA FAKE
                  </Button>
                </div>
            </CardHeader>
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

      {isFormOpen && (
        <EmpresaFormDialog
          key={editingEmpresa?.id ? `edit-${editingEmpresa.id}` : 'new'}
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          empresaToEdit={editingEmpresa}
        />
      )}
      
      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}

export default Empresas;
