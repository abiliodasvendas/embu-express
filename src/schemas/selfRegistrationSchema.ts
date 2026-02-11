import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfCnpjSchema, dateSchema, phoneSchema, placaSchema } from "./common";

export const selfRegistrationSchema = z.object({
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpfcnpj: cpfCnpjSchema,
  rg: z.string().min(1, messages.validacao.campoObrigatorio),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  
  // Extended Personal Info
  data_nascimento: dateSchema(true),
  nome_mae: z.string().min(1, messages.validacao.campoObrigatorio),
  endereco_completo: z.string().min(5, messages.validacao.campoObrigatorio),
  telefone_recado: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 15;
  }, "Telefone inválido"),

  // Financial / Moto Extras
  chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_placa: placaSchema.refine((val) => val.length > 0, messages.validacao.campoObrigatorio),
  
  // CNH Defaults - Mandatory
  cnh_registro: z.string().min(1, messages.validacao.campoObrigatorio),
  cnh_vencimento: dateSchema(true, true), // allowFuture = true for expiry
  cnh_categoria: z.string().min(1, messages.validacao.campoObrigatorio),
  nome_operacao: z.string().optional(),
});

export type SelfRegistrationFormData = z.infer<typeof selfRegistrationSchema>;
