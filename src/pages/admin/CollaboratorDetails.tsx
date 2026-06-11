import { Can } from "@/components/auth/Can";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { CollaboratorItemsView } from "@/components/features/collaborator/CollaboratorItemsView";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { OccurrenceView } from "@/components/features/ocorrencias/OccurrenceView";
import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { messages } from "@/constants/messages";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { STATUS } from "@/constants/roles";
import { useLayout } from "@/contexts/LayoutContext";
import {
  safeCloseDialog,
  useCollaborator,
  useDateFilters,
  useDeleteVinculo,
  useFiltersManager,
  useFinancialReportViewModel,
  useRoles, useTimeMirrorViewModel
} from "@/hooks";
import { useDeleteCollaborator, useResetCollaboratorPassword, useUpdateCollaboratorStatus, useUpdateVinculo } from "@/hooks/api/useCollaboratorMutations";
import { useItensColaboradorQuery } from "@/hooks/api/useItensEquipamentos";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { cn } from "@/lib/utils";
import { ColaboradorCliente, Usuario } from "@/types/database";
import { OccurrenceFormMode } from "@/types/enums";
import { isMotoboy } from "@/utils/business/roles";
import { meses } from "@/utils/formatters/constants";
import { cnpjMask, cpfMask, phoneMask, pixMask } from "@/utils/masks";
import { onlyNumbers } from "@/utils/string";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Bike, Briefcase, Calendar as CalendarIcon, CalendarOff, Clock, CreditCard, Edit2, History, Lock, Mail, MapPin, MoreVertical, Package, Phone, Plus, RotateCcw, Trash2, User, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

export default function CollaboratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: collaborator, isLoading } = useCollaborator(id);
  const { data: itensAlocados = [] } = useItensColaboradorQuery(id!);
  const possuiItens = itensAlocados.length > 0;
  const { data: roles } = useRoles();
  const deleteVinculo = useDeleteVinculo();
  const updateVinculo = useUpdateVinculo();
  const updateStatus = useUpdateCollaboratorStatus();
  const deleteCollaborator = useDeleteCollaborator();
  const resetPassword = useResetCollaboratorPassword();
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openCollaboratorFormDialog,
    openCollaboratorTurnDialog,
    openSuccessRegistrationDialog,
    openOccurrenceFormDialog,
    openEndTurnDialog,
    setPageTitle,
  } = useLayout();

  useEffect(() => {
    setPageTitle("Colaborador");
  }, [setPageTitle]);

  const handleAddTurn = useCallback(() => {
    openCollaboratorTurnDialog({
      collaboratorId: id!
    });
  }, [id, openCollaboratorTurnDialog]);

  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  useEffect(() => {
    if (!hasAutoOpened && searchParams.get('openTurnDialog') === 'true' && collaborator && !isLoading) {
      setHasAutoOpened(true);
      handleAddTurn();

      // Properly clear the search param
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openTurnDialog');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, collaborator, isLoading, hasAutoOpened, setSearchParams]);


  const handleToggleStatus = async (collab: Usuario, newStatus: string) => {
    const confirmMessage = newStatus === STATUS.ATIVO ? messages.dialogo.ativar.descricao : "Tem certeza que deseja desligar este colaborador?";

    openConfirmationDialog({
      title: newStatus === STATUS.ATIVO ? "Ativar Colaborador" : "Desligar Colaborador",
      description: confirmMessage,
      confirmText: newStatus === STATUS.ATIVO ? "Confirmar" : "Desligar",
      variant: newStatus === STATUS.ATIVO ? "success" : "warning",
      onConfirm: async () => {
        try {
          await updateStatus.mutateAsync({ id: collab.id, status: newStatus });
          safeCloseDialog(closeConfirmationDialog);

          if (newStatus === STATUS.ATIVO) {
            // Pequeno delay para suavizar a transição entre diálogos
            setTimeout(() => {
              openSuccessRegistrationDialog({
                collaborator: collab,
                title: "Colaborador Ativo!",
                hideNewCollaboratorButton: true,
                hideTurnButton: collab.status !== STATUS.PENDENTE,
                description: (
                  <>
                    O cadastro do colaborador <span className="text-gray-900 font-bold">{collab.nome_completo}</span> foi ativado com sucesso.
                  </>
                )
              });
            }, 300);
          }
        } catch (error) {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  }

  const handleDelete = async () => {
    if (!collaborator) return;
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: `Tem certeza que deseja remover "${collaborator.nome_completo}"? Esta ação não pode ser desfeita.`,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteCollaborator.mutateAsync(collaborator.id);
          safeCloseDialog(closeConfirmationDialog);
          navigate("/colaboradores");
        } catch (error) {
          // O hook já exibe o toast de erro via o manipulador onError
        }
      },
    });
  };

  const handleResetPassword = async () => {
    if (!collaborator) return;
    openConfirmationDialog({
      title: "Resetar Senha",
      description: `Tem certeza que deseja resetar a senha deste colaborador? Ela voltará a ser os 6 primeiros dígitos do CPF.`,
      confirmText: "Resetar Senha",
      variant: "warning",
      onConfirm: async () => {
        try {
          await resetPassword.mutateAsync(collaborator.id);
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const actions = useCollaboratorActions({
    collaborator: collaborator as Usuario,
    onEdit: () => openCollaboratorFormDialog({ mode: "edit", editingCollaborator: collaborator as Usuario }),
    onStatusChange: handleToggleStatus,
    onDelete: handleDelete,
    onResetPassword: handleResetPassword,
    hideDetails: true,
  });

  const editAction = actions.find(a => a.label === "Editar");
  const resetAction = actions.find(a => a.label === "Resetar Senha");
  const statusAction = actions.find(a => ["Desligar", "Ativar", "Aprovar"].includes(a.label));
  const deleteAction = actions.find(a => a.label === "Excluir");

  const { selectedMes, setSelectedMes, selectedAno, setSelectedAno } = useDateFilters({
    mesParam: "mes",
    anoParam: "ano",
  });

  const { hasActiveFilters: hasDateFilters, clearFilters: clearDateFilters } = useFiltersManager(["mes", "ano"]);

  const filters = {
    selectedMes, setSelectedMes,
    selectedAno, setSelectedAno,
    hasActiveFilters: hasDateFilters,
    clearFilters: clearDateFilters
  };

  const pontoVm = useTimeMirrorViewModel({
    usuarioId: id,
    syncWithUrl: true,
  });

  const financeiroVm = useFinancialReportViewModel({
    usuarioId: id,
    syncWithUrl: true,
  });


  const monthOptions = useMemo(() =>
    meses.map((label, index) => ({ value: index + 1, label })),
    []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] lg:col-span-1 border rounded-3xl" />
          <Skeleton className="h-[600px] lg:col-span-2 border rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!collaborator) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Colaborador não encontrado.</p>
        <Button onClick={() => navigate("/colaboradores")} variant="link">Voltar para a lista</Button>
      </div>
    );
  }

  const role = roles?.find(r => r.id === Number(collaborator.perfil_id));


  const handleEditTurn = (turn: ColaboradorCliente) => {
    openCollaboratorTurnDialog({
      collaboratorId: id!,
      turnToEdit: turn
    });
  };

  const handleDeleteTurn = async (turnId: number) => {
    openConfirmationDialog({
      title: messages.dialogo.remover.titulo,
      description: messages.dialogo.remover.descricao,
      confirmText: messages.dialogo.remover.botao,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteVinculo.mutateAsync({ id: turnId, colaboradorId: id! });
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          // O hook useDeleteVinculo já exibe o toast de erro via o manipulador onError global do hook
        }
      },
    });
  };

  const handleEndTurn = (link: ColaboradorCliente) => {
    openEndTurnDialog({
      turnId: link.id,
      collaboratorId: id!,
      clientName: (link as any).cliente?.nome_fantasia || "Cliente",
    });
  };

  const handleReactivateTurn = (link: ColaboradorCliente) => {
    openConfirmationDialog({
      title: "Reativar Turno",
      description: `Deseja realmente reativar o turno? O colaborador voltará a poder registrar atividade.`,
      confirmText: "Reativar",
      variant: "success",
      onConfirm: async () => {
        try {
          await updateVinculo.mutateAsync({
            id: link.id,
            colaborador_id: id!,
            data_fim: null,
            silent: true,
          });
          safeCloseDialog(closeConfirmationDialog);
        } catch (error) {
          toast.error(messages.erro.atualizar);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case STATUS.ATIVO: return "bg-green-100 text-green-700 border-green-200";
      case STATUS.INATIVO: return "bg-red-100 text-red-700 border-red-200";
      case STATUS.PENDENTE: return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  }

  const getAvatarStatusColor = (status: string) => {
    switch (status) {
      case STATUS.ATIVO: return "border-green-200 text-green-700";
      case STATUS.INATIVO: return "border-red-200 text-red-700";
      case STATUS.PENDENTE: return "border-yellow-200 text-yellow-700";
      default: return "border-gray-200 text-gray-600";
    }
  }


  const activeTab = searchParams.get("tab") || "dados";

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Identity Header com Ações Embutidas */}
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white mb-2">
        <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Informações do Colaborador (Esquerda) */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative shrink-0 select-none">
              <div
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border flex items-center justify-center transition-all duration-300",
                  getAvatarStatusColor(collaborator.status)
                )}
              >
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-current" />
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full font-black border text-[9px] uppercase tracking-wider shadow-sm transition-all duration-300 cursor-default",
                  getStatusColor(collaborator.status)
                )}
              >
                {collaborator.status}
              </Badge>
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {collaborator.nome_completo}
              </h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {role?.nome && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/5 text-primary border-primary/10 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none"
                  >
                    <Briefcase className="w-3.5 h-3.5 shrink-0" />
                    <span>{role.nome}</span>
                  </Badge>
                )}

                {possuiItens && (
                  collaborator.status !== STATUS.INATIVO ? (
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 border-blue-100 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none"
                    >
                      <Package className="w-3.5 h-3.5 shrink-0" />
                      <span>Possui Itens</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-rose-50 text-rose-700 border-rose-200 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-none animate-pulse border-l-4 border-l-rose-500"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 animate-bounce" />
                      <span>Pendência: Devolver Itens</span>
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Ações (Direita) */}
          <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
            {editAction && (
              <Button
                onClick={editAction.onClick}
                className="rounded-xl flex items-center gap-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm h-10"
              >
                <Edit2 className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}

            {statusAction && (
              <Button
                variant="outline"
                onClick={statusAction.onClick}
                className="rounded-xl flex items-center gap-1.5 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-sm shadow-sm h-10"
              >
                {statusAction.icon}
                <span>{statusAction.label}</span>
              </Button>
            )}

            {resetAction && (
              <Button
                variant="outline"
                onClick={resetAction.onClick}
                className="rounded-xl border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1.5 px-4 font-semibold text-sm shadow-sm h-10"
              >
                <Lock className="h-4 w-4" />
                <span>Resetar Senha</span>
              </Button>
            )}

            {deleteAction && (
              <ActionsDropdown actions={[deleteAction]}>
                <Button
                  variant="outline"
                  className="rounded-xl border-gray-200 shadow-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center p-2.5 h-10 w-10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </ActionsDropdown>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex w-full justify-start overflow-x-auto lg:w-max h-12 rounded-2xl bg-gray-100 p-1 no-scrollbar scroll-smooth whitespace-nowrap">
          <TabsTrigger value="dados" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <User className="h-4 w-4" />
            <span>Dados</span>
          </TabsTrigger>
          <TabsTrigger value="turnos" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Clock className="h-4 w-4" />
            <span>Turnos</span>
          </TabsTrigger>
          <TabsTrigger value="itens" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Package className="h-4 w-4" />
            <span>Itens</span>
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <History className="h-4 w-4" />
            <span>Ocorrências</span>
          </TabsTrigger>
          <TabsTrigger value="ponto" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Clock className="h-4 w-4" />
            <span>Atividade</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Wallet className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" forceMount className={cn("space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "dados" && "hidden")}>

          {collaborator.senha_padrao && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800 rounded-3xl shadow-sm border-l-4 border-l-blue-600 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-2.5 rounded-2xl shadow-md shadow-blue-200">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <AlertTitle className="text-xs font-black uppercase tracking-[0.15em] mb-1">
                    Senha Provisória Ativa
                  </AlertTitle>
                  <AlertDescription className="text-sm font-medium opacity-90 leading-relaxed">
                    Este colaborador ainda utiliza a senha padrão. A senha para o primeiro acesso são os <strong>6 primeiros dígitos do CPF</strong>.
                    <div className="mt-2 pt-2 border-t border-blue-200/50 flex flex-col gap-0.5">
                      <p className="text-[11px] font-bold">Login: <span className="font-mono text-xs">{cpfMask(collaborator.cpf)}</span></p>
                      <p className="text-[11px] font-bold">Senha: <span className="font-mono text-xs text-blue-600">{onlyNumbers(collaborator.cpf).slice(0, 6)}</span></p>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Info - Left Column */}
            <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">E-mail</p>
                    <p className="text-sm font-medium text-gray-700 break-all">{collaborator.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Documentos</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">CPF</p>
                        <p className="text-sm font-medium text-gray-700">{cpfMask(collaborator.cpf)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">RG</p>
                        <p className="text-sm font-medium text-gray-700">{collaborator.rg || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg shrink-0">
                    <CalendarIcon className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Nascimento</p>
                    <p className="text-sm font-medium text-gray-700">
                      {collaborator.data_nascimento ? format(parseISO(collaborator.data_nascimento), "dd/MM/yyyy") : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Telefone</p>
                    <p className="text-sm font-medium text-gray-700">{collaborator.telefone ? phoneMask(collaborator.telefone) : 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                    <div className="h-4 w-4 font-bold text-emerald-600 flex items-center justify-center text-[10px]">R$</div>
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Financeiro</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">TIPO CHAVE PIX</p>
                        <p className="text-sm font-medium text-gray-700">{collaborator.tipo_chave_pix || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">CHAVE PIX</p>
                        <p className="text-sm font-medium text-gray-700 break-all">
                          {pixMask(collaborator.chave_pix, collaborator.tipo_chave_pix) || '-'}
                        </p>
                      </div>
                      {collaborator.cnpj && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground font-semibold">CNPJ (MEI)</p>
                          <p className="text-sm font-medium text-gray-700">{cnpjMask(collaborator.cnpj)}</p>
                        </div>
                      )}
                      {(collaborator.valor_mei !== undefined) && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground font-semibold">VALOR MEI</p>
                          <p className="text-sm font-medium text-gray-700">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(collaborator.valor_mei || 0)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg shrink-0">
                    <MapPin className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Endereço</p>
                    <p className="text-sm font-medium text-gray-700 leading-tight">{collaborator.endereco_completo || 'Não informado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-6">

              {isMotoboy(role?.nome) && (
                <Card className="border-0 shadow-sm rounded-3xl border-l-4 border-l-primary bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Bike className="h-4 w-4 text-primary" />
                      Veículo & CNH
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Moto / Modelo</p>
                      <p className="text-sm font-bold">{collaborator.moto_modelo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Placa</p>
                      <Badge variant="outline" className="font-mono bg-yellow-50">{collaborator.moto_placa || '-'}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Cor / Ano</p>
                      <p className="text-sm font-medium">{collaborator.moto_cor || '-'} / {collaborator.moto_ano || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CNH</p>
                      <p className="text-sm font-medium">{collaborator.cnh_registro || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Categoria</p>
                      <p className="text-sm font-medium">{collaborator.cnh_categoria || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Vencimento CNH</p>
                      <p className="text-sm font-medium">
                        {collaborator.cnh_vencimento ? format(parseISO(collaborator.cnh_vencimento), "dd/MM/yyyy") : '-'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </TabsContent>

        <TabsContent value="turnos" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "turnos" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px] flex flex-col pt-4">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8 gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block">Turnos Ativos</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">Vínculos diretos com clientes e horários.</span>
                  </div>
                </CardTitle>
              </div>
              <Can I={PERMISSIONS.USUARIOS.EDITAR}>
                <Button
                  onClick={handleAddTurn}
                  className="rounded-xl flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 shadow-sm select-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Turno</span>
                </Button>
              </Can>
            </CardHeader>
            <CardContent className="p-8 flex-1">
              {!collaborator.links || collaborator.links.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-700">Nenhum turno configurado</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                    Este colaborador ainda não tem turnos atribuídos.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {collaborator.links.map((link, index) => (
                    <div
                      key={link.id || index}
                      className="group border border-gray-100 p-5 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all relative bg-gray-50/10"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl">
                          <Bike className="h-5 w-5 text-primary" />
                        </div>
                        <Can I={PERMISSIONS.USUARIOS.EDITAR}>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button onClick={() => handleEditTurn(link)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary rounded-lg">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            {!link.data_fim ? (
                              <Button onClick={() => handleEndTurn(link)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-amber-500 rounded-lg" title="Encerrar Vínculo">
                                <CalendarOff className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button onClick={() => handleReactivateTurn(link)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-500 rounded-lg" title="Reativar Vínculo">
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button onClick={() => handleDeleteTurn(link.id)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-lg">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Can>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 leading-tight">
                              {link.cliente?.nome_fantasia}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-[11px] text-gray-500 font-medium capitalize">
                                {link.unidade?.nome_unidade?.toLowerCase()}
                              </p>
                              {link.horarios?.[0] && (
                                <>
                                  <span className="text-gray-300 text-[10px]">•</span>
                                  <span className="text-[11px] font-bold text-primary">
                                    {link.horarios[0].hora_inicio.substring(0, 5)} - {link.horarios[0].hora_fim.substring(0, 5)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          {link.data_fim && new Date(link.data_fim + 'T00:00:00') < new Date() && (
                            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 font-bold text-[10px] shrink-0">
                              Encerrado em: {new Date(link.data_fim + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Escala Semanal</p>
                            <div className="flex flex-wrap gap-1">
                              {link.horarios && link.horarios.length > 0 ? (
                                <ScaleIndicators
                                  activeDays={link.horarios.map(h => h.dia_semana)}
                                  availableDays={link.unidade?.escala_semanal}
                                  size="sm"
                                  variant="condensed"
                                />
                              ) : (
                                <Badge variant="outline" className="bg-red-50 border-red-200 text-red-600 font-bold text-[9px]">
                                  Sem horário
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empresa</p>
                            <p className="text-sm font-medium text-gray-600 mt-0.5">
                              {link.empresa?.nome_fantasia || link.empresa?.razao_social || 'EE'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Taxa Entrega</p>
                            <p className="text-sm font-bold text-gray-700 mt-0.5">
                              {link.taxa_entrega ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(link.taxa_entrega) : '-'}
                            </p>
                          </div>
                        </div>

                        {link.valor_contrato && (
                          <div className="pt-3 mt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Valor Total</span>
                            <span className="text-sm font-extrabold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                (link.valor_contrato || 0) +
                                (link.valor_aluguel || 0) +
                                (link.valor_bonus || 0) +
                                (link.ajuda_custo || 0)
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocorrencias" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "ocorrencias" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8 gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block">Histórico de Ocorrências</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">Registros de ausências, atrasos e outros eventos.</span>
                  </div>
                </CardTitle>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100">
                <div className="flex items-center gap-2">
                  <Select value={String(filters.selectedMes)} onValueChange={(v) => filters.setSelectedMes?.(Number(v))}>
                    <SelectTrigger className="h-11 w-[130px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {meses.map((label, index) => (
                        <SelectItem key={index} value={String(index + 1)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1 capitalize">{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={String(filters.selectedAno)} onValueChange={(v) => filters.setSelectedAno?.(Number(v))}>
                    <SelectTrigger className="h-11 w-[90px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                      {[new Date().getFullYear(), new Date().getFullYear() - 1].map(ano => (
                        <SelectItem key={ano} value={String(ano)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1">{ano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />

                <Button
                  onClick={() => openOccurrenceFormDialog({
                    collaboratorId: id,
                    mode: OccurrenceFormMode.GENERAL,
                    onSuccess: () => {
                      financeiroVm.refetch();
                    }
                  })}
                  className="rounded-xl flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 shadow-sm select-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Registrar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <OccurrenceView
                usuarioId={id}
                mode="monthly"
                selectedMonth={filters.selectedMes}
                selectedYear={filters.selectedAno}
                showFilters={false}
                impactoFinanceiro={false}
                onOccurrenceDeleted={() => financeiroVm.refetch()}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ponto" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "ponto" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8 gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block">Espelho de Atividade</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">Histórico detalhado de entradas e saídas.</span>
                  </div>
                </CardTitle>
              </div>

              <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100">
                <Select value={String(filters.selectedMes)} onValueChange={(v) => filters.setSelectedMes?.(Number(v))}>
                  <SelectTrigger className="h-11 w-[120px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {meses.map((label, index) => (
                      <SelectItem key={index} value={String(index + 1)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1 capitalize">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(filters.selectedAno)} onValueChange={(v) => filters.setSelectedAno?.(Number(v))}>
                  <SelectTrigger className="h-11 w-[90px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1].map(ano => (
                      <SelectItem key={ano} value={String(ano)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1">{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={pontoVm.filters.selectedTurno} onValueChange={(v) => pontoVm.setShift?.(v)} disabled={pontoVm.availableShifts.length === 0}>
                  <SelectTrigger className="h-11 w-[270px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={pontoVm.availableShifts.length === 0 ? "Sem turnos" : "Selecione..."} />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {pontoVm.availableShifts.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1">{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <TimeMirrorView
                usuarioId={id}
                selectedMonth={filters.selectedMes}
                selectedYear={filters.selectedAno}
                selectedShift={pontoVm.filters.selectedTurno}
                isActionable
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "financeiro" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px]">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-50 pb-6 pt-8 px-8 gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="block">Fechamento Financeiro</span>
                    <span className="text-xs text-muted-foreground font-medium mt-0.5">Relatórios de pagamentos e descontos.</span>
                  </div>
                </CardTitle>
              </div>

              <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100">
                <Select value={String(filters.selectedMes)} onValueChange={(v) => filters.setSelectedMes?.(Number(v))}>
                  <SelectTrigger className="h-11 w-[130px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {meses.map((label, index) => (
                      <SelectItem key={index} value={String(index + 1)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1 capitalize">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(filters.selectedAno)} onValueChange={(v) => filters.setSelectedAno?.(Number(v))}>
                  <SelectTrigger className="h-11 w-[90px] rounded-2xl border-none bg-white shadow-sm font-bold text-xs text-gray-700 focus:ring-2 focus:ring-primary/20 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1].map(ano => (
                      <SelectItem key={ano} value={String(ano)} className="text-xs font-bold focus:bg-primary/5 focus:text-primary rounded-xl m-1">{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="h-8 w-[1px] bg-gray-200 hidden sm:block mx-1" />

                <Button
                  onClick={() => openOccurrenceFormDialog({
                    collaboratorId: id,
                    mode: OccurrenceFormMode.FINANCIAL,
                    onSuccess: () => {
                      financeiroVm.refetch();
                    }
                  })}
                  className="rounded-xl flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-9 shadow-sm select-none"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Lançamento</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-6">
              <FinancialReportView
                usuarioId={id}
                colaboradorNome={collaborator?.nome_completo}
                selectedMonth={filters.selectedMes}
                selectedYear={filters.selectedAno}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="itens" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "itens" && "hidden")}>
          <CollaboratorItemsView colaboradorId={id!} />
        </TabsContent>
      </Tabs>



    </div>
  );
}
