import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import {
  ModoLancamentoAvulso,
  movimentacaoAvulsaFormSchema,
  MovimentacaoAvulsaFormData,
} from "@/schemas/movimentacaoAvulsaSchema";
import {
  CategoriaMovimentacaoAvulsa,
  MovimentacaoAvulsa,
  TipoMovimentacaoAvulsa,
} from "@/types/database";
import {
  CATEGORIA_MOVIMENTACAO_AVULSA,
  CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
  CATEGORIAS_ENTRADA,
  CATEGORIAS_SAIDA,
  ESCOPO_CATEGORIA_FINANCEIRA,
  MODO_LANCAMENTO_AVULSO,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useCategoriasFinanceirasLabelMap } from "@/hooks/business/useCategoriasFinanceirasBusiness";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { toLocalDateString } from "@/utils/formatters/date";
import { mockGenerator } from "@/utils/mocks/generator";
import { CategoriaOpcaoItem } from "@/components/dialogs/movimentacao-avulsa/MovimentacaoAvulsaCampos";

export interface UseMovimentacaoAvulsaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  forcedTipo?: TipoMovimentacaoAvulsa;
  initialMode?: ModoLancamentoAvulso;
  contaBancariaInicialId?: string | null;
  empresaIdInicial?: number | null;
  onSuccess?: () => void | Promise<void>;
}

export function useMovimentacaoAvulsaForm({
  open,
  onOpenChange,
  movimentacaoToEdit,
  forcedTipo,
  initialMode,
  contaBancariaInicialId,
  empresaIdInicial,
  onSuccess,
}: UseMovimentacaoAvulsaFormProps) {
  const { openCategoriasFinanceirasDialog } = useLayout();
  const { createMutation, createTransferenciaMutation, updateMutation } =
    useMovimentacoesAvulsas();
  const {
    categorias,
    categoriasEntrada,
    categoriasSaida,
    getCategoriaLabel,
  } = useCategoriasFinanceirasLabelMap();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });
  const { contas: todasContas = [] } = useContasBancarias();

  const empresaDaContaInicial = useMemo(() => {
    if (!contaBancariaInicialId) return undefined;
    return todasContas.find((c) => c.id === contaBancariaInicialId)?.empresa_id;
  }, [contaBancariaInicialId, todasContas]);

  const defaultEmpresaId =
    empresaIdInicial || empresaDaContaInicial || empresas[0]?.id;
  const hoje = new Date();
  const modoBase: ModoLancamentoAvulso = forcedTipo
    ? forcedTipo
    : initialMode || MODO_LANCAMENTO_AVULSO.ENTRADA;
  const initialTipo: TipoMovimentacaoAvulsa =
    modoBase === MODO_LANCAMENTO_AVULSO.SAIDA ||
    modoBase === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA
      ? TIPO_MOVIMENTACAO_AVULSA.SAIDA
      : TIPO_MOVIMENTACAO_AVULSA.ENTRADA;
  const initialCategoria =
    initialTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
      ? CATEGORIA_MOVIMENTACAO_AVULSA.FRETE_ESPORADICO
      : CATEGORIA_MOVIMENTACAO_AVULSA.DESPESA_OPERACIONAL_AVULSA;

  const form = useForm<MovimentacaoAvulsaFormData>({
    resolver: zodResolver(movimentacaoAvulsaFormSchema),
    defaultValues: {
      modo_lancamento: modoBase,
      tipo_movimentacao: initialTipo,
      empresa_id: empresaIdInicial || defaultEmpresaId || 0,
      conta_bancaria_id: contaBancariaInicialId || "none",
      conta_destino_id: "",
      categoria: initialCategoria,
      descricao: "",
      valor: 0,
      data_movimentacao: toLocalDateString(hoje),
    },
  });

  useEffect(() => {
    if (open) {
      if (movimentacaoToEdit) {
        form.reset({
          modo_lancamento: movimentacaoToEdit.tipo_movimentacao,
          tipo_movimentacao: movimentacaoToEdit.tipo_movimentacao,
          empresa_id: movimentacaoToEdit.empresa_id,
          conta_bancaria_id: movimentacaoToEdit.conta_bancaria_id || "none",
          conta_destino_id: "",
          categoria: movimentacaoToEdit.categoria,
          descricao: movimentacaoToEdit.descricao,
          valor: movimentacaoToEdit.valor,
          data_movimentacao: movimentacaoToEdit.data_movimentacao,
        });
      } else {
        const modoPadrao: ModoLancamentoAvulso = forcedTipo
          ? forcedTipo
          : initialMode || MODO_LANCAMENTO_AVULSO.ENTRADA;
        const tipoPadrao: TipoMovimentacaoAvulsa =
          modoPadrao === MODO_LANCAMENTO_AVULSO.SAIDA ||
          modoPadrao === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA
            ? TIPO_MOVIMENTACAO_AVULSA.SAIDA
            : TIPO_MOVIMENTACAO_AVULSA.ENTRADA;
        const categoriaPadrao =
          tipoPadrao === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
            ? CATEGORIA_MOVIMENTACAO_AVULSA.FRETE_ESPORADICO
            : CATEGORIA_MOVIMENTACAO_AVULSA.DESPESA_OPERACIONAL_AVULSA;

        form.reset({
          modo_lancamento: modoPadrao,
          tipo_movimentacao: tipoPadrao,
          empresa_id: empresaIdInicial || defaultEmpresaId || 0,
          conta_bancaria_id: contaBancariaInicialId || "none",
          conta_destino_id: "",
          categoria: categoriaPadrao,
          descricao: "",
          valor: 0,
          data_movimentacao: toLocalDateString(new Date()),
        });
      }
    }
  }, [
    open,
    movimentacaoToEdit,
    defaultEmpresaId,
    forcedTipo,
    initialMode,
    contaBancariaInicialId,
    empresaIdInicial,
    form,
  ]);

  const modo = form.watch("modo_lancamento");
  const tipo = form.watch("tipo_movimentacao");
  const empresaId = form.watch("empresa_id");
  const contaOrigemId = form.watch("conta_bancaria_id");
  const categoriaAtual = form.watch("categoria");

  const contasAtivas = useMemo(
    () => todasContas.filter((c) => c.ativo !== false),
    [todasContas]
  );

  const contasEmpresa = useMemo(
    () =>
      empresaId
        ? contasAtivas.filter((c) => Number(c.empresa_id) === Number(empresaId))
        : contasAtivas,
    [contasAtivas, empresaId]
  );

  const categoriasOpcoes: CategoriaOpcaoItem[] = useMemo(() => {
    let base: CategoriaOpcaoItem[];
    if (tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA) {
      base =
        categoriasEntrada.length > 0
          ? categoriasEntrada.map((c) => ({
              codigo: c.codigo,
              nome: c.nome,
              afeta_dre: c.afeta_dre,
            }))
          : CATEGORIAS_ENTRADA.map((cod) => ({
              codigo: cod,
              nome: CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[cod] || cod,
              afeta_dre: cod !== CATEGORIA_MOVIMENTACAO_AVULSA.DOACAO_APORTE,
            }));
    } else {
      base =
        categoriasSaida.length > 0
          ? categoriasSaida.map((c) => ({
              codigo: c.codigo,
              nome: c.nome,
              afeta_dre: c.afeta_dre,
            }))
          : CATEGORIAS_SAIDA.map((cod) => ({
              codigo: cod,
              nome: CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[cod] || cod,
              afeta_dre: true,
            }));
    }

    if (
      categoriaAtual &&
      !base.some((c) => c.codigo === categoriaAtual) &&
      categoriaAtual !== CATEGORIA_MOVIMENTACAO_AVULSA.TRANSFERENCIA_ENTRE_CONTAS
    ) {
      const catInativa = categorias.find((c) => c.codigo === categoriaAtual);
      return [
        ...base,
        {
          codigo: categoriaAtual,
          nome: catInativa?.nome || getCategoriaLabel(categoriaAtual),
          afeta_dre: catInativa?.afeta_dre ?? true,
        },
      ];
    }

    return base;
  }, [
    tipo,
    categoriasEntrada,
    categoriasSaida,
    categoriaAtual,
    categorias,
    getCategoriaLabel,
  ]);

  useEffect(() => {
    if (
      modo !== MODO_LANCAMENTO_AVULSO.TRANSFERENCIA &&
      empresaId &&
      contaOrigemId &&
      contaOrigemId !== "none" &&
      contasAtivas.length > 0
    ) {
      const contaSelecionada = contasAtivas.find((c) => c.id === contaOrigemId);
      if (
        contaSelecionada &&
        Number(contaSelecionada.empresa_id) !== Number(empresaId)
      ) {
        form.setValue("conta_bancaria_id", "none");
      }
    }
  }, [modo, empresaId, contaOrigemId, contasAtivas, form]);

  const categoriaSelecionadaAfetaDre = useMemo(() => {
    const found = categoriasOpcoes.find((c) => c.codigo === categoriaAtual);
    return found?.afeta_dre ?? true;
  }, [categoriasOpcoes, categoriaAtual]);

  const handleModoChange = (novoModo: ModoLancamentoAvulso) => {
    form.setValue("modo_lancamento", novoModo);
    if (novoModo === MODO_LANCAMENTO_AVULSO.ENTRADA) {
      form.setValue("tipo_movimentacao", TIPO_MOVIMENTACAO_AVULSA.ENTRADA);
      const primeira = categoriasEntrada[0]?.codigo || CATEGORIAS_ENTRADA[0];
      form.setValue("categoria", primeira);
    } else if (novoModo === MODO_LANCAMENTO_AVULSO.SAIDA) {
      form.setValue("tipo_movimentacao", TIPO_MOVIMENTACAO_AVULSA.SAIDA);
      const primeira = categoriasSaida[0]?.codigo || CATEGORIAS_SAIDA[0];
      form.setValue("categoria", primeira);
    } else {
      form.setValue("tipo_movimentacao", TIPO_MOVIMENTACAO_AVULSA.SAIDA);
    }
  };

  const handleGerenciarCategorias = () => {
    openCategoriasFinanceirasDialog({
      escopoInicial:
        tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
          ? ESCOPO_CATEGORIA_FINANCEIRA.ENTRADA_AVULSA
          : ESCOPO_CATEGORIA_FINANCEIRA.SAIDA_AVULSA,
      onCategoryCreated: (novaCat) => {
        form.setValue("categoria", novaCat.codigo);
      },
    });
  };

  const isPending =
    createMutation.isPending ||
    createTransferenciaMutation.isPending ||
    updateMutation.isPending;

  const onSubmit = async (values: MovimentacaoAvulsaFormData) => {
    try {
      if (values.modo_lancamento === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA) {
        await createTransferenciaMutation.mutateAsync({
          conta_origem_id: values.conta_bancaria_id!,
          conta_destino_id: values.conta_destino_id!,
          valor: values.valor,
          data_movimentacao: values.data_movimentacao,
          descricao: values.descricao?.trim() || undefined,
        });
        toast.success("Transferência entre contas registrada com sucesso!");
      } else {
        const payload = {
          tipo_movimentacao: values.tipo_movimentacao,
          empresa_id: Number(values.empresa_id),
          conta_bancaria_id:
            values.conta_bancaria_id && values.conta_bancaria_id !== "none"
              ? values.conta_bancaria_id
              : null,
          categoria: values.categoria as CategoriaMovimentacaoAvulsa,
          descricao: values.descricao.trim(),
          valor: values.valor,
          data_movimentacao: values.data_movimentacao,
        };

        if (movimentacaoToEdit) {
          await updateMutation.mutateAsync({
            id: movimentacaoToEdit.id,
            data: payload,
          });
          toast.success("Movimentação atualizada com sucesso!");
        } else {
          await createMutation.mutateAsync(payload);
          toast.success("Lançamento registrado com sucesso!");
        }
      }
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) &&
        (err.response?.data?.error || err.response?.data?.message)
          ? String(err.response.data.error || err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao salvar lançamento.";
      toast.error(msg);
    }
  };

  const handleFillMock = () => {
    const empId = empresas[0]?.id || 1;
    const mockData = mockGenerator.movimentacaoAvulsa(empId);
    form.reset({
      ...mockData,
      modo_lancamento: mockData.tipo_movimentacao,
      conta_destino_id: "",
    });
  };

  const handleClose = () => {
    if (isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return {
    form,
    modo,
    empresas,
    contasAtivas,
    contasEmpresa,
    contaOrigemId,
    categoriasOpcoes,
    categoriaSelecionadaAfetaDre,
    isPending,
    handleModoChange,
    handleGerenciarCategorias,
    handleFillMock,
    handleClose,
    onSubmit,
  };
}
