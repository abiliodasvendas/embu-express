import { messages } from "@/constants/messages";
import { z } from "zod";
import { cnpjSchema } from "./common";

export const empresaSchema = z.object({
  nome_fantasia: z.string().min(3, messages.validacao.campoObrigatorio),
  razao_social: z.string().min(1, messages.validacao.campoObrigatorio),
  cnpj: cnpjSchema,
});

export type EmpresaFormValues = z.infer<typeof empresaSchema>;
