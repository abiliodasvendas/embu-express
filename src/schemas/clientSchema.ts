import { messages } from "@/constants/messages";
import { validateEnderecoFields } from "@/utils/validators";
import { z } from "zod";
import { cepSchema, cnpjSchema } from "./common";

export const clientSchema = z
  .object({
    nome_fantasia: z.string().min(1, messages.validacao.campoObrigatorio),
    razao_social: z.string().min(1, messages.validacao.campoObrigatorio),
    cnpj: cnpjSchema,
    cep: cepSchema
      .or(z.literal(""))
      .refine((val) => !!val, messages.validacao.campoObrigatorio),
    logradouro: z.string().min(1, messages.validacao.campoObrigatorio),
    numero: z.string().min(1, messages.validacao.campoObrigatorio),
    complemento: z.string().optional(),
    bairro: z.string().min(1, messages.validacao.campoObrigatorio),
    cidade: z.string().min(1, messages.validacao.campoObrigatorio),
    estado: z.string().min(2, messages.validacao.campoObrigatorio),
    ativo: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const validation = validateEnderecoFields(
      data.cep || "",
      data.logradouro,
      data.numero,
    );

    if (validation.errors.cep) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.cep,
        path: ["cep"],
      });
    }
    if (validation.errors.logradouro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.logradouro,
        path: ["logradouro"],
      });
    }
    if (validation.errors.numero) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.errors.numero,
        path: ["numero"],
      });
    }
  });

export type ClientFormData = z.infer<typeof clientSchema>;
