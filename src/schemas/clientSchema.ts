import { messages } from "@/constants/messages";
import { z } from "zod";

export const clientSchema = z.object({
  nome_fantasia: z.string().min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
});

export type ClientFormData = z.infer<typeof clientSchema>;
