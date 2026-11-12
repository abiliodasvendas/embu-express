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
  dataPagamentoInicial?: string | null;
}

export function useConfirmarPagamentoSalarioForm({
  open,
  contaBancariaInicialId,
  dataPagamentoInicial,
}: UseConfirmarPagamentoSalarioFormProps) {
  const defaultDate = dataPagamentoInicial
    ? dataPagamentoInicial.slice(0, 10)
    : toLocalDateString();

  const form = useForm<ConfirmarPagamentoSalarioFormData>({
    resolver: zodResolver(confirmarPagamentoSalarioFormSchema),
    defaultValues: {
      conta_bancaria_id: contaBancariaInicialId || "",
      data_pagamento: defaultDate,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        conta_bancaria_id: contaBancariaInicialId || "",
        data_pagamento: dataPagamentoInicial
          ? dataPagamentoInicial.slice(0, 10)
          : toLocalDateString(),
      });
    }
  }, [open, contaBancariaInicialId, dataPagamentoInicial, form]);

  return { form };
}
