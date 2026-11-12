import { useEffect, useMemo, useState } from "react";
import {
  useCategoriasFinanceirasQuery,
  useCreateCategoriaFinanceira,
  useDeleteCategoriaFinanceira,
  useUpdateCategoriaFinanceira,
} from "@/hooks/api/useCategoriasFinanceiras";
import {
  CategoriaFinanceira,
  EscopoCategoriaFinanceira,
  GrupoDreCategoriaFinanceira,
} from "@/types/database";
import {
  CATEGORIA_MOVIMENTACAO_AVULSA,
  ESCOPO_CATEGORIA_FINANCEIRA,
  GRUPO_DRE_CATEGORIA,
  GRUPO_DRE_LABELS,
} from "@/constants/financeiro.constants";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface UseCategoriasFinanceirasDialogViewModelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  escopoInicial?: EscopoCategoriaFinanceira;
  onCategoryCreated?: (categoria: CategoriaFinanceira) => void;
}

function getDefaultGrupoDre(escopo: EscopoCategoriaFinanceira): GrupoDreCategoriaFinanceira {
  if (escopo === ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA) {
    return GRUPO_DRE_CATEGORIA.RECEITA_OPERACIONAL;
  }
  return GRUPO_DRE_CATEGORIA.DESPESA_FIXA;
}

export function useCategoriasFinanceirasDialogViewModel({
  open,
  onOpenChange,
  escopoInicial,
  onCategoryCreated,
}: UseCategoriasFinanceirasDialogViewModelProps) {
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const { data: todasCategorias = [], isLoading } = useCategoriasFinanceirasQuery();
  const createMutation = useCreateCategoriaFinanceira();
  const updateMutation = useUpdateCategoriaFinanceira();
  const deleteMutation = useDeleteCategoriaFinanceira();

  const [escopoAtivo, setEscopoAtivo] = useState<EscopoCategoriaFinanceira>(
    escopoInicial || ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA
  );
  const [novoNome, setNovoNome] = useState("");
  const [novoGrupoDre, setNovoGrupoDre] = useState<GrupoDreCategoriaFinanceira>(
    getDefaultGrupoDre(escopoInicial || ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA)
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState("");
  const [editingGrupoDre, setEditingGrupoDre] = useState<GrupoDreCategoriaFinanceira>(
    GRUPO_DRE_CATEGORIA.DESPESA_FIXA
  );

  useEffect(() => {
    if (open) {
      const escopo = escopoInicial || ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA;
      setEscopoAtivo(escopo);
      setNovoGrupoDre(getDefaultGrupoDre(escopo));
      setNovoNome("");
      setEditingId(null);
    }
  }, [open, escopoInicial]);

  const handleSelectEscopo = (escopo: EscopoCategoriaFinanceira) => {
    setEscopoAtivo(escopo);
    setNovoGrupoDre(getDefaultGrupoDre(escopo));
    setEditingId(null);
  };

  const opcoesGrupoDre = useMemo(() => {
    if (escopoAtivo === ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA) {
      return [
        { value: GRUPO_DRE_CATEGORIA.RECEITA_OPERACIONAL, label: GRUPO_DRE_LABELS.RECEITA_OPERACIONAL },
        { value: GRUPO_DRE_CATEGORIA.NAO_AFETA_DRE, label: GRUPO_DRE_LABELS.NAO_AFETA_DRE },
      ];
    }
    if (escopoAtivo === ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA) {
      return [
        { value: GRUPO_DRE_CATEGORIA.DESPESA_FIXA, label: GRUPO_DRE_LABELS.DESPESA_FIXA },
        { value: GRUPO_DRE_CATEGORIA.DESPESA_FINANCEIRA, label: GRUPO_DRE_LABELS.DESPESA_FINANCEIRA },
        { value: GRUPO_DRE_CATEGORIA.NAO_AFETA_DRE, label: GRUPO_DRE_LABELS.NAO_AFETA_DRE },
      ];
    }
    return [
      { value: GRUPO_DRE_CATEGORIA.DESPESA_FIXA, label: GRUPO_DRE_LABELS.DESPESA_FIXA },
      { value: GRUPO_DRE_CATEGORIA.TRIBUTO_DAS, label: GRUPO_DRE_LABELS.TRIBUTO_DAS },
      { value: GRUPO_DRE_CATEGORIA.PROLABORE, label: GRUPO_DRE_LABELS.PROLABORE },
      { value: GRUPO_DRE_CATEGORIA.PARCELAMENTO_FISCAL, label: GRUPO_DRE_LABELS.PARCELAMENTO_FISCAL },
      { value: GRUPO_DRE_CATEGORIA.INVESTIMENTO_FINANCIAMENTO, label: GRUPO_DRE_LABELS.INVESTIMENTO_FINANCIAMENTO },
      { value: GRUPO_DRE_CATEGORIA.DESPESA_FINANCEIRA, label: GRUPO_DRE_LABELS.DESPESA_FINANCEIRA },
      { value: GRUPO_DRE_CATEGORIA.NAO_AFETA_DRE, label: GRUPO_DRE_LABELS.NAO_AFETA_DRE },
    ];
  }, [escopoAtivo]);

  const categoriasDoEscopo = useMemo(
    () =>
      todasCategorias.filter(
        (c) =>
          c.escopo === escopoAtivo &&
          c.codigo !== CATEGORIA_MOVIMENTACAO_AVULSA.TRANSFERENCIA_ENTRE_CONTAS
      ),
    [todasCategorias, escopoAtivo]
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    const criada = await createMutation.mutateAsync({
      nome: novoNome.trim(),
      escopo: escopoAtivo,
      grupo_dre: novoGrupoDre,
    });
    setNovoNome("");
    onCategoryCreated?.(criada);
  };

  const handleStartEdit = (cat: CategoriaFinanceira) => {
    setEditingId(cat.id);
    setEditingNome(cat.nome);
    setEditingGrupoDre(cat.grupo_dre);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingNome.trim()) return;
    await updateMutation.mutateAsync({
      id,
      data: {
        nome: editingNome.trim(),
        grupo_dre: editingGrupoDre,
      },
    });
    setEditingId(null);
  };

  const handleToggleAtivo = async (cat: CategoriaFinanceira) => {
    await updateMutation.mutateAsync({
      id: cat.id,
      data: { ativo: !cat.ativo },
    });
  };

  const handleDelete = (cat: CategoriaFinanceira) => {
    openConfirmationDialog({
      title: "Excluir Categoria Financeira",
      description: `Tem certeza que deseja excluir permanentemente a categoria "${cat.nome}"?`,
      confirmText: "Sim, excluir",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        await deleteMutation.mutateAsync(cat.id);
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return {
    escopoAtivo,
    handleSelectEscopo,
    novoNome,
    setNovoNome,
    novoGrupoDre,
    setNovoGrupoDre,
    opcoesGrupoDre,
    categoriasDoEscopo,
    isLoading,
    isMutating,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    editingId,
    editingNome,
    setEditingNome,
    editingGrupoDre,
    setEditingGrupoDre,
    handleAdd,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleToggleAtivo,
    handleDelete,
    handleClose,
  };
}
