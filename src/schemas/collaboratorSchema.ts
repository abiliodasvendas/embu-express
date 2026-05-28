import { StatusUsuario } from "@/types/enums";
import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfSchema, dateSchema, optionalPhoneSchema, phoneSchema, placaSchema } from "./common";
import { moneyToNumber } from "@/utils/masks";
import { pixKeyRefinement } from "./pixSchema";

const optionalMoneySchema = z.union([z.string(), z.number()])
  .optional()
  .refine(val => {
    if (!val) return true;
    const num = typeof val === 'number' ? val : moneyToNumber(val);
    return num >= 0;
  }, "O valor deve ser maior ou igual a zero ou vazio")
  .transform((val) => {
    if (!val) return 0;
    return typeof val === 'number' ? val : moneyToNumber(val);
  });

// 1. Schema Base: Campos comuns a todos os perfis
// Garante que o perfil_id tenha a mensagem "Campo obrigatório" padrão
const commonSchema = z.object({
  id: z.string().optional(),
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().optional(),
  data_nascimento: dateSchema(false),
  nome_mae: z.string().optional(),
  endereco_completo: z.string().optional(),
  telefone: phoneSchema,
  telefone_recado: z.string().optional(),
  status: z.enum([StatusUsuario.ATIVO, StatusUsuario.INATIVO, StatusUsuario.PENDENTE]).default(StatusUsuario.PENDENTE),
  senha_padrao: z.boolean().optional(),
  validar_localizacao: z.boolean().optional().default(true),
  data_inicio: z.string().optional(),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
});

// 2. Schema Profissional: Condicional baseada no perfil
const professionalSchema = z.object({
  cnh_registro: z.string().optional(),
  cnh_vencimento: z.string().optional(),
  cnh_categoria: z.string().optional(),
  moto_modelo: z.string().optional(),
  moto_cor: z.string().optional(),
  moto_ano: z.string().optional(),
  moto_placa: z.string().optional(),
  cnpj: z.string().optional(),
  valor_mei: optionalMoneySchema,
  tipo_chave_pix: z.string().optional(),
  chave_pix: z.string().optional(),
}).superRefine((data, ctx) => {
  // Validação da Chave PIX centralizada (valida se preenchido)
  pixKeyRefinement(data, ctx);
});

// 3. Schema Final: Interseção Híbrida
// Isso garante validação paralela e mensagens de erro amigáveis
export const collaboratorSchema = commonSchema.and(professionalSchema);

// 4. Tipagem
export type CollaboratorFormValues = z.input<typeof collaboratorSchema>;
export type CollaboratorFormData = z.infer<typeof collaboratorSchema>;
