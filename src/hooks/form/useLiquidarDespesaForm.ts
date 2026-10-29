import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { liquidarDespesaFormSchema, LiquidarDespesaFormData } from "@/schemas/liquidarDespesaSchema";
import { toLocalDateString } from "@/utils/formatters/date";
import { DespesaOperacional } from "@/types/database";

interface UseLiquidarDespesaFormProps {
  open: boolean;
  despesa?: DespesaOperacional | null;
}

export function useLiquidarDespesaForm({ open, despesa }: UseLiquidarDespesaFormProps) {
  const valorDefault = despesa
    ? Number(despesa.valor_previsto || 0)
    : 0;

  const form = useForm<LiquidarDespesaFormData>({
    resolver: zodResolver(liquidarDespesaFormSchema),
    defaultValues: {
      conta_bancaria_id: despesa?.conta_bancaria_id || "",
      data_pagamento: toLocalDateString(),
      valor_pago: valorDefault,
    },
  });

  useEffect(() => {
    if (open && despesa) {
      form.reset({
        conta_bancaria_id: despesa.conta_bancaria_id || "",
        data_pagamento: toLocalDateString(),
        valor_pago: Number(despesa.valor_previsto || 0),
      });
    }
  }, [open, despesa, form]);

  return { form };
}
