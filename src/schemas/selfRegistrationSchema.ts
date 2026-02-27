import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfSchema, dateSchema, phoneSchema, placaSchema } from "./common";

// 1. Schema Base: Campos comuns a todos os perfis
const commonSchema = z.object({
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().min(1, messages.validacao.campoObrigatorio),
  telefone: phoneSchema,
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),

  // Info Pessoal Estendida
  data_nascimento: dateSchema(true),
  nome_mae: z.string().optional(),
  endereco_completo: z.string().optional(),
  telefone_recado: z.string().optional().refine((val) => {
    if (!val) return true;
    return val.length === 15;
  }, "Telefone inválido"),

  chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
  isMotoboy: z.boolean().optional().default(false),
});

// 2. Schema Profissional: Condicional baseada no perfil
const professionalSchema = z.union([
  // Motoboy: Campos obrigatórios
  z.object({
    isMotoboy: z.literal(true),
    cnh_registro: z.string().min(1, messages.validacao.campoObrigatorio),
    cnh_vencimento: dateSchema(true, true), // allowFuture = true for expiry
    cnh_categoria: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_placa: placaSchema.refine((val) => val.length > 0, messages.validacao.campoObrigatorio),
    cnpj: z.string().min(14, messages.validacao.campoObrigatorio).refine((v) => v.replace(/\D/g, "").length >= 14, "CNPJ inválido"),
  }),
  // Outros perfis: Campos opcionais
  z.object({
    isMotoboy: z.literal(false),
    cnh_registro: z.string().optional(),
    cnh_vencimento: z.string().optional(),
    cnh_categoria: z.string().optional(),
    moto_modelo: z.string().optional(),
    moto_cor: z.string().optional(),
    moto_ano: z.string().optional(),
    moto_placa: z.string().optional(),
    cnpj: z.string().optional(),
  })
]);

// 3. Schema Final: Interseção
export const selfRegistrationSchema = commonSchema.and(professionalSchema);

export type SelfRegistrationFormData = z.infer<typeof selfRegistrationSchema>;
