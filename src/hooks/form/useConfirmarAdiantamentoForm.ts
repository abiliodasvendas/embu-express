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
  dataPagamentoInicial?: string | null;
}

export function useConfirmarAdiantamentoForm({
  open,
  valorSugerido,
  contaBancariaInicialId,
  dataPagamentoInicial,
}: UseConfirmarAdiantamentoFormProps) {
  const defaultDate = dataPagamentoInicial
    ? dataPagamentoInicial.slice(0, 10)
    : toLocalDateString();

  const form = useForm<ConfirmarAdiantamentoFormData>({
    resolver: zodResolver(confirmarAdiantamentoFormSchema),
    defaultValues: {
      conta_bancaria_id: contaBancariaInicialId || "",
      data_pagamento: defaultDate,
      valor: Number(valorSugerido || 0),
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        conta_bancaria_id: contaBancariaInicialId || "",
        data_pagamento: dataPagamentoInicial
          ? dataPagamentoInicial.slice(0, 10)
          : toLocalDateString(),
        valor: Number(valorSugerido || 0),
      });
    }
  }, [open, valorSugerido, contaBancariaInicialId, dataPagamentoInicial, form]);

  return { form };
}
