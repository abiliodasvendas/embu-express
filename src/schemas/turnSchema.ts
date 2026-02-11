import { messages } from "@/constants/messages";
import { z } from "zod";

import { moneyToNumber } from "@/utils/masks";

const moneySchema = z.string()
  .min(1, messages.validacao.campoObrigatorio)
  .transform((val) => moneyToNumber(val));

export const turnSchema = z.object({
  cliente_id: z.string().min(1, messages.validacao.campoObrigatorio),
  empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
  hora_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
  hora_fim: z.string().min(1, messages.validacao.campoObrigatorio),
  valor_contrato: moneySchema,
  valor_aluguel: moneySchema,
  valor_bonus: moneySchema,
  ajuda_custo: moneySchema,
  mei: z.boolean().optional().default(false),
});

export type TurnFormData = z.infer<typeof turnSchema>;
