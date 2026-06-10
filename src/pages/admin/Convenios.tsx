import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useConvenios,
  useDeleteConvenio,
  useUpdateConvenio,
} from "@/hooks/api/useConvenios";
import { Convenio } from "@/types/database";
import {
  Handshake,
  Plus,
  Search,
  X,
  Copy,
  ExternalLink,
  Edit2,
  Power,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { cn } from "@/lib/utils";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ActionItem } from "@/types/actions";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useNavigate } from "react-router-dom";

const ConvenioMobileItem = ({
  convenio,
  actions,
}: {
  convenio: Convenio;
  actions: ActionItem[];
}) => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform relative cursor-pointer text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm line-clamp-2 break-words leading-tight">
            {convenio.nome}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={convenio.ativo} />
          <ActionsDropdown actions={actions} />
        </div>
      </div>
    </div>
  );
};

const ConvenioTableRow = ({
  convenio,
  actions,
}: {
  convenio: Convenio;
  actions: ActionItem[];
}) => {
  const navigate = useNavigate();
  return (
    <tr
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <p className="font-bold text-gray-900 text-sm">{convenio.nome}</p>
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={convenio.ativo} />
      </td>
      <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
        <ActionsDropdown actions={actions} />
      </td>
    </tr>
  );
};

export function Convenios() {
  const {
    setPageTitle,
    openConfirmationDialog,
    closeConfirmationDialog,
    openConvenioFormDialog,
  } = useLayout();

  const isMobile = useIsMobile();
  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.CONVENIOS.EDITAR);

  const [searchTerm, setSearchTerm] = useState("");

  const { data: convenios = [], isLoading, refetch } = useConvenios();
  const deleteConvenio = useDeleteConvenio();
  const updateConvenio = useUpdateConvenio();

  useEffect(() => {
    setPageTitle("Convênios");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handleRegister = () => {
    openConvenioFormDialog({});
  };

  const handleEdit = (convenio: Convenio) => {
    openConvenioFormDialog({ convenioToEdit: convenio });
  };

  const handleToggleStatus = (convenio: Convenio) => {
    const nextStatus = !convenio.ativo;
    openConfirmationDialog({
      title: `${nextStatus ? "Ativar" : "Desativar"} Convênio`,
      description: `Tem certeza que deseja ${nextStatus ? "ativar" : "desativar"
        } o convênio "${convenio.nome}"?`,
      confirmText: nextStatus ? "Ativar" : "Desativar",
      variant: nextStatus ? "default" : "destructive",
      onConfirm: async () => {
        try {
          await updateConvenio.mutateAsync({
            id: convenio.id,
            ativo: nextStatus,
          });
          toast.success(
            `Convênio ${nextStatus ? "ativado" : "desativado"} com sucesso!`
          );
          closeConfirmationDialog();
        } catch (error) {
          const err = error as Error;
          toast.error("Erro ao alterar status do convênio", {
            description: err.message,
          });
        }
      },
    });
  };

  const handleDelete = (convenio: Convenio) => {
    openConfirmationDialog({
      title: "Excluir Convênio",
      description: `Tem certeza que deseja excluir o convênio "${convenio.nome}"? Todos os lançamentos vinculados a ele serão excluídos permanentemente. Esta ação não pode ser desfeita.`,
      confirmText: "Excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteConvenio.mutateAsync(convenio.id);
          toast.success("Convênio excluído com sucesso!");
          closeConfirmationDialog();
        } catch (error) {
          const err = error as Error;
          toast.error("Erro ao excluir convênio", {
            description: err.message,
          });
        }
      },
    });
  };

  const handleCopyLink = (convenio: Convenio) => {
    const publicUrl = `${window.location.origin}/public/co/${convenio.token}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Link do convênio copiado!");
  };

  const handleOpenLink = (convenio: Convenio) => {
    window.open(`/public/co/${convenio.token}`, "_blank", "noopener,noreferrer");
  };

  const getConvenioActions = (convenio: Convenio): ActionItem[] => {
    const actions: ActionItem[] = [
      {
        label: "Copiar Link Público",
        icon: <Copy className="h-4 w-4" />,
        onClick: () => handleCopyLink(convenio),
      },
      {
        label: "Abrir Link Público",
        icon: <ExternalLink className="h-4 w-4" />,
        onClick: () => handleOpenLink(convenio),
      },
    ];

    if (canEdit) {
      actions.push(
        {
          label: "Editar",
          icon: <Edit2 className="h-4 w-4" />,
          onClick: () => handleEdit(convenio),
        },
        {
          label: convenio.ativo ? "Desativar" : "Ativar",
          icon: <Power className="h-4 w-4" />,
          onClick: () => handleToggleStatus(convenio),
        },
        {
          label: "Excluir",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => handleDelete(convenio),
          isDestructive: true,
        }
      );
    }

    return actions;
  };

  const filteredConvenios = convenios.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isActionLoading = deleteConvenio.isPending || updateConvenio.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="px-0">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium",
                      isMobile && searchTerm && "pr-10"
                    )}
                  />
                  {isMobile && searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {!isMobile && searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="text-gray-500 hover:text-gray-900"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      onClick={handleRegister}
                      className={cn(
                        "bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 whitespace-nowrap",
                        isMobile && "flex-1 h-11"
                      )}
                    >
                      <Plus className="h-4 w-4" />
                      <span>{isMobile ? "Cadastrar" : "Cadastrar Convênio"}</span>
                    </Button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <ListSkeleton />
              ) : filteredConvenios.length > 0 ? (
                <ResponsiveDataList
                  data={filteredConvenios}
                  mobileContainerClassName="space-y-3"
                  mobileItemRenderer={(convenio) => (
                    <ConvenioMobileItem
                      key={convenio.id}
                      convenio={convenio}
                      actions={getConvenioActions(convenio)}
                    />
                  )}
                >
                  <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                    <table className="w-full">
                      <thead className="bg-gray-50/50">
                        <tr className="border-b border-gray-100 text-left">
                          <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredConvenios.map((convenio) => (
                          <ConvenioTableRow
                            key={convenio.id}
                            convenio={convenio}
                            actions={getConvenioActions(convenio)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResponsiveDataList>
              ) : (
                <UnifiedEmptyState
                  icon={Handshake}
                  title="Nenhum convênio encontrado"
                  description={
                    searchTerm
                      ? "Não encontramos nenhum convênio com os critérios de busca."
                      : "Cadastre oficinas ou autopeças parceiras para iniciar os lançamentos."
                  }
                  action={
                    !searchTerm && canEdit
                      ? { label: "Cadastrar Convênio", onClick: handleRegister }
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

export default Convenios;
