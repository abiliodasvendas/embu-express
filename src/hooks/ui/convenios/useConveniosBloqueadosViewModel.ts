import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTodosBloqueiosConvenios } from "@/hooks/api/useBloqueiosConvenios";
import { useConvenios } from "@/hooks/api/useConvenios";
import { useLayout } from "@/contexts/LayoutContext";
import type { BloqueioConvenio } from "@/types/database";
import { StatusUsuario } from "@/types/enums";

export interface ColabBloqueioItem {
  colaborador_id: string;
  nome_completo: string;
  cpf?: string;
  bloqueio_geral: boolean;
  convenios_especificos: Array<{ id: string; nome: string }>;
  motivo?: string;
  criado_em: string;
  criado_por_nome?: string;
}

export function useConveniosBloqueadosViewModel() {
  const navigate = useNavigate();
  const { openGerenciarBloqueioConvenioDialog } = useLayout();

  const { data: bloqueios = [], isLoading: isLoadingBloqueios } = useTodosBloqueiosConvenios();
  const { data: convenios = [], isLoading: isLoadingConvenios } = useConvenios();

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroConvenio, setFiltroConvenio] = useState<string>("TODOS");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  const colaboradoresAgrupados = useMemo(() => {
    const map = new Map<string, ColabBloqueioItem>();

    bloqueios.forEach((b: BloqueioConvenio) => {
      if (b.colaborador?.status === StatusUsuario.INATIVO) {
        return;
      }

      const cId = b.colaborador_id;
      const cNome = b.colaborador?.nome_completo || "Colaborador";
      const cCpf = b.colaborador?.cpf;

      if (!map.has(cId)) {
        map.set(cId, {
          colaborador_id: cId,
          nome_completo: cNome,
          cpf: cCpf,
          bloqueio_geral: false,
          convenios_especificos: [],
          motivo: b.motivo || undefined,
          criado_em: b.criado_em,
          criado_por_nome: b.criado_por_usuario?.nome_completo || undefined,
        });
      }

      const item = map.get(cId)!;
      if (b.convenio_id === null) {
        item.bloqueio_geral = true;
      } else if (b.convenio) {
        item.convenios_especificos.push({
          id: b.convenio.id,
          nome: b.convenio.nome,
        });
      }
      if (!item.motivo && b.motivo) {
        item.motivo = b.motivo;
      }
      if (!item.criado_por_nome && b.criado_por_usuario?.nome_completo) {
        item.criado_por_nome = b.criado_por_usuario.nome_completo;
      }
    });

    return Array.from(map.values());
  }, [bloqueios]);

  const filtrados = useMemo(() => {
    return colaboradoresAgrupados.filter((item) => {
      const matchSearch =
        item.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.cpf && item.cpf.includes(searchTerm));

      if (!matchSearch) return false;

      if (filtroConvenio === "TODOS") return true;
      if (filtroConvenio === "GERAL") return item.bloqueio_geral;

      return (
        item.bloqueio_geral ||
        item.convenios_especificos.some((c) => c.id === filtroConvenio)
      );
    });
  }, [colaboradoresAgrupados, searchTerm, filtroConvenio]);

  const total = filtrados.length;
  const totalPages = Math.ceil(total / pageSize) || 1;

  const paginados = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtrados.slice(start, start + pageSize);
  }, [filtrados, page, pageSize]);

  const totalRestricoes = colaboradoresAgrupados.length;
  const totalGeral = useMemo(() => {
    return colaboradoresAgrupados.filter((c) => c.bloqueio_geral).length;
  }, [colaboradoresAgrupados]);
  const totalEspecifico = useMemo(() => {
    return colaboradoresAgrupados.filter(
      (c) => !c.bloqueio_geral && c.convenios_especificos.length > 0,
    ).length;
  }, [colaboradoresAgrupados]);

  const handleAjustar = (colaboradorId: string, colaboradorNome: string) => {
    openGerenciarBloqueioConvenioDialog({
      colaboradorId,
      colaboradorNome,
    });
  };

  const handleNavigateToColaborador = (colaboradorId: string) => {
    navigate(`/colaboradores/${colaboradorId}`);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
  };

  return {
    convenios,
    searchTerm,
    setSearchTerm,
    filtroConvenio,
    setFiltroConvenio,
    page,
    setPage,
    pageSize,
    setPageSize,
    total,
    totalPages,
    paginados,
    filtrados,
    totalRestricoes,
    totalGeral,
    totalEspecifico,
    isLoading: isLoadingBloqueios || isLoadingConvenios,
    handleAjustar,
    handleNavigateToColaborador,
    handleClearSearch,
  };
}
