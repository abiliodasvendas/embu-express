import { Can } from "@/components/auth/Can";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListSkeleton } from "@/components/skeletons";
import { messages } from "@/constants/messages";
import { PERMISSIONS, ROLES } from "@/constants/permissions.enum";
import { STATUS } from "@/constants/roles";
import { useLayout } from "@/contexts/LayoutContext";
import { useCollaborator, useDeleteVinculo, useRoles } from "@/hooks";
import { useDeleteCollaborator, useUpdateCollaboratorStatus } from "@/hooks/api/useCollaboratorMutations";
import { useDeleteOcorrencia } from "@/hooks/api/useOcorrenciaMutations";
import { useCollaboratorActions } from "@/hooks/business/useCollaboratorActions";
import { cn } from "@/lib/utils";
import { ColaboradorCliente, Usuario } from "@/types/database";
import { cnpjMask, cpfMask, dateMask, phoneMask } from "@/utils/masks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinancialReportView } from "@/components/features/financeiro/FinancialReportView";
import { TimeMirrorView } from "@/components/features/ponto/TimeMirrorView";
import { OccurrenceFormDialog } from "@/components/dialogs/OccurrenceFormDialog";
import { OccurrenceDetailsDialog } from "@/components/dialogs/OccurrenceDetailsDialog";
import { useOcorrencias } from "@/hooks/api/useOcorrencias";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertCircle, Bike, Calendar as CalendarIcon, ChevronDown, ChevronLeft, Clock, CreditCard, Edit2, FileText, History, Mail, MapPin, MoreVertical, Phone, Plus, Trash2, User, Wallet, Link2, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { meses, anos } from "@/utils/formatters/constants";


export default function CollaboratorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: collaborator, isLoading, refetch } = useCollaborator(id);
  const { data: roles } = useRoles();
  const deleteVinculo = useDeleteVinculo();
  const updateStatus = useUpdateCollaboratorStatus();
  const deleteCollaborator = useDeleteCollaborator();
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openCollaboratorFormDialog,
    openCollaboratorTurnDialog,
    openSuccessRegistrationDialog,
    openOccurrenceFormDialog,
    setPageTitle,
  } = useLayout();

  useEffect(() => {
    setPageTitle("Colaborador");
  }, [setPageTitle]);

  const handleAddTurn = () => {
    openCollaboratorTurnDialog({
      collaboratorId: id!
    });
  };

  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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
    const confirmMessage = newStatus === STATUS.ATIVO ? messages.dialogo.ativar.descricao : messages.dialogo.desativar.descricao;

    openConfirmationDialog({
      title: newStatus === STATUS.ATIVO ? "Ativar Colaborador" : "Desativar Colaborador",
      description: confirmMessage,
      confirmText: "Confirmar",
      variant: newStatus === STATUS.ATIVO ? "success" : "warning",
      onConfirm: async () => {
        try {
          await updateStatus.mutateAsync({ id: collab.id, status: newStatus });
          closeConfirmationDialog();

          if (newStatus === STATUS.ATIVO) {
            // Pequeno delay para suavizar a transição entre diálogos
            setTimeout(() => {
              openSuccessRegistrationDialog({
                collaborator: collab,
                title: "Aprovação Realizada!",
                hideNewCollaboratorButton: true,
                description: (
                  <>
                    O colaborador <span className="text-gray-900 font-bold">{collab.nome_completo}</span> foi aprovado com sucesso.
                  </>
                )
              });
            }, 300);
          }
        } catch (error) {
          console.error(error);
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
          closeConfirmationDialog();
          navigate("/colaboradores");
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const actions = useCollaboratorActions({
    collaborator: collaborator as Usuario,
    onEdit: () => openCollaboratorFormDialog({ mode: "edit", editingCollaborator: collaborator as Usuario }),
    onStatusChange: handleToggleStatus,
    onDelete: handleDelete,
    hideDetails: true,
  });

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const dateRange = useMemo(() => {
    const date = new Date(selectedYear, selectedMonth - 1, 1);
    return {
      inicio: format(startOfMonth(date), "yyyy-MM-dd"),
      fim: format(endOfMonth(date), "yyyy-MM-dd")
    };
  }, [selectedMonth, selectedYear]);

  const { data: occurrences = [], isLoading: isLoadingOccurrences, refetch: refetchOccurrences } = useOcorrencias({
    usuario_id: id,
    data_inicio: dateRange.inicio,
    data_fim: dateRange.fim,
    order: "data_ocorrencia",
    ascending: false,
  });

  const deleteOcorrencia = useDeleteOcorrencia();

  const handleDeleteOccurrence = (occurrence: any) => {
    openConfirmationDialog({
      title: "Remover Ocorrência",
      description: `Deseja realmente remover esta ocorrência? Esta ação não pode ser desfeita.`,
      confirmText: "Remover",
      variant: "destructive",
      onConfirm: async () => {
        await deleteOcorrencia.mutateAsync(occurrence.id);
        setIsDetailsOpen(false);
        closeConfirmationDialog();
        refetchOccurrences();
      },
    });
  };

  const monthOptions = useMemo(() =>
    meses.map((label, index) => ({ value: index + 1, label })),
    []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 animate-in fade-in duration-500">
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
      <div className="p-6 text-center">
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
          await deleteVinculo.mutateAsync(turnId);
          closeConfirmationDialog();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return "bg-green-100 text-green-700 border-green-200";
      case 'INATIVO': return "bg-red-100 text-red-700 border-red-200";
      case 'PENDENTE': return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  }


  const activeTab = searchParams.get("tab") || "dados";

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams, { replace: true });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/colaboradores")}
            className="hover:bg-gray-100 rounded-xl px-2"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar
          </Button>
          <div className="flex gap-2 items-center">
            <ActionsDropdown actions={actions}>
              <Button variant="outline" className="rounded-xl border-gray-200 shadow-sm text-gray-700 bg-white hover:bg-gray-50 flex items-center gap-1 px-3">
                <span className="hidden sm:inline font-semibold">Ações</span>
                <MoreVertical className="h-4 w-4 sm:hidden -mx-1" />
                <ChevronDown className="h-4 w-4 hidden sm:block opacity-50 text-gray-500" />
              </Button>
            </ActionsDropdown>
          </div>
        </div>
      </div>

      {/* Identity Header */}
      <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white mb-2">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <User className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 justify-center sm:justify-start mb-1">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {collaborator.nome_completo}
              </h2>
              <Badge
                variant="secondary"
                className={cn(
                  "w-fit mx-auto sm:mx-0 px-3 py-1 rounded-full font-bold border text-[10px] uppercase tracking-wider",
                  getStatusColor(collaborator.status)
                )}
              >
                {collaborator.status}
              </Badge>
            </div>
            {role?.nome && (
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] bg-primary/5 w-fit px-3 py-1 rounded-lg mx-auto sm:mx-0">
                {role.nome}
              </p>
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
          <TabsTrigger value="ocorrencias" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <History className="h-4 w-4" />
            <span>Ocorrências</span>
          </TabsTrigger>
          <TabsTrigger value="ponto" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Clock className="h-4 w-4" />
            <span>Ponto</span>
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 shrink-0 px-4">
            <Wallet className="h-4 w-4" />
            <span>Financeiro</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados" forceMount className={cn("space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "dados" && "hidden")}>
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
                    <p className="text-sm font-medium text-gray-700 truncate">{collaborator.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                    <CreditCard className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Documentos</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">CPF</p>
                        <p className="text-sm font-medium text-gray-700">{cpfMask(collaborator.cpf)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">RG</p>
                        <p className="text-sm font-medium text-gray-700">{collaborator.rg || '-'}</p>
                      </div>
                      {collaborator.cnpj && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-muted-foreground font-semibold">CNPJ (MEI)</p>
                          <p className="text-sm font-medium text-gray-700">{cnpjMask(collaborator.cnpj)}</p>
                        </div>
                      )}
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
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Financeiro</p>
                    <div className="space-y-1">
                      {collaborator.tipo_chave_pix && (
                        <p className="text-[10px] text-muted-foreground font-semibold leading-none mt-1">
                          {collaborator.tipo_chave_pix}
                        </p>
                      )}
                      <p className="text-sm font-medium text-gray-700 break-all leading-tight">
                        {collaborator.chave_pix || '-'}
                      </p>
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
              {role?.nome === ROLES.MOTOBOY && (
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
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-6 px-8">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Turnos Ativos
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Vínculos diretos com clientes e horários.</p>
              </div>
              <Can I={PERMISSIONS.USUARIOS.EDITAR}>
                <Button onClick={handleAddTurn} size="sm" className="rounded-xl shadow-md shadow-primary/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Turno
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
                            <Button onClick={() => handleDeleteTurn(link.id)} variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500 rounded-lg">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Can>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Cliente</p>
                          <h4 className="font-bold text-gray-800 leading-tight">
                            {link.cliente?.nome_fantasia}
                          </h4>
                        </div>

                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Horário</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge variant="outline" className="bg-white border-primary/20 text-primary font-bold">
                                {link.hora_inicio?.substring(0, 5)} — {link.hora_fim?.substring(0, 5)}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Empresa</p>
                            <p className="text-sm font-medium text-gray-600 mt-0.5">
                              {link.empresa?.nome_fantasia || link.empresa?.razao_social || 'EE'}
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
            <CardHeader className="pb-6 pt-8 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Histórico de Ocorrências
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Registros de faltas, atrasos e outros eventos.</p>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
                  <SelectTrigger className="h-9 w-[130px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {meses.map((label, index) => (
                      <SelectItem key={index} value={String(index + 1)} className="text-xs">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
                  <SelectTrigger className="h-9 w-[90px] rounded-xl border-none bg-white shadow-sm font-semibold text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {[new Date().getFullYear(), new Date().getFullYear() - 1].map(ano => (
                      <SelectItem key={ano} value={String(ano)} className="text-xs">{ano}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => openOccurrenceFormDialog({ collaboratorId: id, onSuccess: refetchOccurrences })}
                  className="rounded-xl h-9 px-4 gap-2 shadow-sm font-bold bg-primary hover:bg-primary/90 text-white border-none"
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Lançar</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {isLoadingOccurrences ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-2xl" />)}
                </div>
              ) : occurrences.length > 0 ? (
                <div className="relative space-y-0 pb-4">
                  {/* Linha Vertical da TimeLine */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-gray-100" />

                  {occurrences.map((oc, index) => (
                    <div
                      key={oc.id}
                      onClick={() => {
                        setSelectedOccurrence(oc);
                        setIsDetailsOpen(true);
                      }}
                      className="relative pl-9 py-4 group cursor-pointer transition-all hover:bg-gray-50/50 rounded-2xl"
                    >
                      {/* Ponto da Timeline */}
                      <div className={cn(
                        "absolute left-0 top-[22px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all group-hover:scale-110",
                        oc.tipo_lancamento === "SAIDA" ? "bg-red-500" : "bg-green-500"
                      )}>
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">
                              {format(new Date(oc.data_ocorrencia), "dd 'de' MMM", { locale: ptBR })}
                            </span>
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-gray-200 text-gray-500 font-bold bg-white">
                              {oc.tipo?.descricao || 'Ocorrência'}
                            </Badge>
                          </div>
                          <p className="text-sm font-semibold text-gray-700 truncate pr-4 italic">
                            {oc.observacao || 'Sem observação'}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {oc.impacto_financeiro && (
                            <div className={cn(
                              "text-xs font-black px-2 py-1 rounded-lg",
                              oc.tipo_lancamento === "SAIDA" ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"
                            )}>
                              {oc.tipo_lancamento === "SAIDA" ? "-" : "+"} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(oc.valor || 0)}
                            </div>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <div className="p-4 bg-primary/5 rounded-full mb-4">
                    <History className="h-8 w-8 text-primary/40" />
                  </div>
                  <h3 className="font-bold text-gray-900">Nenhuma ocorrência</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto mt-1">Este colaborador não possui ocorrências registradas para este período.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ponto" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "ponto" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px]">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Espelho de Ponto
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Histórico detalhado de entradas, saídas e intervalos.</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <TimeMirrorView usuarioId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" forceMount className={cn("mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300", activeTab !== "financeiro" && "hidden")}>
          <Card className="border-0 shadow-sm rounded-3xl min-h-[500px]">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-xl flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Fechamento Financeiro
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Relatórios de pagamentos e descontos mensais.</p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <FinancialReportView usuarioId={id} colaboradorNome={collaborator?.nome_completo} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      <OccurrenceDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        occurrence={selectedOccurrence}
        onDelete={() => handleDeleteOccurrence(selectedOccurrence)}
      />

    </div>
  );
}
