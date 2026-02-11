import { messages } from "@/constants/messages";
import { z } from "zod";

export const empresaSchema = z.object({
  nome_fantasia: z.string().min(3, messages.validacao.campoObrigatorio), // Using generic or specific if available
  razao_social: z.string().optional(),
  cnpj: z.string().optional(), 
});

export type EmpresaFormValues = z.infer<typeof empresaSchema>;
