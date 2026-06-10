import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  usePublicConvenio,
  usePublicLancamentosMes,
  useDeletePublicLancamento,
} from "@/hooks/api/useConvenios";
import { LancamentoConvenio } from "@/types/database";
import {
  Wrench,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  Users,
  Search,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { LancamentoForm } from "@/components/features/convenios/public/LancamentoForm";
import { cn } from "@/lib/utils";

interface GroupedLancamento {
  name: string;
  isFrota: boolean;
  total: number;
  items: LancamentoConvenio[];
}

export function ConvenioPublicPortal() {
  const { token } = useParams<{ token: string }>();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoConvenio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LancamentoConvenio | null>(null);
  const [activeTab, setActiveTab] = useState<"colaboradores" | "recentes">("recentes");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const mes = currentDate.getMonth() + 1;
  const ano = currentDate.getFullYear();

  const {
    data: convenio,
    isLoading: isLoadingConvenio,
    isError: isConvenioError,
  } = usePublicConvenio(token || "");

  const { data: lancamentos = [], isLoading: isLoadingLancamentos } =
    usePublicLancamentosMes(token || "", ano, mes);

  const deleteLancamentoMutation = useDeletePublicLancamento();

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
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

  const handleNewLancamento = () => {
    setSelectedLancamento(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lancamento: LancamentoConvenio) => {
    setSelectedLancamento(lancamento);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (lancamento: LancamentoConvenio) => {
    setDeleteTarget(lancamento);
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !token) return;
    try {
      await deleteLancamentoMutation.mutateAsync({
        token,
        id: deleteTarget.id,
      });
      toast.success("Lançamento excluído com sucesso!");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error("Erro ao excluir lançamento", {
        description: error.message,
      });
    }
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

  const totalValue = lancamentos.reduce((acc, curr) => acc + Number(curr.valor), 0);

  if (isLoadingConvenio) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-gray-500">
            Carregando portal do convênio...
          </p>
        </div>
      </div>
    );
  }

  if (isConvenioError || !convenio) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden bg-white text-center p-8">
          <div className="mx-auto bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Acesso Indisponível
          </h1>
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            O link de convênio utilizado é inválido, expirou ou foi desativado pelo administrador. Verifique as credenciais ou solicite um novo link.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col pb-24">
      <header className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pt-8 pb-16 px-6 relative overflow-hidden shrink-0 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]" />
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl" />

        <div className="max-w-md mx-auto relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
              <Wrench className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300/80">
                Portal do Conveniado
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white line-clamp-1">
                {convenio.nome}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 -mt-10 max-w-md w-full mx-auto relative z-20 space-y-6">
        {!convenio.ativo && (
          <Card className="border border-amber-200 bg-amber-50 rounded-3xl overflow-hidden shadow-sm shadow-amber-50">
            <CardContent className="p-4 flex items-start gap-3 text-left">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-800">Visualização de Histórico</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Este convênio está desativado pelo administrador. Novas ações de registro, edição ou exclusão estão indisponíveis, mas você pode consultar o histórico de lançamentos.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-3xl overflow-hidden">
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
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                Período de Referência
              </span>
              <span className="text-base font-extrabold text-gray-800">
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

        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-xl shadow-slate-100 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-center min-h-[96px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-100">
                Total do Mês
              </span>
              <span className="text-xl font-black mt-1">
                {formatCurrency(totalValue)}
              </span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-100 bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 flex flex-col justify-center min-h-[96px]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Lançamentos
              </span>
              <span className="text-xl font-black text-gray-800 mt-1">
                {lancamentos.length}
              </span>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded-2xl w-full">
            <button
              onClick={() => setActiveTab("recentes")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                activeTab === "recentes"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              Todos os Lançamentos
            </button>
            <button
              onClick={() => setActiveTab("colaboradores")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                activeTab === "colaboradores"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              )}
            >
              Por Colaborador
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm transition-all"
            />
          </div>

          {isLoadingLancamentos ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-white animate-pulse rounded-3xl border border-gray-100" />
              ))}
            </div>
          ) : activeTab === "colaboradores" ? (
            groupedLancamentos.length > 0 ? (
              <div className="space-y-3">
                {groupedLancamentos.map((group) => {
                  const isExpanded = !!expandedGroups[group.name];
                  return (
                    <Card
                      key={group.name}
                      className="border border-gray-100 shadow-sm bg-white rounded-3xl overflow-hidden"
                    >
                      <div
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                        onClick={() => toggleGroup(group.name)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
                            {group.isFrota ? (
                              <Wrench className="h-5 w-5" />
                            ) : (
                              <Users className="h-5 w-5" />
                            )}
                          </div>
                          <div className="text-left">
                            <h4 className="text-sm font-extrabold text-gray-900 break-words">
                              {group.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              {group.items.length} {group.items.length === 1 ? "lançamento" : "lançamentos"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-blue-600">
                            {formatCurrency(group.total)}
                          </span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-gray-400 transition-transform duration-200",
                              isExpanded && "rotate-180"
                            )}
                          />
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50/10 divide-y divide-gray-200 px-4 py-2">
                          {group.items.map((l) => (
                            <div key={l.id} className="py-4 last:pb-2 first:pt-2 space-y-2 text-left">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                  {formatLocalDate(l.data_lancamento)}
                                </span>
                                <span className="font-bold text-sm text-gray-800">
                                  {formatCurrency(Number(l.valor))}
                                </span>
                              </div>

                              {group.isFrota && l.colaborador?.nome_completo && (
                                <div className="text-xs font-bold text-gray-600">
                                  {l.colaborador.nome_completo}
                                </div>
                              )}

                              {l.descricao && (
                                <p className="text-xs text-gray-450 font-medium leading-relaxed bg-gray-50/50 px-2.5 py-1.5 rounded-xl border border-gray-100/20 text-left">
                                  {l.descricao}
                                </p>
                              )}

                              {convenio.ativo && (
                                <div className="flex justify-end items-center gap-1.5 pt-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(l)}
                                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50/60"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteClick(l)}
                                    className="h-8 w-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50/60"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white text-center py-10 px-6">
                <div className="mx-auto bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-700">Nenhum lançamento</h3>
                <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                  Você não realizou nenhum lançamento de manutenção neste mês de referência.
                </p>
              </Card>
            )
          ) : filteredLancamentos.length > 0 ? (
            <div className="space-y-3">
              {filteredLancamentos.map((lancamento) => (
                <Card
                  key={lancamento.id}
                  className="border border-gray-100 shadow-sm shadow-slate-50/50 hover:shadow-md transition-all rounded-3xl overflow-hidden bg-white"
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {formatLocalDate(lancamento.data_lancamento)}
                        </span>
                        <h3 className="font-extrabold text-gray-800 text-base leading-snug text-left flex flex-col gap-1">
                          <span>
                            {lancamento.colaborador?.nome_completo || "Colaborador não cadastrado"}
                          </span>
                          {lancamento.moto_embu && (
                            <div className="flex">
                              <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border-sky-200 rounded-full font-bold shadow-none px-2 py-0.5 text-[9px] uppercase tracking-wider">
                                Veículo Embu Express
                              </Badge>
                            </div>
                          )}
                        </h3>
                      </div>
                      <span className="font-black text-blue-600 text-lg">
                        {formatCurrency(Number(lancamento.valor))}
                      </span>
                    </div>

                    {lancamento.descricao && (
                      <p className="text-xs text-gray-500 font-medium leading-relaxed bg-slate-50/80 px-3 py-2 rounded-xl border border-slate-100/50 text-left">
                        {lancamento.descricao}
                      </p>
                    )}

                    {convenio.ativo && (
                      <div className="flex justify-between items-center pt-1 mt-1 border-t border-gray-50">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(lancamento)}
                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(lancamento)}
                            className="h-8 w-8 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white text-center py-10 px-6">
              <div className="mx-auto bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-700">Nenhum lançamento</h3>
              <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
                Você não realizou nenhum lançamento de manutenção neste mês de referência.
              </p>
            </Card>
          )}
        </div>
      </main>

      {convenio.ativo && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-40">
          <Button
            onClick={handleNewLancamento}
            className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            Registrar Manutenção
          </Button>
        </div>
      )}

      <LancamentoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        token={token || ""}
        lancamentoToEdit={selectedLancamento}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(val) => !val && setDeleteTarget(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-5 bg-white border-none shadow-2xl">
          <div className="text-center space-y-3">
            <div className="mx-auto bg-red-50 w-12 h-12 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-800">
              Excluir Registro?
            </DialogTitle>
            <p className="text-xs text-gray-500 leading-relaxed">
              Deseja realmente excluir este lançamento de manutenção de{" "}
              <strong className="text-gray-700">
                {deleteTarget?.moto_embu
                  ? "Moto da Frota"
                  : deleteTarget?.colaborador?.nome_completo}
              </strong>{" "}
              no valor de{" "}
              <strong className="text-blue-600">
                {deleteTarget && formatCurrency(Number(deleteTarget.valor))}
              </strong>
              ?
            </p>
          </div>
          <DialogFooter className="mt-5 grid grid-cols-2 gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="h-10 rounded-xl border-gray-200 text-xs font-semibold text-gray-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteLancamentoMutation.isPending}
              className="h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-lg shadow-red-500/20"
            >
              {deleteLancamentoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Excluir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ConvenioPublicPortal;
