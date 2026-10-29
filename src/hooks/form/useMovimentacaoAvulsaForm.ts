import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movimentacaoAvulsaFormSchema, MovimentacaoAvulsaFormData } from "@/schemas/movimentacaoAvulsaSchema";
import { MovimentacaoAvulsa, TipoMovimentacaoAvulsa } from "@/types/database";
import { TIPO_MOVIMENTACAO_AVULSA } from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";

interface UseMovimentacaoAvulsaFormProps {
  open: boolean;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  defaultEmpresaId?: number;
  forcedTipo?: TipoMovimentacaoAvulsa;
}

export function useMovimentacaoAvulsaForm({
  open,
  movimentacaoToEdit,
  defaultEmpresaId,
  forcedTipo,
}: UseMovimentacaoAvulsaFormProps) {
  const hoje = new Date();
  const initialTipo = forcedTipo || TIPO_MOVIMENTACAO_AVULSA.ENTRADA;
  const initialCategoria = initialTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
    ? "FRETE_ESPORADICO"
    : "DESPESA_OPERACIONAL_AVULSA";

  const form = useForm<MovimentacaoAvulsaFormData>({
    resolver: zodResolver(movimentacaoAvulsaFormSchema),
    defaultValues: {
      tipo_movimentacao: initialTipo,
      empresa_id: defaultEmpresaId || 0,
      conta_bancaria_id: "none",
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
          tipo_movimentacao: movimentacaoToEdit.tipo_movimentacao,
          empresa_id: movimentacaoToEdit.empresa_id,
          conta_bancaria_id: movimentacaoToEdit.conta_bancaria_id || "none",
          categoria: movimentacaoToEdit.categoria,
          descricao: movimentacaoToEdit.descricao,
          valor: movimentacaoToEdit.valor,
          data_movimentacao: movimentacaoToEdit.data_movimentacao,
        });
      } else {
        const tipoPadrao = forcedTipo || TIPO_MOVIMENTACAO_AVULSA.ENTRADA;
        const categoriaPadrao = tipoPadrao === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
          ? "FRETE_ESPORADICO"
          : "DESPESA_OPERACIONAL_AVULSA";

        form.reset({
          tipo_movimentacao: tipoPadrao,
          empresa_id: defaultEmpresaId || 0,
          conta_bancaria_id: "none",
          categoria: categoriaPadrao,
          descricao: "",
          valor: 0,
          data_movimentacao: toLocalDateString(hoje),
        });
      }
    }
  }, [open, movimentacaoToEdit, defaultEmpresaId, forcedTipo, form]);

  return { form };
}
