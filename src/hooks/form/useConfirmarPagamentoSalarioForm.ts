import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmarPagamentoSalarioFormSchema,
  ConfirmarPagamentoSalarioFormData,
} from "@/schemas/confirmarPagamentoSalarioSchema";
import { toLocalDateString } from "@/utils/formatters/date";

export interface UseConfirmarPagamentoSalarioFormProps {
  open: boolean;
  contaBancariaInicialId?: string | null;
}

export function useConfirmarPagamentoSalarioForm({
  open,
  contaBancariaInicialId,
}: UseConfirmarPagamentoSalarioFormProps) {
  const form = useForm<ConfirmarPagamentoSalarioFormData>({
    resolver: zodResolver(confirmarPagamentoSalarioFormSchema),
    defaultValues: {
      conta_bancaria_id: contaBancariaInicialId || "",
      data_pagamento: toLocalDateString(),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        conta_bancaria_id: contaBancariaInicialId || "",
        data_pagamento: toLocalDateString(),
      });
    }
  }, [open, contaBancariaInicialId, form]);

  return { form };
}
