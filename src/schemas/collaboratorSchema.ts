import { messages } from "@/constants/messages";
import { PERFIL_ID } from "@/constants/roles";
import { z } from "zod";
import { cpfSchema, dateSchema, phoneSchema, placaSchema } from "./common";

// Helper for time duration check
const checkLinkConflicts = (links: any[], ctx: any) => {
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

const baseSchema = z.object({
  // Dados Pessoais
  nome_completo: z.string().min(3, messages.validacao.campoObrigatorio),
  email: z.string().min(1, messages.validacao.campoObrigatorio).email("E-mail inválido"),
  cpf: cpfSchema,
  rg: z.string().min(1, messages.validacao.campoObrigatorio),
  data_nascimento: dateSchema(true),
  nome_mae: z.string().optional(),
  endereco_completo: z.string().optional(),
  telefone: phoneSchema,
  telefone_recado: z.string().optional(),
  
  // Configurações
  status: z.enum(["ATIVO", "INATIVO", "PENDENTE"]).default("ATIVO"),
  senha_padrao: z.boolean().optional(),
  data_inicio: z.string().optional(), // Admissão
  valor_ajuda_custo: z.coerce.number().optional().default(0),
  empresa_financeiro_id: z.string().optional(),
  nome_operacao: z.string().optional(),

  // Vínculos (Turnos)
  links: z.array(z.object({
    cliente_id: z.string().min(1, messages.validacao.campoObrigatorio),
    empresa_id: z.string().min(1, messages.validacao.campoObrigatorio),
    hora_inicio: z.string().min(1, messages.validacao.campoObrigatorio),
    hora_fim: z.string().min(1, messages.validacao.campoObrigatorio),
    
    // Financeiro do Vínculo
    valor_contrato: z.coerce.number().optional(),
    valor_aluguel: z.coerce.number().optional(),
    valor_bonus: z.coerce.number().optional(),
    ajuda_custo: z.coerce.number().optional(),
    mei: z.boolean().optional(),
  })).superRefine(checkLinkConflicts).optional().default([])
});

const motoboyFields = z.object({
    cnh_registro: z.string().min(1, messages.validacao.campoObrigatorio),
    cnh_vencimento: dateSchema(true, true),
    cnh_categoria: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_modelo: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_cor: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_ano: z.string().min(1, messages.validacao.campoObrigatorio),
    moto_placa: placaSchema.refine((val) => val.length > 0, messages.validacao.campoObrigatorio),

    cnpj: z.string().min(14, messages.validacao.campoObrigatorio),
    chave_pix: z.string().min(1, messages.validacao.campoObrigatorio),
});

const standardFields = z.object({
    cnh_registro: z.string().optional(),
    cnh_vencimento: dateSchema(false, true).optional().or(z.literal("")),
    cnh_categoria: z.string().optional(),
    moto_modelo: z.string().optional(),
    moto_cor: z.string().optional(),
    moto_ano: z.string().optional(),
    moto_placa: placaSchema.optional().or(z.literal("")),
    cnpj: z.string().optional(),
    chave_pix: z.string().optional(),
});

// Schema for Motoboy (perfil_id "3")
const motoboySchema = baseSchema.merge(motoboyFields).extend({
    perfil_id: z.literal(PERFIL_ID.MOTOBOY, {
        errorMap: () => ({ message: messages.validacao.campoObrigatorio }) 
    }),
});

// Schema for Others (perfil_id != "3")
// We ensure perfil_id is present and not "3".
const standardSchema = baseSchema.merge(standardFields).extend({
    perfil_id: z.coerce.string().min(1, messages.validacao.campoObrigatorio).refine((val) => val !== PERFIL_ID.MOTOBOY, {
        message: "Perfil inválido para schema padrão"
    }),
});

// Union: specific first, then general
export const collaboratorSchema = z.union([motoboySchema, standardSchema]);

export type CollaboratorFormData = z.infer<typeof collaboratorSchema>;
