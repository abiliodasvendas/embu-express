import { z } from "zod";

export const liquidarFaturaFormSchema = z.object({
  conta_bancaria_id: z.string().min(1, "Selecione a conta bancária de recebimento"),
  data_recebimento: z.string().min(1, "Informe a data do recebimento"),
  valor_pago: z.coerce.number({
    required_error: "Informe o valor recebido",
    invalid_type_error: "Informe o valor recebido",
  }).min(0.01, "O valor recebido deve ser maior que zero"),
  observacao: z.string().optional(),
});

export type LiquidarFaturaFormData = z.infer<typeof liquidarFaturaFormSchema>;
