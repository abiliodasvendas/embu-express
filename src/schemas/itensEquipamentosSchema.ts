import { z } from "zod";

export const categoriaItemSchema = z.object({
  nome: z.string().min(2, "O nome da categoria deve ter pelo menos 2 caracteres"),
});

export const itemEquipamentoSchema = z.object({
  nome: z.string().min(2, "O nome do item deve ter pelo menos 2 caracteres"),
  categoria_id: z.coerce
    .number({ required_error: "A categoria é obrigatória", invalid_type_error: "A categoria é obrigatória" })
    .positive("A categoria é obrigatória"),
  ativo: z.boolean().optional().default(true),
});

export const associarItemSchema = z.object({
  colaborador_id: z.string({
    required_error: "Selecione um colaborador válido",
  }).uuid("Selecione um colaborador válido"),
  itens_ids: z.array(z.number().int()).min(1, "Selecione ao menos um item para alocar"),
  observacao: z.string().optional().nullable(),
});
