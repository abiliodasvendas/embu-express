import { messages } from "@/constants/messages";
import { z } from "zod";
import { kmToNumber } from "@/utils/masks";

export const manualTimeRecordSchema = z.object({
  usuario_id: z.string().min(1, messages.validacao.campoObrigatorio),
  data_referencia: z.string().min(1, messages.validacao.campoObrigatorio),
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
  entrada_km: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .refine(val => !isNaN(kmToNumber(val)), "KM inválido"),
  saida_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val || "")), "KM inválido"),
  colaborador_cliente_id: z.string().optional(),
}).refine(data => {
  if (data.saida_hora && !data.saida_km) return false;
  if (data.saida_km && !data.saida_hora) return false;
  return true;
}, {
  message: "Hora e KM de saída devem ser preenchidos juntos",
  path: ["saida_hora"]
});

export type ManualTimeRecordFormValues = z.infer<typeof manualTimeRecordSchema>;

export const editTimeRecordSchema = z.object({
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
  entrada_km: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .refine(val => !isNaN(kmToNumber(val)), "KM inválido"),
  saida_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val || "")), "KM inválido"),
}).refine(data => {
  // Se preencher a saída, o KM de saída é obrigatório
  if (data.saida_hora && !data.saida_km) return false;
  // Se preencher o KM de saída, a hora de saída é obrigatória
  if (data.saida_km && !data.saida_hora) return false;
  return true;
}, {
  message: "Hora e KM de saída devem ser preenchidos juntos",
  path: ["saida_hora"]
});

export type EditTimeRecordFormValues = z.infer<typeof editTimeRecordSchema>;
