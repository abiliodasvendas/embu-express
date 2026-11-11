import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  confirmarAdiantamentoFormSchema,
  ConfirmarAdiantamentoFormData,
} from "@/schemas/confirmarAdiantamentoSchema";
import { toLocalDateString } from "@/utils/formatters/date";

export interface UseConfirmarAdiantamentoFormProps {
  open: boolean;
  valorSugerido: number;
  contaBancariaInicialId?: string | null;
}

export function useConfirmarAdiantamentoForm({
  open,
  valorSugerido,
  contaBancariaInicialId,
}: UseConfirmarAdiantamentoFormProps) {
  const form = useForm<ConfirmarAdiantamentoFormData>({
    resolver: zodResolver(confirmarAdiantamentoFormSchema),
    defaultValues: {
      conta_bancaria_id: contaBancariaInicialId || "",
      data_pagamento: toLocalDateString(),
      valor: Number(valorSugerido || 0),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        conta_bancaria_id: contaBancariaInicialId || "",
        data_pagamento: toLocalDateString(),
        valor: Number(valorSugerido || 0),
      });
    }
  }, [open, valorSugerido, contaBancariaInicialId, form]);

  return { form };
}
