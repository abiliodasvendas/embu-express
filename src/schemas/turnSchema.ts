import { messages } from "@/constants/messages";
import { z } from "zod";

import { moneyToNumber } from "@/utils/masks";

const moneySchema = z.string()
  .min(1, messages.validacao.campoObrigatorio)
  .transform((val) => moneyToNumber(val))
  .refine(val => val > 0, "O valor deve ser maior que zero");

const optionalMoneySchema = z.string()
  .optional()
  .refine(val => !val || moneyToNumber(val) > 0, "O valor deve ser maior que zero ou vazio")
  .transform((val) => val ? moneyToNumber(val) : 0);

export const turnSchema = z.object({
  cliente_id: z.string().optional(),
  empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
  hora_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
  hora_fim: z.string().min(1, messages.validacao.campoObrigatorio),
  valor_contrato: moneySchema,
  valor_aluguel: optionalMoneySchema,
  valor_bonus: optionalMoneySchema,
  ajuda_custo: optionalMoneySchema,
});

export type TurnFormData = z.infer<typeof turnSchema>;
