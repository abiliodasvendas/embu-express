import { z } from "zod";

export const liquidarDespesaFormSchema = z.object({
  data_pagamento: z.string().min(1, "Informe a data do pagamento"),
  valor_pago: z.coerce.number({
    required_error: "Informe o valor pago",
    invalid_type_error: "Informe o valor pago",
  }).min(0.01, "O valor pago deve ser maior que zero"),
});

export type LiquidarDespesaFormData = z.infer<typeof liquidarDespesaFormSchema>;
