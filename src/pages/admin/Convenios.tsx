import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { ListSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useConvenios,
  useDeleteConvenio,
  useUpdateConvenio,
} from "@/hooks/api/useConvenios";
import { useResumoGeralConvenios } from "@/hooks/api/useConvenioAuditoria";
import { Convenio, ConvenioResumoItem } from "@/types/database";
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
  Calendar,
  Receipt,
  Users,
  ShieldCheck,
  AlertCircle,
  FileText,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, lazy, Suspense } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTodosBloqueiosConvenios } from "@/hooks/api/useBloqueiosConvenios";

const ConveniosRelatoriosTab = lazy(() => import("@/components/features/convenios/ConveniosRelatoriosTab"));
const ConveniosBloqueadosTab = lazy(() => import("@/components/features/convenios/ConveniosBloqueadosTab"));

const MESES = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);
};

const ConvenioMobileItem = ({
  convenio,
  resumoItem,
  actions,
}: {
  convenio: Convenio;
  resumoItem?: ConvenioResumoItem;
  actions: ActionItem[];
}) => {
  const navigate = useNavigate();
  const total = resumoItem?.total_consumido || 0;
  const motoboys = resumoItem?.total_motoboys || 0;
  const david = resumoItem?.total_moto_embu_david || 0;
  const fatura = resumoItem?.fatura_fornecedor;

  return (
    <div
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform relative cursor-pointer text-left space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-sm line-clamp-2 break-words leading-tight">
            {convenio.nome}
          </p>
          <span className="text-[11px] text-gray-400 font-medium">
            {resumoItem?.quantidade_lancamentos || 0} lançamentos no mês
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          <StatusBadge status={convenio.ativo} />
          <ActionsDropdown actions={actions} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-xs">
        <div>
          <span className="text-gray-400 text-[11px] block">Total Consumido:</span>
          <span className="font-bold text-gray-900">{formatarMoeda(total)}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">Motoboys:</span>
          <span className="font-bold text-blue-600">{formatarMoeda(motoboys)}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">Moto Embu:</span>
          <span className="font-bold text-amber-700">{formatarMoeda(david)}</span>
        </div>
        <div>
          <span className="text-gray-400 text-[11px] block">Fatura Dia 15:</span>
          {fatura ? (
            <span className={cn(
              "font-bold text-[11px] px-1.5 py-0.5 rounded-md",
              fatura.status === "PAGA" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            )}>
              {formatarMoeda(fatura.valor_total_fatura)}
            </span>
          ) : (
            <span className="text-gray-400 font-medium">Sem fatura</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ConvenioTableRow = ({
  convenio,
  resumoItem,
  actions,
}: {
  convenio: Convenio;
  resumoItem?: ConvenioResumoItem;
  actions: ActionItem[];
}) => {
  const navigate = useNavigate();
  const total = resumoItem?.total_consumido || 0;
  const motoboys = resumoItem?.total_motoboys || 0;
  const david = resumoItem?.total_moto_embu_david || 0;
  const fatura = resumoItem?.fatura_fornecedor;

  return (
    <tr
      onClick={() => navigate(`/convenios/${convenio.id}`)}
      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
    >
      <td className="py-4 pl-6 align-middle">
        <p className="font-bold text-gray-900 text-sm">{convenio.nome}</p>
        <span className="text-xs text-gray-400">
          {resumoItem?.quantidade_lancamentos || 0} lançamentos
        </span>
      </td>
      <td className="px-6 py-4 align-middle">
        <StatusBadge status={convenio.ativo} />
      </td>
      <td className="px-6 py-4 align-middle font-bold text-gray-900 text-sm">
        {formatarMoeda(total)}
      </td>
      <td className="px-6 py-4 align-middle font-semibold text-blue-600 text-sm">
        {formatarMoeda(motoboys)}
      </td>
      <td className="px-6 py-4 align-middle font-semibold text-amber-700 text-sm">
        {formatarMoeda(david)}
      </td>
      <td className="px-6 py-4 align-middle">
        {fatura ? (
          <div className="flex flex-col gap-0.5">
            <span className={cn(
              "inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-lg w-max",
              fatura.status === "PAGA" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}>
              <FileText className="h-3 w-3" />
              {formatarMoeda(fatura.valor_total_fatura)}
            </span>
            <span className="text-[10px] text-gray-400">
              {fatura.status === "PAGA" ? "Quitado" : "Pendente"}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Não lançada</span>
        )}
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
  const [mes, setMes] = useState<number>(() => new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(() => new Date().getFullYear());

  const { data: convenios = [], isLoading, refetch } = useConvenios();
  const { data: resumoGeral, isLoading: isResumoLoading, refetch: refetchResumo } = useResumoGeralConvenios(mes, ano);
  const { data: todosBloqueios = [], refetch: refetchBloqueios } = useTodosBloqueiosConvenios();

  const totalColaboradoresBloqueados = useMemo(
    () => new Set(todosBloqueios.map((b) => b.colaborador_id)).size,
    [todosBloqueios]
  );

  const deleteConvenio = useDeleteConvenio();
  const updateConvenio = useUpdateConvenio();

  useEffect(() => {
    setPageTitle("Convênios & Despesas Operacionais");
  }, [setPageTitle]);

  const pullToRefreshReload = useCallback(async () => {
    await Promise.all([refetch(), refetchResumo(), refetchBloqueios()]);
  }, [refetch, refetchResumo, refetchBloqueios]);

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
      description: `Tem certeza que deseja ${nextStatus ? "ativar" : "desativar"} o convênio "${convenio.nome}"?`,
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

  const resumoMap = useMemo(() => {
    const map = new Map<string, ConvenioResumoItem>();
    (resumoGeral?.convenios || []).forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [resumoGeral]);

  const filteredConvenios = convenios.filter((c) =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totais = resumoGeral?.totais;
  const isActionLoading = deleteConvenio.isPending || updateConvenio.isPending;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div className="space-y-6">
          <Tabs defaultValue="parceiros" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <TabsList className="bg-gray-100/80 p-1 rounded-2xl h-12 w-full sm:w-auto grid grid-cols-3 sm:flex gap-1">
                <TabsTrigger
                  value="parceiros"
                  className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Handshake className="h-4 w-4" />
                  <span>Parceiros</span>
                </TabsTrigger>
                <TabsTrigger
                  value="relatorios"
                  className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Relatórios</span>
                </TabsTrigger>
                <TabsTrigger
                  value="bloqueados"
                  className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Bloqueados</span>
                  {totalColaboradoresBloqueados > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                      {totalColaboradoresBloqueados}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                  <Calendar className="h-4 w-4 text-blue-600 ml-2" />
                  <Select value={String(mes)} onValueChange={(val) => setMes(Number(val))}>
                    <SelectTrigger className="border-none shadow-none font-bold text-sm w-36 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {MESES.map((m) => (
                        <SelectItem key={m.value} value={String(m.value)}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(ano)} onValueChange={(val) => setAno(Number(val))}>
                    <SelectTrigger className="border-none shadow-none font-bold text-sm w-24 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {[2024, 2025, 2026, 2027].map((a) => (
                        <SelectItem key={a} value={String(a)}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {canEdit && (
                  <Button
                    onClick={handleRegister}
                    className="bg-blue-600 hover:bg-blue-700 h-11 rounded-xl gap-2 shadow-sm font-bold text-white transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Novo Convênio</span>
                  </Button>
                )}
              </div>
            </div>

            <TabsContent value="parceiros" className="space-y-6 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Consumido */}
            <Card className="rounded-2xl border-gray-100 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Consumido no Mês</CardTitle>
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Receipt className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-gray-900 tracking-tight">
                  {formatarMoeda(totais?.total_geral_consumido || 0)}
                </div>
                <p className="text-xs text-gray-500 mt-1">Soma de postos e oficinas parceiras</p>
              </CardContent>
            </Card>

            {/* Total Motoboys */}
            <Card className="rounded-2xl border-blue-100 bg-blue-50/20 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-blue-800 uppercase tracking-wider">Descontado dos Motoboys</CardTitle>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-blue-600 tracking-tight">
                  {formatarMoeda(totais?.total_motoboys || 0)}
                </div>
                <p className="text-xs text-blue-700/80 mt-1">Deduções aplicadas nos holerites</p>
              </CardContent>
            </Card>

            {/* Moto Embu */}
            <Card className="rounded-2xl border-amber-100 bg-amber-50/20 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-amber-800 uppercase tracking-wider">Moto Embu</CardTitle>
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-amber-700 tracking-tight">
                  {formatarMoeda(totais?.total_moto_embu_david || 0)}
                </div>
                <p className="text-xs text-amber-800/80 mt-1">Custos assumidos pela empresa</p>
              </CardContent>
            </Card>

            {/* Faturas Fornecedores (Dia 15) */}
            <Card className="rounded-2xl border-emerald-100 bg-emerald-50/20 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Faturas / Cobranças (Dia 15)</CardTitle>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <FileText className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-700 tracking-tight">
                  {formatarMoeda(totais?.total_faturas_fornecedores || 0)}
                </div>
                <p className="text-xs text-emerald-800/80 mt-1">Faturas conciliadas com parceiros</p>
              </CardContent>
            </Card>
          </div>

          {/* Campo de Busca */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar convênio pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm sm:text-base bg-white border-gray-200 focus-visible:ring-primary/20 h-11 rounded-xl shadow-none font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabela e Listagem de Convênios */}
          {isLoading || isResumoLoading ? (
            <ListSkeleton />
          ) : filteredConvenios.length > 0 ? (
            <ResponsiveDataList
              data={filteredConvenios}
              mobileContainerClassName="space-y-3"
              mobileItemRenderer={(convenio) => (
                <ConvenioMobileItem
                  key={convenio.id}
                  convenio={convenio}
                  resumoItem={resumoMap.get(convenio.id)}
                  actions={getConvenioActions(convenio)}
                />
              )}
            >
              <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white shadow-sm">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr className="border-b border-gray-100 text-left">
                      <th className="py-4 pl-6 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Convênio
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Total do Mês
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Motoboys
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Moto Embu
                      </th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Fatura Dia 15
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
                        resumoItem={resumoMap.get(convenio.id)}
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
            </TabsContent>

            <TabsContent value="relatorios" className="mt-0">
              <Suspense fallback={<ListSkeleton />}>
                <ConveniosRelatoriosTab mes={mes} ano={ano} />
              </Suspense>
            </TabsContent>

            <TabsContent value="bloqueados" className="mt-0">
              <Suspense fallback={<ListSkeleton />}>
                <ConveniosBloqueadosTab />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isActionLoading} text="Processando..." />
    </>
  );
}

export default Convenios;
