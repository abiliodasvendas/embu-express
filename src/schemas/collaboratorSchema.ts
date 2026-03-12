import { STATUS_CADASTRO } from "@/constants/cadastro";
import { messages } from "@/constants/messages";
import { z } from "zod";
import { cpfSchema, dateSchema, phoneSchema, placaSchema } from "./common";

// 1. Schema Base: Campos comuns a todos os perfis
// Garante que o perfil_id tenha a mensagem "Campo obrigatório" padrão
const commonSchema = z.object({
  id: z.string().optional(),
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().min(1, messages.validacao.campoObrigatorio),
  data_nascimento: dateSchema(true),
  nome_mae: z.string().optional(),
  endereco_completo: z.string().optional(),
  telefone: phoneSchema,
  telefone_recado: z.string().optional(),
  status: z.enum([STATUS_CADASTRO.ATIVO, STATUS_CADASTRO.INATIVO, STATUS_CADASTRO.PENDENTE]).default(STATUS_CADASTRO.PENDENTE),
  senha_padrao: z.boolean().optional(),
  data_inicio: z.string().optional(),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
  isMotoboy: z.boolean().optional().default(false),
  tipo_chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
});

// 2. Schema Profissional: Condicional baseada no perfil
const professionalSchema = z.union([
  // Motoboy: Campos obrigatórios
  z.object({
    isMotoboy: z.literal(true),
    cnh_registro: z.string().min(1, messages.validacao.campoObrigatorio),
    cnh_vencimento: dateSchema(true, true),
    cnh_categoria: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_placa: z.string().min(1, messages.validacao.campoObrigatorio).pipe(placaSchema),
    cnpj: z.string().min(14, messages.validacao.campoObrigatorio).refine(v => v.replace(/\D/g, "").length >= 14, "CNPJ inválido"),
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

// 3. Schema Final: Interseção Híbrida
// Isso garante validação paralela e mensagens de erro amigáveis
export const collaboratorSchema = commonSchema.and(professionalSchema);

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>;
