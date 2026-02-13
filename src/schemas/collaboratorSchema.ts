import { messages } from "@/constants/messages";
import { PERFIL_ID } from "@/constants/roles";
import { z } from "zod";
import { cpfSchema, dateSchema, phoneSchema, placaSchema } from "./common";

// Auxiliar para a validação de conflitos de horários
const checkLinkConflicts = (links: any[], ctx: any) => {
    if (!links) return;
    
    const toMinutes = (time: string) => {
        const [h, m] = time?.split(":").map(Number) || [0, 0];
        return h * 60 + m;
    };

    for (let i = 0; i < links.length; i++) {
        const l = links[i];
        const start = toMinutes(l.hora_inicio);
        const end = toMinutes(l.hora_fim);
        
        let duration = 0;
        if (start < end) duration = end - start;
        else duration = (1440 - start) + end;

        if (duration < 60) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Turno min 1h",
                path: ["links", i, "hora_fim"],
            });
        }
    }
};

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
  status: z.enum(["ATIVO", "INATIVO", "PENDENTE"]).default("ATIVO"),
  senha_padrao: z.boolean().optional(),
  data_inicio: z.string().optional(),
  valor_ajuda_custo: z.coerce.number().optional().default(0),
  empresa_financeiro_id: z.string().optional(),
  nome_operacao: z.string().optional(),
  perfil_id: z.string().min(1, messages.validacao.campoObrigatorio),
  links: z.array(z.object({
    cliente_id: z.string().min(1, messages.validacao.campoObrigatorio),
    empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
    hora_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
    hora_fim: z.string().min(1, messages.validacao.campoObrigatorio),
    valor_contrato: z.coerce.number().optional(),
    valor_aluguel: z.coerce.number().optional(),
    valor_bonus: z.coerce.number().optional(),
    ajuda_custo: z.coerce.number().optional(),
    mei: z.boolean().optional(),
  })).superRefine(checkLinkConflicts).optional().default([])
});

// 2. Schema Profissional: Condicional baseada no perfil
const professionalSchema = z.union([
  // Motoboy: Campos obrigatórios
  z.object({
    perfil_id: z.literal(PERFIL_ID.MOTOBOY),
    cnh_registro: z.string().min(1, messages.validacao.campoObrigatorio),
    cnh_vencimento: dateSchema(true, true),
    cnh_categoria: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_placa: z.string().min(1, messages.validacao.campoObrigatorio).pipe(placaSchema),
    cnpj: z.string().min(14, messages.validacao.campoObrigatorio).refine(v => v.replace(/\D/g, "").length >= 14, "CNPJ inválido"),
    chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
  }),
  // Outros perfis: Campos opcionais
  z.object({
    perfil_id: z.string().refine(val => val !== PERFIL_ID.MOTOBOY),
    cnh_registro: z.string().optional(),
    cnh_vencimento: z.string().optional(),
    cnh_categoria: z.string().optional(),
    moto_modelo: z.string().optional(),
    moto_cor: z.string().optional(),
    moto_ano: z.string().optional(),
    moto_placa: z.string().optional(),
    cnpj: z.string().optional(),
    chave_pix: z.string().optional(),
  })
]);

// 3. Schema Final: Interseção Híbrida
// Isso garante validação paralela e mensagens de erro amigáveis
export const collaboratorSchema = commonSchema.and(professionalSchema);

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>;
