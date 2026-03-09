import { messages } from "@/constants/messages";
import { z } from "zod";

export const occurrenceSchema = z.object({
    colaborador_id: z.string().min(1, messages.validacao.campoObrigatorio),
    colaborador_cliente_id: z.string().optional().nullable(),
    tipo_id: z.string().min(1, messages.validacao.campoObrigatorio),
    data_ocorrencia: z.string().min(1, messages.validacao.campoObrigatorio),
    valor: z.coerce.number().min(0, "O valor não pode ser negativo").optional().default(0),
    impacto_financeiro: z.boolean().default(false),
    tipo_lancamento: z.enum(['ENTRADA', 'SAIDA']).default('SAIDA'),
    observacao: z.string().optional(),
});

export type OccurrenceFormData = z.infer<typeof occurrenceSchema>;
