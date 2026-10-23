import { z } from "zod";

export const loteRecebimentoFormSchema = z.object({
  conta_bancaria_destino_id: z.string().min(1, "Selecione a conta bancária de destino"),
  data_deposito: z.string().min(1, "Informe a data do depósito"),
  valor_total_depositado: z.coerce.number({
    required_error: "Informe o valor total depositado",
    invalid_type_error: "Informe o valor total depositado",
  }).min(0.01, "O valor total depositado deve ser maior que zero"),
  observacao: z.string().optional(),
});

export type LoteRecebimentoFormData = z.infer<typeof loteRecebimentoFormSchema>;
