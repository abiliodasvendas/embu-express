import { PERMISSIONS } from "@/constants/permissions.enum";
import { useLayout } from "@/contexts/LayoutContext";
import {
  ANIVERSARIANTES_QUERY_KEY,
  useAniversariantes,
} from "@/hooks/api/useAniversariantes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { Usuario } from "@/types/database";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";

export const MESES_ANO = [
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
] as const;

export function useAniversariantesViewModel() {
  const { setPageTitle, openCollaboratorFormDialog } = useLayout();
  const { can, isSuperAdmin } = usePermissions();
  const queryClient = useQueryClient();

  const mesAtualInicial = useMemo(() => new Date().getMonth() + 1, []);
  const [mesSelecionado, setMesSelecionado] = useState<number>(mesAtualInicial);
  const [termoBusca, setTermoBusca] = useState<string>("");

  const canEditCollaborator = isSuperAdmin || can(PERMISSIONS.USUARIOS.EDITAR);

  const { data, isLoading, isFetching, isError, refetch } =
    useAniversariantes(mesSelecionado);

  useEffect(() => {
    setPageTitle("Aniversariantes");
  }, [setPageTitle]);

  const mesAtual = data?.mes_atual ?? mesAtualInicial;
  const diaAtual = data?.dia_atual ?? new Date().getDate();
  const isMesAtual = mesSelecionado === mesAtual;

  const nomeMesSelecionado = useMemo(() => {
    return (
      MESES_ANO.find((m) => m.value === mesSelecionado)?.label ?? "Mês atual"
    );
  }, [mesSelecionado]);

  const termoNormalizado = useMemo(
    () => termoBusca.trim().toLowerCase(),
    [termoBusca]
  );

  const aniversariantesMesFiltrados = useMemo(() => {
    const lista = data?.aniversariantes_mes ?? [];
    if (!termoNormalizado) return lista;
    return lista.filter((item) =>
      item.nome_completo.toLowerCase().includes(termoNormalizado)
    );
  }, [data?.aniversariantes_mes, termoNormalizado]);

  const { aniversariantesProximos, aniversariantesPassados } = useMemo(() => {
    if (!isMesAtual) {
      return {
        aniversariantesProximos: aniversariantesMesFiltrados,
        aniversariantesPassados: [],
      };
    }

    return {
      aniversariantesProximos: aniversariantesMesFiltrados.filter(
        (item) => item.dia >= diaAtual
      ),
      aniversariantesPassados: aniversariantesMesFiltrados.filter(
        (item) => item.dia < diaAtual
      ),
    };
  }, [aniversariantesMesFiltrados, isMesAtual, diaAtual]);

  const semDataFiltrados = useMemo(() => {
    const lista = data?.sem_data_nascimento ?? [];
    if (!termoNormalizado) return lista;
    return lista.filter((item) =>
      item.nome_completo.toLowerCase().includes(termoNormalizado)
    );
  }, [data?.sem_data_nascimento, termoNormalizado]);

  const handleMesAnterior = useCallback(() => {
    setMesSelecionado((prev) => (prev === 1 ? 12 : prev - 1));
  }, []);

  const handleProximoMes = useCallback(() => {
    setMesSelecionado((prev) => (prev === 12 ? 1 : prev + 1));
  }, []);

  const handleVoltarMesAtual = useCallback(() => {
    setMesSelecionado(mesAtual);
  }, [mesAtual]);

  const handleEditarSemData = useCallback(
    (colaborador: Usuario) => {
      if (!canEditCollaborator) return;
      openCollaboratorFormDialog({
        mode: "edit",
        editingCollaborator: colaborador,
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ANIVERSARIANTES_QUERY_KEY,
          });
        },
      });
    },
    [canEditCollaborator, openCollaboratorFormDialog, queryClient]
  );

  return {
    mesSelecionado,
    setMesSelecionado,
    mesAtual,
    nomeMesSelecionado,
    termoBusca,
    setTermoBusca,
    hoje: data?.hoje ?? [],
    aniversariantesMes: aniversariantesMesFiltrados,
    aniversariantesProximos,
    aniversariantesPassados,
    isMesAtual,
    semDataNascimento: semDataFiltrados,
    resumo: data?.resumo ?? {
      total_hoje: 0,
      total_mes: 0,
      total_sem_data: 0,
    },
    isLoading,
    isFetching,
    isError,
    refetch,
    canEditCollaborator,
    handleMesAnterior,
    handleProximoMes,
    handleVoltarMesAtual,
    handleEditarSemData,
  };
}
