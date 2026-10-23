import { messages } from "@/constants/messages";
import { z } from "zod";
import { PERIODICIDADE_FATURAMENTO, TIPO_COBRANCA_CLIENTE } from "@/constants/financeiro.constants";

export const clientSchema = z.object({
  nome_fantasia: z.string().min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
  empresa_emissora_padrao_id: z.number().nullable().optional(),
  tipo_cobranca: z.enum([
    TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
    TIPO_COBRANCA_CLIENTE.DIARIA_MOTOBOY,
    TIPO_COBRANCA_CLIENTE.PRODUCAO_ENTREGA,
  ]).optional(),
  periodicidade: z.enum([
    PERIODICIDADE_FATURAMENTO.QUINZENAL,
    PERIODICIDADE_FATURAMENTO.MENSAL,
    PERIODICIDADE_FATURAMENTO.SEMANAL,
  ]).default(PERIODICIDADE_FATURAMENTO.QUINZENAL),
  dia_vencimento_padrao: z.number().int().min(1).max(31).optional(),
  valor_contrato_mensal: z.number().min(0, "O valor do contrato deve ser maior ou igual a zero").optional(),
  valor_base: z.number().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
