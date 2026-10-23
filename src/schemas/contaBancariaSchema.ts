import { z } from "zod";

export const contaBancariaFormSchema = z.object({
  empresa_id: z.coerce
    .number({
      required_error: "Selecione a empresa",
      invalid_type_error: "Selecione a empresa",
    })
    .min(1, "Selecione a empresa dona da conta"),
  banco_nome: z
    .string({
      required_error: "Informe o nome do banco",
    })
    .min(2, "Informe o nome do banco"),
  agencia: z.string().optional().nullable(),
  conta: z.string().optional().nullable(),
  tipo_conta: z.enum(["CORRENTE", "POUPANCA"]).default("CORRENTE"),
});

export type ContaBancariaFormData = z.infer<typeof contaBancariaFormSchema>;
