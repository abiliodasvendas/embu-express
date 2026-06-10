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
});

export type LancamentoConvenioFormValues = z.infer<typeof lancamentoConvenioSchema>;
