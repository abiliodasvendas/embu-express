import { messages } from "@/constants/messages";
import { moneyToNumber } from "@/utils/masks";
import { z } from "zod";

const moneySchema = z.union([
  z.string().min(1, messages.validacao.campoObrigatorio),
  z.number()
])
  .transform((val) => moneyToNumber(val))
  .refine(val => val > 0, "O valor deve ser maior que zero");

const optionalMoneySchema = z.union([z.string(), z.number()])
  .optional()
  .nullable()
  .transform((val) => moneyToNumber(val))
  .refine(val => val === 0 || val > 0, "O valor deve ser maior ou igual a zero");

const horarioSchema = z.object({
  dia_semana: z.number().min(0).max(6),
  hora_inicio: z.string().min(1, messages.validacao.campoObrigatorio).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  hora_fim: z.string().min(1, messages.validacao.campoObrigatorio).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida"),
  tolerancia_pausa_min: z.preprocess((val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    return Number(val);
  }, z.number({ required_error: messages.validacao.campoObrigatorio })
    .min(0, messages.validacao.campoObrigatorio)),
});

const baseSchema = {
  empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
  valor_contrato: moneySchema,
  valor_aluguel: optionalMoneySchema,
  valor_bonus: optionalMoneySchema,
  ajuda_custo: optionalMoneySchema,
  valor_adiantamento: optionalMoneySchema,
  data_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
  horarios: z.array(horarioSchema).min(1, "Configure ao menos um dia de trabalho"),
};

export const turnSchema = z.discriminatedUnion("isMotoboyOrFiscal", [
  z.object({
    ...baseSchema,
    isMotoboyOrFiscal: z.literal(true),
    cliente_id: z.string({ required_error: messages.validacao.campoObrigatorio })
      .min(1, messages.validacao.campoObrigatorio),
    unidade_id: z.string({ required_error: messages.validacao.campoObrigatorio })
      .min(1, messages.validacao.campoObrigatorio),
  }),
  z.object({
    ...baseSchema,
    isMotoboyOrFiscal: z.literal(false),
    cliente_id: z.string().optional().nullable(),
    unidade_id: z.string().optional().nullable(),
  }),
]);

export type TurnFormData = z.infer<typeof turnSchema>;
export type TurnFormInput = z.input<typeof turnSchema>;
