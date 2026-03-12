import { messages } from "@/constants/messages";
import { z } from "zod";

export const manualTimeRecordSchema = z.object({
  usuario_id: z.string().min(1, messages.validacao.campoObrigatorio),
  data_referencia: z.string().min(1, messages.validacao.campoObrigatorio),
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
  entrada_loc: z.any().optional(),
  saida_loc: z.any().optional(),
  colaborador_cliente_id: z.string().optional(),
});

export type ManualTimeRecordFormValues = z.infer<typeof manualTimeRecordSchema>;

export const editTimeRecordSchema = z.object({
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
});

export type EditTimeRecordFormValues = z.infer<typeof editTimeRecordSchema>;
