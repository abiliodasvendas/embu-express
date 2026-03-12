import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfSchema, dateSchema, phoneSchema, placaSchema } from "./common";
import { pixKeyRefinement } from "./pixSchema";

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

  tipo_chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
  isMotoboy: z.boolean().optional().default(false),
});

// 2. Schema Profissional: Condicional baseada no flag isMotoboy (que indica se é perfil profissional como Motoboy ou Fiscal)
const professionalSchema = z.object({
  isMotoboy: z.boolean().optional(),
  cnh_registro: z.string().optional(),
  cnh_vencimento: z.string().optional(),
  cnh_categoria: z.string().optional(),
  moto_modelo: z.string().optional(),
  moto_cor: z.string().optional(),
  moto_ano: z.string().optional(),
  moto_placa: z.string().optional(),
  cnpj: z.string().optional(),
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isMotoboy) {
    if (!data.cnh_registro) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["cnh_registro"] });
    }
    if (!data.cnh_vencimento) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["cnh_vencimento"] });
    }
    if (!data.cnh_categoria) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["cnh_categoria"] });
    }
    if (!data.moto_modelo) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["moto_modelo"] });
    }
    if (!data.moto_cor) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["moto_cor"] });
    }
    if (!data.moto_ano) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["moto_ano"] });
    }
    if (!data.moto_placa) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["moto_placa"] });
    }
  }

  // Validação da Chave PIX centralizada
  pixKeyRefinement(data, ctx);
});

// 3. Schema Final: Interseção
export const selfRegistrationSchema = commonSchema.and(professionalSchema);

export type SelfRegistrationFormData = z.infer<typeof selfRegistrationSchema>;
