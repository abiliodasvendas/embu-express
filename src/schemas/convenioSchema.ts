import { z } from "zod";

export const convenioSchema = z.object({
  nome: z.string().min(2, "O nome do convênio deve ter pelo menos 2 caracteres"),
  ativo: z.boolean().default(true),
});

export type ConvenioFormValues = z.infer<typeof convenioSchema>;

export const lancamentoConvenioSchema = z.object({
  colaborador_id: z.string().min(1, "Selecione o colaborador"),
  data_lancamento: z.string().min(10, "Data inválida"),
  valor: z.number({ invalid_type_error: "Insira um valor válido" }).min(0.01, "O valor deve ser maior que zero"),
  descricao: z.string().min(1, "A descrição é obrigatória"),
  moto_embu: z.boolean().default(false),
  is_parcelado: z.boolean().optional().default(false),
  quantidade_parcelas: z.coerce.number().min(2, "A quantidade mínima de parcelas é 2").optional().nullable(),
}).superRefine((data, ctx) => {
    if (data.is_parcelado && (!data.quantidade_parcelas || data.quantidade_parcelas < 2)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe a quantidade de parcelas (mín. 2)",
            path: ["quantidade_parcelas"],
        });
    }
});

export type LancamentoConvenioFormValues = z.infer<typeof lancamentoConvenioSchema>;
