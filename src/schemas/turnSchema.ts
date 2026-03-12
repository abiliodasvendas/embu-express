import { messages } from "@/constants/messages";
import { moneyToNumber } from "@/utils/masks";
import { z } from "zod";

const moneySchema = z.string()
  .min(1, messages.validacao.campoObrigatorio)
  .transform((val) => moneyToNumber(val))
  .refine(val => val > 0, "O valor deve ser maior que zero");

const optionalMoneySchema = z.string()
  .optional()
  .refine(val => !val || moneyToNumber(val) > 0, "O valor deve ser maior que zero ou vazio")
  .transform((val) => val ? moneyToNumber(val) : 0);

const baseSchema = {
  empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
  hora_inicio: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  hora_fim: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  valor_contrato: moneySchema,
  valor_aluguel: optionalMoneySchema,
  valor_bonus: optionalMoneySchema,
  ajuda_custo: optionalMoneySchema,
  valor_mei: optionalMoneySchema,
  valor_adiantamento: optionalMoneySchema,
  data_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
};

export const turnSchema = z.discriminatedUnion("isMotoboyOrFiscal", [
  z.object({
    ...baseSchema,
    isMotoboyOrFiscal: z.literal(true),
    cliente_id: z.string({ required_error: messages.validacao.campoObrigatorio })
      .min(1, messages.validacao.campoObrigatorio),
  }),
  z.object({
    ...baseSchema,
    isMotoboyOrFiscal: z.literal(false),
    cliente_id: z.string().optional().nullable(),
  }),
]);

export type TurnFormData = z.infer<typeof turnSchema>;
