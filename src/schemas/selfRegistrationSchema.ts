import { messages } from "@/constants/messages";
import { z } from "zod";
import { onlyNumbers } from "@/utils/string";
import { cpfSchema, dateSchema, phoneSchema } from "./common";
import { pixKeyRefinement } from "./pixSchema";

const commonSchema = z.object({
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().optional(),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  data_nascimento: dateSchema(false),
  nome_mae: z.string().min(3, messages.validacao.campoObrigatorio),
  endereco_completo: z.string().min(5, messages.validacao.campoObrigatorio),
  telefone_recado: z.string().optional().refine((val) => {
    if (!val) return true;
    const clean = onlyNumbers(val);
    return clean.length >= 10 && clean.length <= 11;
  }, "Telefone inválido"),
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
});

const professionalSchema = z.object({
  cnh_registro: z.string().optional(),
  cnh_vencimento: dateSchema(false, true),
  cnh_categoria: z.string().optional(),
  moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_placa: z.string().min(1, messages.validacao.campoObrigatorio),
  cnpj: z.string().optional(),
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
}).superRefine((data, ctx) => {
  pixKeyRefinement(data, ctx);
});

export const selfRegistrationSchema = commonSchema.and(professionalSchema);

export type SelfRegistrationFormData = z.infer<typeof selfRegistrationSchema>;
