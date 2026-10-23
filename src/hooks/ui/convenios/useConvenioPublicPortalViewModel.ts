import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  usePublicConvenio,
  usePublicLancamentosMes,
  useDeletePublicLancamento,
  usePublicCollaborators,
} from "@/hooks/api/useConvenios";
import { LancamentoConvenio } from "@/types/database";
import type { GroupedLancamento } from "./useConvenioDetailsViewModel";

export type PortalTab = "colaboradores" | "recentes" | "bloqueados";

const MONTH_NAMES = [
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

export function useConvenioPublicPortalViewModel() {
  const { token } = useParams<{ token: string }>();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLancamento, setSelectedLancamento] = useState<LancamentoConvenio | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LancamentoConvenio | null>(null);
  const [activeTab, setActiveTab] = useState<PortalTab>("recentes");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const mes = currentDate.getMonth() + 1;
  const ano = currentDate.getFullYear();
  const currentMonthName = MONTH_NAMES[currentDate.getMonth()];

  const {
    data: convenio,
    isLoading: isLoadingConvenio,
    isError: isConvenioError,
  } = usePublicConvenio(token || "");

  const {
    data: lancamentos = [],
    isLoading: isLoadingLancamentos,
  } = usePublicLancamentosMes(token || "", ano, mes);

  const {
    data: publicCollabs = [],
    isLoading: isLoadingCollabs,
  } = usePublicCollaborators(token || "");

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
        const name = l.colaborador?.nome_completo || "Colaborador sem nome";
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

  const bloqueados = useMemo(() => {
    return publicCollabs.filter((c) => c.bloqueado);
  }, [publicCollabs]);

  const filteredBloqueados = useMemo(() => {
    if (!searchQuery.trim()) return bloqueados;
    const query = searchQuery.toLowerCase();
    return bloqueados.filter((c) => c.nome_completo.toLowerCase().includes(query));
  }, [bloqueados, searchQuery]);

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
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error("Erro ao excluir lançamento", {
        description: err.message,
      });
    }
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

  const totalValue = useMemo(() => {
    return lancamentos.reduce((acc, curr) => acc + Number(curr.valor), 0);
  }, [lancamentos]);

  return {
    token: token || "",
    currentDate,
    ano,
    mes,
    currentMonthName,
    convenio,
    isLoadingConvenio,
    isConvenioError,
    lancamentos,
    isLoadingLancamentos,
    publicCollabs,
    isLoadingCollabs,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    expandedGroups,
    toggleGroup,
    filteredLancamentos,
    groupedLancamentos,
    bloqueados,
    filteredBloqueados,
    totalValue,
    isFormOpen,
    setIsFormOpen,
    selectedLancamento,
    deleteTarget,
    setDeleteTarget,
    isDeleting: deleteLancamentoMutation.isPending,
    handlePrevMonth,
    handleNextMonth,
    handleNewLancamento,
    handleEdit,
    handleDeleteClick,
    confirmDelete,
    formatCurrency,
    formatLocalDate,
  };
}
