import { z } from "zod";

export const perfilSchema = z.object({
    id: z.string().optional(),
    nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(50, "Nome muito extenso"),
    descricao: z.string().max(255, "Descrição muito extensa").optional(),
    permissoes: z.array(z.number()).default([])
});

export type PerfilFormData = z.infer<typeof perfilSchema>;
