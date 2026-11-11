import { z } from "zod";

export const confirmarAdiantamentoFormSchema = z.object({
  conta_bancaria_id: z
    .string({ required_error: "Selecione a conta bancária de onde saiu o adiantamento" })
    .min(1, "Selecione a conta bancária de onde saiu o adiantamento")
    .uuid("Selecione uma conta bancária válida"),
  data_pagamento: z
    .string({ required_error: "Informe a data do pagamento" })
    .min(1, "Informe a data do pagamento"),
  valor: z.coerce
    .number({
      required_error: "Informe o valor do adiantamento",
      invalid_type_error: "Informe o valor do adiantamento",
    })
    .min(0.01, "O valor do adiantamento deve ser maior que R$ 0,00"),
});

export type ConfirmarAdiantamentoFormData = z.infer<typeof confirmarAdiantamentoFormSchema>;
