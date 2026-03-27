import { messages } from "@/constants/messages";
import { z } from "zod";
import { kmToNumber } from "@/utils/masks";
import { isMotoboy } from "@/utils/business/roles";

export const manualTimeRecordSchema = z.object({
  usuario_id: z.string().min(1, messages.validacao.campoObrigatorio),
  perfil_nome: z.string().optional(),
  data_referencia: z.string().min(1, messages.validacao.campoObrigatorio),
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
  entrada_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val)), "KM inválido"),
  saida_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val || "")), "KM inválido"),
  colaborador_cliente_id: z.string().optional(),
  observacao: z.string().max(500, "Máximo de 500 caracteres").optional(),
}).refine(data => {
  const isRequired = isMotoboy(data.perfil_nome);
  if (isRequired && data.saida_hora && !data.saida_km) return false;
  if (!isRequired && data.saida_km && !data.saida_hora) return false;
  if (isRequired && data.saida_km && !data.saida_hora) return false;
  return true;
}, {
  message: "Hora e KM de saída devem ser preenchidos juntos",
  path: ["saida_hora"]
}).refine(data => {
  const isRequired = isMotoboy(data.perfil_nome);
  if (isRequired && !data.entrada_km) return false;
  return true;
}, {
  message: messages.validacao.campoObrigatorio,
  path: ["entrada_km"]
}).refine(data => {
  if (data.entrada_km && data.saida_km) {
    const startKm = kmToNumber(data.entrada_km);
    const endKm = kmToNumber(data.saida_km);
    if (!isNaN(startKm) && !isNaN(endKm) && endKm < startKm) {
        return false;
    }
  }
  return true;
}, {
  message: "O KM de saída não pode ser menor que o KM de entrada",
  path: ["saida_km"]
});

export type ManualTimeRecordFormValues = z.infer<typeof manualTimeRecordSchema>;

export const editTimeRecordSchema = z.object({
  perfil_nome: z.string().optional(),
  entrada_hora: z.string()
    .min(1, messages.validacao.campoObrigatorio)
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora inválida (00:00 - 23:59)"),
  saida_hora: z.string()
    .optional()
    .refine(val => !val || /^([01]\d|2[0-3]):([0-5]\d)$/.test(val), "Hora inválida (00:00 - 23:59)"),
  entrada_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val)), "KM inválido"),
  saida_km: z.string()
    .optional()
    .refine(val => !val || !isNaN(kmToNumber(val || "")), "KM inválido"),
  observacao: z.string().max(500, "Máximo de 500 caracteres").optional(),
}).refine(data => {
  const isRequired = isMotoboy(data.perfil_nome);
  if (isRequired && data.saida_hora && !data.saida_km) return false;
  if (data.saida_km && !data.saida_hora) return false;
  return true;
}, {
  message: "Hora e KM de saída devem ser preenchidos juntos",
  path: ["saida_hora"]
}).refine(data => {
  const isRequired = isMotoboy(data.perfil_nome);
  if (isRequired && !data.entrada_km) return false;
  return true;
}, {
  message: messages.validacao.campoObrigatorio,
  path: ["entrada_km"]
}).refine(data => {
  if (data.entrada_km && data.saida_km) {
    const startKm = kmToNumber(data.entrada_km);
    const endKm = kmToNumber(data.saida_km);
    if (!isNaN(startKm) && !isNaN(endKm) && endKm < startKm) {
        return false;
    }
  }
  return true;
}, {
  message: "O KM de saída não pode ser menor que o KM de entrada",
  path: ["saida_km"]
});

export type EditTimeRecordFormValues = z.infer<typeof editTimeRecordSchema>;
