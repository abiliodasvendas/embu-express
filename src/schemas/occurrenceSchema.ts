import { messages } from "@/constants/messages";
import { z } from "zod";

const baseSchema = {
    colaborador_id: z.string({ required_error: messages.validacao.campoObrigatorio })
        .min(1, messages.validacao.campoObrigatorio),
    tipo_id: z.string({ required_error: messages.validacao.campoObrigatorio })
        .min(1, messages.validacao.campoObrigatorio),
    data_ocorrencia: z.string({ required_error: messages.validacao.campoObrigatorio })
        .min(1, messages.validacao.campoObrigatorio),
    observacao: z.string({ required_error: messages.validacao.campoObrigatorio })
        .min(1, messages.validacao.campoObrigatorio),
};

export const occurrenceSchema = z.discriminatedUnion("impacto_financeiro", [
    z.object({
        ...baseSchema,
        impacto_financeiro: z.literal(true),
        valor: z.coerce.number({ required_error: messages.validacao.campoObrigatorio })
            .min(0.01, messages.validacao.campoObrigatorio),
        tipo_lancamento: z.enum(['ENTRADA', 'SAIDA'], { 
            required_error: messages.validacao.campoObrigatorio,
            invalid_type_error: messages.validacao.campoObrigatorio 
        }),
        colaborador_cliente_id: z.string({ required_error: messages.validacao.campoObrigatorio })
            .min(1, messages.validacao.campoObrigatorio),
    }),
    z.object({
        ...baseSchema,
        impacto_financeiro: z.literal(false),
        valor: z.coerce.number().optional().default(0),
        tipo_lancamento: z.enum(['ENTRADA', 'SAIDA']).optional().nullable(),
        colaborador_cliente_id: z.string().optional().nullable(),
    })
]);

export type OccurrenceFormData = z.infer<typeof occurrenceSchema>;
