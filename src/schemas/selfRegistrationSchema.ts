import { messages } from "@/constants/messages";
import { z } from "zod";
import { onlyNumbers } from "@/utils/string";
import { cpfSchema, dateSchema, optionalPhoneSchema, phoneSchema } from "./common";
import { pixKeyRefinement } from "./pixSchema";

// 1. Schema Base: Campos comuns a todos os perfis
const commonSchema = z.object({
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().optional(),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),

  // Info Pessoal Estendida
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
  isMotoboyOrFiscal: z.boolean().optional().default(false),
});

// 2. Schema Profissional: Condicional baseada no flag isMotoboy (que indica se é perfil profissional como Motoboy ou Fiscal)
const professionalSchema = z.object({
  isMotoboyOrFiscal: z.boolean().optional(),
  cnh_registro: z.string().optional(),
  cnh_vencimento: z.string().optional(),
  cnh_categoria: z.string().optional(),
  moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
  moto_placa: z.string().min(1, messages.validacao.campoObrigatorio),
  cnpj: z.string().optional(),
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validação da Chave PIX centralizada (valida se preenchido)
  pixKeyRefinement(data, ctx);
});

// 3. Schema Final: Interseção
export const selfRegistrationSchema = commonSchema.and(professionalSchema);

export type SelfRegistrationFormData = z.infer<typeof selfRegistrationSchema>;
