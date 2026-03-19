import { messages } from "@/constants/messages";
import { z } from "zod";
import { cepSchema, cnpjSchema } from "./common";

export const unidadeSchema = z.object({
  cliente_id: z.number().optional(), // Pode ser opcional se estiver criando junto com o cliente
  nome_unidade: z.string().min(1, messages.validacao.campoObrigatorio),
  razao_social: z.string().min(1, messages.validacao.campoObrigatorio),
  cnpj: cnpjSchema,
  cep: cepSchema.refine((val) => !!val, messages.validacao.campoObrigatorio),
  logradouro: z.string().min(1, messages.validacao.campoObrigatorio),
  numero: z.string().min(1, messages.validacao.campoObrigatorio),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(1, messages.validacao.campoObrigatorio),
  cidade: z.string().min(1, messages.validacao.campoObrigatorio),
  estado: z.string().min(2, messages.validacao.campoObrigatorio),
  km_contratados: z.coerce.number({ invalid_type_error: messages.validacao.campoObrigatorio }).min(1, messages.validacao.campoObrigatorio),
  escala_semanal: z.array(z.number()).min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
});

export type UnidadeFormData = z.infer<typeof unidadeSchema>;
