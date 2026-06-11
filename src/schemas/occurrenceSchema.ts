import { messages } from "@/constants/messages";
import { LANCAMENTO_TIPO } from "@/constants/financeiro.constants";
import { z } from "zod";

const baseSchema = {
    colaborador_id: z.string({ required_error: messages.validacao.campoObrigatorio }),
    tipo_id: z.string({ required_error: messages.validacao.campoObrigatorio }),
    data_ocorrencia: z.string({ required_error: messages.validacao.campoObrigatorio }),
    observacao: z.string({ required_error: messages.validacao.campoObrigatorio }),
    colaborador_cliente_id: z.string().nullable().optional(),
};

export const occurrenceSchema = z.object({
    ...baseSchema,
    impacto_financeiro: z.boolean(),
    valor: z.coerce.number().optional().nullable(),
    tipo_lancamento: z.enum([LANCAMENTO_TIPO.ENTRADA, LANCAMENTO_TIPO.SAIDA]).optional().nullable(),
    is_parcelado: z.boolean().optional().default(false),
    quantidade_parcelas: z.coerce.number().optional().nullable(),
}).superRefine((data, ctx) => {
    // Validações base (movidas para cá para garantir que o superRefine sempre rode)
    if (!data.colaborador_id || data.colaborador_id.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["colaborador_id"] });
    }
    if (!data.tipo_id || data.tipo_id.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["tipo_id"] });
    }
    if (!data.data_ocorrencia || data.data_ocorrencia.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["data_ocorrencia"] });
    }
    if (!data.observacao || data.observacao.trim() === "") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["observacao"] });
    }
    if (data.colaborador_cliente_id === undefined) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["colaborador_cliente_id"] });
    }

    // Validações financeiras
    if (data.impacto_financeiro) {
        if (data.valor === undefined || data.valor === null || data.valor < 0.01) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["valor"] });
        }
        if (!data.tipo_lancamento) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: messages.validacao.campoObrigatorio, path: ["tipo_lancamento"] });
        }
        if (data.is_parcelado && (!data.quantidade_parcelas || data.quantidade_parcelas < 2)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a quantidade de parcelas (mín. 2)", path: ["quantidade_parcelas"] });
        }
    }
});

export type OccurrenceFormData = z.infer<typeof occurrenceSchema>;
