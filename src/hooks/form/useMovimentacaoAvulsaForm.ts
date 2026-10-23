import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { movimentacaoAvulsaFormSchema, MovimentacaoAvulsaFormData } from "@/schemas/movimentacaoAvulsaSchema";
import { MovimentacaoAvulsa } from "@/types/database";
import { TIPO_MOVIMENTACAO_AVULSA } from "@/constants/financeiro.constants";
import { toLocalDateString } from "@/utils/formatters/date";

interface UseMovimentacaoAvulsaFormProps {
  open: boolean;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  defaultEmpresaId?: number;
}

export function useMovimentacaoAvulsaForm({
  open,
  movimentacaoToEdit,
  defaultEmpresaId,
}: UseMovimentacaoAvulsaFormProps) {
  const hoje = new Date();

  const form = useForm<MovimentacaoAvulsaFormData>({
    resolver: zodResolver(movimentacaoAvulsaFormSchema),
    defaultValues: {
      tipo_movimentacao: TIPO_MOVIMENTACAO_AVULSA.ENTRADA,
      empresa_id: defaultEmpresaId || 0,
      conta_bancaria_id: "none",
      categoria: "FRETE_ESPORADICO",
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
        form.reset({
          tipo_movimentacao: TIPO_MOVIMENTACAO_AVULSA.ENTRADA,
          empresa_id: defaultEmpresaId || 0,
          conta_bancaria_id: "none",
          categoria: "FRETE_ESPORADICO",
          descricao: "",
          valor: 0,
          data_movimentacao: toLocalDateString(hoje),
        });
      }
    }
  }, [open, movimentacaoToEdit, defaultEmpresaId, form]);

  return { form };
}
