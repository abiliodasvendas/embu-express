import { messages } from "@/constants/messages";
import { validateEnderecoFields } from "@/utils/validators";
import { z } from "zod";
import { cepSchema, cnpjSchema } from "./common";

export const clientSchema = z.object({
  nome_fantasia: z.string().min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
});

export type ClientFormData = z.infer<typeof clientSchema>;
