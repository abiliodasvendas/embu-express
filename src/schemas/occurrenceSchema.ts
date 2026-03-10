import { messages } from "@/constants/messages";
import { z } from "zod";

export const occurrenceSchema = z.object({
    colaborador_id: z.string().min(1, messages.validacao.campoObrigatorio),
    colaborador_cliente_id: z.string().optional().nullable(),
    tipo_id: z.string().min(1, messages.validacao.campoObrigatorio),
    data_ocorrencia: z.string().min(1, messages.validacao.campoObrigatorio),
    valor: z.coerce.number().min(0).default(0),
    impacto_financeiro: z.boolean().default(false),
    tipo_lancamento: z.enum(['ENTRADA', 'SAIDA']).optional().nullable(),
    observacao: z.string().min(1, messages.validacao.campoObrigatorio),
}).superRefine((data, ctx) => {
    if (data.impacto_financeiro) {
        if (!data.valor || data.valor <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.validacao.campoObrigatorio,
                path: ["valor"],
            });
        }
        if (!data.tipo_lancamento) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: messages.validacao.campoObrigatorio,
                path: ["tipo_lancamento"],
            });
        }
    }
});

export type OccurrenceFormData = z.infer<typeof occurrenceSchema>;
