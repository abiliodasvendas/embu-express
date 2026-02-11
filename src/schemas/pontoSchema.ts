import { messages } from "@/constants/messages";
import { z } from "zod";

export const manualTimeRecordSchema = z.object({
  usuario_id: z.string().min(1, messages.validacao.campoObrigatorio),
  data_referencia: z.string().min(1, messages.validacao.campoObrigatorio),
  entrada_hora: z.string().min(1, messages.validacao.campoObrigatorio),
  saida_hora: z.string().optional(),
  entrada_loc: z.any().optional(),
  saida_loc: z.any().optional(),
});

export type ManualTimeRecordFormValues = z.infer<typeof manualTimeRecordSchema>;

export const editTimeRecordSchema = z.object({
  entrada_hora: z.string().min(1, messages.validacao.campoObrigatorio),
  saida_hora: z.string().optional(),
});

export type EditTimeRecordFormValues = z.infer<typeof editTimeRecordSchema>;
