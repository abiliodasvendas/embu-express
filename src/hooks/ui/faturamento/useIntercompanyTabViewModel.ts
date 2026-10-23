import { useState, useMemo } from "react";
import { useLayout } from "@/hooks";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { useIntercompany } from "@/hooks/api/useIntercompany";
import { useTableSort } from "@/hooks/ui/useTableSort";
import { TransferenciaIntercompany } from "@/types/database";

interface UseIntercompanyTabViewModelProps {
  enabled?: boolean;
}

export function useIntercompanyTabViewModel({
  enabled = true,
}: UseIntercompanyTabViewModelProps = {}) {
  const { openAcertoIntercompanyDialog } = useLayout();
  const { can, isSuperAdmin } = usePermissions();
  const canEdit = isSuperAdmin || can(PERMISSIONS.FATURAMENTO.EDITAR) || can(PERMISSIONS.DESPESAS.EDITAR);
  const [searchIntercompany, setSearchIntercompany] = useState<string>("");

  const {
    transferencias,
    matrizSaldos,
    isLoadingTransferencias,
    isFetchingTransferencias: isFetchingIntercompany,
    isLoadingMatriz,
    refetch: refetchIntercompany,
  } = useIntercompany(undefined, { enabled });

  const transferenciasFiltradas = useMemo(() => {
    if (!searchIntercompany.trim()) return transferencias;
    const term = searchIntercompany.toLowerCase().trim();
    return transferencias.filter((t) => {
      const dev = (t.empresa_devedora?.nome_fantasia || "").toLowerCase();
      const cred = (t.empresa_credora?.nome_fantasia || "").toLowerCase();
      const obs = (t.observacao || "").toLowerCase();
      return dev.includes(term) || cred.includes(term) || obs.includes(term);
    });
  }, [transferencias, searchIntercompany]);

  const {
    sortedData: transferenciasOrdenadas,
    sortKey: sortKeyIntercompany,
    sortDirection: sortDirIntercompany,
    handleSort: handleSortIntercompany,
  } = useTableSort(transferenciasFiltradas, {
    defaultKey: "data_fato_gerador",
    defaultDirection: "desc",
    customExtractors: {
      data_fato_gerador: (t) => t.data_fato_gerador || "",
      empresa_devedora: (t) => t.empresa_devedora?.nome_fantasia || "",
      empresa_credora: (t) => t.empresa_credora?.nome_fantasia || "",
      valor: (t) => Number(t.valor || 0),
      status: (t) => t.status || "",
    },
  });

  const handleOpenAcerto = (transferencia: TransferenciaIntercompany) => {
    openAcertoIntercompanyDialog({
      transferencia,
      onSuccess: async () => {
        await refetchIntercompany();
      },
    });
  };

  return {
    canEdit,
    transferencias,
    matrizSaldos,
    isLoadingMatriz,
    isLoadingTransferencias,
    isFetchingIntercompany,
    searchIntercompany,
    setSearchIntercompany,
    transferenciasOrdenadas,
    sortKeyIntercompany,
    sortDirIntercompany,
    handleSortIntercompany,
    handleOpenAcerto,
    refetchIntercompany,
  };
}
