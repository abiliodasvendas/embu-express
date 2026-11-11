import { z } from "zod";

export const confirmarPagamentoSalarioFormSchema = z.object({
  conta_bancaria_id: z
    .string({ required_error: "Selecione a conta bancária utilizada para o pagamento" })
    .min(1, "Selecione a conta bancária utilizada para o pagamento")
    .uuid("Selecione uma conta bancária válida"),
  data_pagamento: z
    .string({ required_error: "Informe a data do pagamento" })
    .min(1, "Informe a data do pagamento"),
});

export type ConfirmarPagamentoSalarioFormData = z.infer<typeof confirmarPagamentoSalarioFormSchema>;
