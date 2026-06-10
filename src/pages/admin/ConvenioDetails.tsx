import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLayout } from "@/contexts/LayoutContext";
import { useConvenio, useConvenioLancamentos, useDeleteAdminLancamento, useUpdateConvenio } from "@/hooks/api/useConvenios";
import { LancamentoConvenio } from "@/hooks/api/useConvenios";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { LancamentoForm } from "@/components/features/convenios/public/LancamentoForm";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/utils/dialogUtils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  CheckCircle2,
  DollarSign,
  FileText,
  Loader2,
  Edit2,
  Wrench,
  Plus,
  Trash2,
  Handshake,
  Copy,
  CopyCheck,
  ExternalLink,
  Search,
  Power,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface GroupedLancamento {
  name: string;
  isFrota: boolean;
  total: number;
  items: LancamentoConvenio[];
}

export default function ConvenioDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    setPageTitle,
    openConvenioFormDialog,
    openConfirmationDialog,
    closeConfirmationDialog,
  } = useLayout();
  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.CONVENIOS.EDITAR);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"colaboradores" | "todos">("todos");
  const [isLancamentoFormOpen, setIsLancamentoFormOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoConvenio | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const deleteLancamento = useDeleteAdminLancamento();
  const updateConvenio = useUpdateConvenio();

  const handleToggleStatus = () => {
    if (!convenio) return;
    const nextStatus = !convenio.ativo;
    openConfirmationDialog({
      title: nextStatus ? "Ativar Convênio" : "Desativar Convênio",
      description: `Tem certeza que deseja ${nextStatus ? "ativar" : "desativar"} o convênio "${convenio.nome}"?`,
      confirmText: nextStatus ? "Ativar" : "Desativar",
      variant: nextStatus ? "default" : "destructive",
      onConfirm: async () => {
        try {
          await updateConvenio.mutateAsync({
            id: convenio.id,
            ativo: nextStatus,
          });
          toast.success(`Convênio ${nextStatus ? "ativado" : "desativado"} com sucesso!`);
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

  const mes = currentDate.getMonth() + 1;
  const ano = currentDate.getFullYear();

  const { data: convenio, isLoading: isConvenioLoading } = useConvenio(id || "");
  const { data: lancamentos = [], isLoading: isLancamentosLoading } =
    useConvenioLancamentos(id || "", ano, mes);

  const handleDeleteLancamento = (lancamento: LancamentoConvenio) => {
    openConfirmationDialog({
      title: "Excluir Lançamento",
      description: `Deseja realmente excluir o lançamento de ${formatCurrency(Number(lancamento.valor))}? Esta ação não pode ser desfeita.`,
      confirmText: "Sim, excluir",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteLancamento.mutateAsync({ convenioId: id || "", id: lancamento.id });
          toast.success("Lançamento excluído com sucesso!");
        } catch (error) {
          toast.error("Erro ao excluir lançamento");
        } finally {
          safeCloseDialog(closeConfirmationDialog);
        }
      },
    });
  };

  useEffect(() => {
    if (convenio) {
      setPageTitle("Convênio");
    } else if (!isConvenioLoading) {
      setPageTitle("Convênio não encontrado");
    }
  }, [convenio, isConvenioLoading, setPageTitle]);

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[monthIndex];
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatLocalDate = (dateStr: string) => {
    const [year, month, day] = dateStr.substring(0, 10).split("-");
    return `${day}/${month}/${year}`;
  };

  const sortedLancamentos = useMemo(() => {
    return [...lancamentos].sort((a, b) => {
      return new Date(b.data_lancamento).getTime() - new Date(a.data_lancamento).getTime();
    });
  }, [lancamentos]);

  const filteredLancamentos = useMemo(() => {
    if (!searchQuery.trim()) return sortedLancamentos;
    const query = searchQuery.toLowerCase();
    return sortedLancamentos.filter((l) => {
      const collabName = l.colaborador?.nome_completo?.toLowerCase() || "";
      const isFrota = l.moto_embu ? "veículo embu express" : "";
      const desc = l.descricao?.toLowerCase() || "";
      return collabName.includes(query) || isFrota.includes(query) || desc.includes(query);
    });
  }, [sortedLancamentos, searchQuery]);

  const groupedLancamentos = useMemo((): GroupedLancamento[] => {
    const groups: Record<string, GroupedLancamento> = {};

    filteredLancamentos.forEach((l) => {
      if (l.moto_embu || !l.colaborador_id) {
        const key = "veiculo";
        if (!groups[key]) {
          groups[key] = {
            name: "Veículo Embu Express",
            isFrota: true,
            total: 0,
            items: [],
          };
        }
        groups[key].items.push(l);
        groups[key].total += Number(l.valor);
      } else {
        const key = l.colaborador_id;
        const name = l.colaborador?.nome_completo;
        if (!groups[key]) {
          groups[key] = {
            name,
            isFrota: false,
            total: 0,
            items: [],
          };
        }
        groups[key].items.push(l);
        groups[key].total += Number(l.valor);
      }
    });

    return Object.values(groups).sort((a, b) => {
      if (a.isFrota) return -1;
      if (b.isFrota) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredLancamentos]);

  const stats = useMemo(() => {
    const totalValue = lancamentos.reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalCount = lancamentos.length;
    const uniqueMotoboys = new Set(
      lancamentos
        .filter((l) => l.colaborador_id)
        .map((l) => l.colaborador_id)
    ).size;

    return { totalValue, totalCount, uniqueMotoboys };
  }, [lancamentos]);

  const getStatusColor = (status: boolean) => {
    return status
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  const getAvatarStatusColor = (status: boolean) => {
    return status ? "border-green-200 text-green-700" : "border-red-200 text-red-700";
  };

  if (isConvenioLoading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <Skeleton className="h-6 w-48 rounded-full" />
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
          <Skeleton className="h-10 w-32 rounded-2xl" />
          <Skeleton className="h-10 w-24 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-28 rounded-2xl" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!convenio) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <Wrench className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Convênio não encontrado
        </h2>
        <p className="text-muted-foreground max-w-xs">
          O convênio solicitado pode ter sido removido ou o ID está incorreto.
        </p>
        <Button
          onClick={() => navigate("/convenios")}
          className="rounded-2xl px-8 shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Voltar para a lista
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-full transition-all duration-500">
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Identity Header com Ações Embutidas */}
        <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white mb-2">
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Informações do Convênio (Esquerda) */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative shrink-0 select-none">
                <div
                  className={cn(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 border flex items-center justify-center transition-all duration-300",
                    getAvatarStatusColor(convenio.ativo)
                  )}
                >
                  <Handshake className="h-8 w-8 sm:h-10 sm:w-10 text-current" />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full font-black border text-[9px] uppercase tracking-wider shadow-sm transition-all duration-300 cursor-default",
                    getStatusColor(convenio.ativo)
                  )}
                >
                  {convenio.ativo ? "ATIVO" : "INATIVO"}
                </Badge>
              </div>
              <div className="text-center sm:text-left space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                  {convenio.nome}
                </h2>
                {convenio.token && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                    <div className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-gray-500 shadow-sm max-w-full">
                      <span className="truncate max-w-[150px] sm:max-w-[250px] text-gray-600">
                        {`${window.location.origin.replace(/^https?:\/\//, "")}/public/co/${convenio.token}`}
                      </span>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-blue-600 transition-colors p-0.5"
                        onClick={() =>
                          window.open(
                            `${window.location.origin}/public/co/${convenio.token}`,
                            "_blank",
                          )
                        }
                        title="Abrir link público"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/public/co/${convenio.token}`);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all select-none border shadow-sm h-7",
                        isCopied
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      {isCopied ? (
                        <>
                          <CopyCheck className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copiar Link</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ações (Direita) */}
            <div className="flex flex-wrap gap-2 items-center justify-center md:justify-end">
              <Button
                variant="outline"
                onClick={() => navigate("/convenios")}
                className="rounded-xl flex items-center gap-1.5 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-sm shadow-sm h-10"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>

              {canEdit && (
                <>
                  <Button
                    onClick={() => openConvenioFormDialog({ convenioToEdit: convenio })}
                    className="rounded-xl flex items-center gap-1.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm h-10"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleToggleStatus}
                    className="rounded-xl flex items-center gap-1.5 px-4 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 font-semibold text-sm shadow-sm h-10"
                  >
                    <Power className="h-4 w-4" />
                    <span>{convenio.ativo ? "Desativar" : "Ativar"}</span>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-10 w-10 rounded-xl text-gray-500 hover:bg-slate-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Período de Referência
              </span>
              <span className="text-lg font-extrabold text-gray-800">
                {getMonthName(currentDate.getMonth())} de {ano}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-10 w-10 rounded-xl text-gray-500 hover:bg-slate-50"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <DollarSign className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total do Mês</span>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {formatCurrency(stats.totalValue)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <FileText className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Lançamentos</span>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {String(stats.totalCount).padStart(2, '0')}
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <Users className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Motoboys Atendidos</span>
            </div>
            <div className="text-3xl font-black text-gray-900">
              {String(stats.uniqueMotoboys).padStart(2, '0')}
            </div>
          </div>
        </div>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xl font-extrabold text-gray-900">
              Lançamentos do Período
            </h3>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 shadow-sm transition-all"
                />
              </div>

              <div className="flex bg-gray-100 p-1 rounded-xl max-w-xs w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab("todos")}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    activeTab === "todos"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  Todos os Lançamentos
                </button>
                <button
                  onClick={() => setActiveTab("colaboradores")}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    activeTab === "colaboradores"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  )}
                >
                  Por Colaborador
                </button>
              </div>

              {canEdit && (
                <Button
                  onClick={() => {
                    setSelectedLancamento(null);
                    setIsLancamentoFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 h-9 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 text-xs py-1.5 px-4"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Novo Lançamento
                </Button>
              )}
            </div>
          </div>

          {isLancamentosLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          ) : activeTab === "colaboradores" ? (
            groupedLancamentos.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-300" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">
                  Nenhum lançamento no período
                </h4>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                  Não há registros para este convênio no mês selecionado.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedLancamentos.map((group) => {
                  const isExpanded = !!expandedGroups[group.name];
                  return (
                    <Card
                      key={group.name}
                      className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden"
                    >
                      <div
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                        onClick={() => toggleGroup(group.name)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            {group.isFrota ? (
                              <Wrench className="h-5 w-5" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-base font-bold text-gray-900">
                              {group.name}
                            </h4>
                            <p className="text-xs text-gray-500 font-medium">
                              {group.items.length} {group.items.length === 1 ? "lançamento" : "lançamentos"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-blue-600">
                            {formatCurrency(group.total)}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-gray-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/20 px-5 py-4">
                          <div className="overflow-x-auto">
                            <table className="w-full table-fixed text-left">
                              <thead>
                                <tr className="text-left border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                  <th className="pb-3 pl-2 w-[100px]">Data</th>
                                  {group.isFrota && <th className="pb-3 pl-2 w-[180px]">Colaborador</th>}
                                  <th className="pb-3 w-[110px]">Valor</th>
                                  <th className="pb-3 pr-2">Descrição</th>
                                  {canEdit && <th className="pb-3 text-right pr-2 w-[90px]">Ações</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100/65">
                                {group.items.map((l) => (
                                  <tr key={l.id} className="text-sm text-gray-700 hover:bg-gray-50/30 transition-colors">
                                    <td className="py-3.5 pl-2 font-medium text-gray-500 whitespace-nowrap">
                                      {formatLocalDate(l.data_lancamento)}
                                    </td>
                                    {group.isFrota && (
                                      <td className="py-3.5 pl-2 font-bold text-gray-900 whitespace-nowrap text-left">
                                        {l.colaborador?.nome_completo || "Desconhecido"}
                                      </td>
                                    )}
                                    <td className="py-3.5 font-bold text-gray-900 whitespace-nowrap">
                                      {formatCurrency(Number(l.valor))}
                                    </td>
                                    <td className="py-3.5 pr-2 text-gray-600 font-medium break-words whitespace-normal text-left">
                                      {l.descricao || <span className="text-gray-300">—</span>}
                                    </td>
                                    {canEdit && (
                                      <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                                        <div className="flex justify-end gap-1.5">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => {
                                              setSelectedLancamento(l);
                                              setIsLancamentoFormOpen(true);
                                            }}
                                          >
                                            <Edit2 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleDeleteLancamento(l)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )
          ) : filteredLancamentos.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-800">
                Nenhum lançamento no período
              </h4>
              <p className="text-gray-400 mt-2 max-w-xs mx-auto text-sm">
                Não há registros para este convênio no mês selecionado.
              </p>
            </div>
          ) : (
            <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden p-5">
              <div className="overflow-x-auto">
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="text-left border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <th className="pb-3 pl-2 w-[100px]">Data</th>
                      <th className="pb-3 w-[180px]">Colaborador</th>
                      <th className="pb-3 w-[110px]">Valor</th>
                      <th className="pb-3 pr-2">Descrição</th>
                      {canEdit && <th className="pb-3 text-right pr-2 w-[90px]">Ações</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/65">
                    {filteredLancamentos.map((l) => (
                      <tr key={l.id} className="text-sm text-gray-700 hover:bg-gray-50/30 transition-colors">
                        <td className="py-3.5 pl-2 font-medium text-gray-500 whitespace-nowrap">
                          {formatLocalDate(l.data_lancamento)}
                        </td>
                        <td className="py-3.5 font-bold text-gray-900 whitespace-nowrap text-left">
                          <div className="flex flex-col gap-0.5">
                            <span>{l.colaborador?.nome_completo || "Desconhecido"}</span>
                            {l.moto_embu && (
                              <span className="text-[9px] text-sky-700 font-bold uppercase tracking-wider">
                                Veículo Embu Express
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 font-black text-blue-600 whitespace-nowrap">
                          {formatCurrency(Number(l.valor))}
                        </td>
                        <td className="py-3.5 pr-2 text-gray-600 font-medium break-words whitespace-normal text-left">
                          {l.descricao || <span className="text-gray-300">—</span>}
                        </td>
                        {canEdit && (
                          <td className="py-3.5 pr-2 text-right whitespace-nowrap">
                            <div className="flex justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                onClick={() => {
                                  setSelectedLancamento(l);
                                  setIsLancamentoFormOpen(true);
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteLancamento(l)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </section>
      </div>

      <LancamentoForm
        open={isLancamentoFormOpen}
        onOpenChange={setIsLancamentoFormOpen}
        convenioId={id}
        lancamentoToEdit={selectedLancamento}
      />
    </div>
  );
}
