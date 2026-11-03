import { messages } from "@/constants/messages";
import { z } from "zod";
import { cepSchema, cnpjSchema } from "./common";
import { PERIODICIDADE_FATURAMENTO, TIPO_COBRANCA_CLIENTE } from "@/constants/financeiro.constants";

export const unidadeSchema = z.object({
  cliente_id: z.number().optional(),
  nome_unidade: z.string().min(1, messages.validacao.campoObrigatorio),
  razao_social: z.string().min(1, messages.validacao.campoObrigatorio),
  cnpj: cnpjSchema,
  cep: cepSchema.refine((val) => !!val, messages.validacao.campoObrigatorio),
  logradouro: z.string().min(1, messages.validacao.campoObrigatorio),
  numero: z.string().min(1, messages.validacao.campoObrigatorio),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(1, messages.validacao.campoObrigatorio),
  cidade: z.string().min(1, messages.validacao.campoObrigatorio),
  estado: z.string().min(2, messages.validacao.campoObrigatorio),
  km_contratados: z.coerce.number({ invalid_type_error: messages.validacao.campoObrigatorio }).min(0, messages.validacao.campoObrigatorio),
  escala_semanal: z.array(z.number()).min(1, messages.validacao.campoObrigatorio),
  ativo: z.boolean().default(true),
  valor_contrato_mensal: z.coerce.number().min(0, "O valor do contrato deve ser maior ou igual a zero").default(0),
  periodicidade: z.enum([
    PERIODICIDADE_FATURAMENTO.QUINZENAL,
    PERIODICIDADE_FATURAMENTO.MENSAL,
    PERIODICIDADE_FATURAMENTO.SEMANAL,
  ]).default(PERIODICIDADE_FATURAMENTO.QUINZENAL),
  dia_vencimento_padrao: z.coerce.number().int().min(1).max(31).default(16),
  empresa_emissora_padrao_id: z.coerce.number({ invalid_type_error: "Selecione a empresa emissora" }).positive("A empresa emissora é obrigatória"),
  conta_bancaria_padrao_id: z.string({ required_error: "Selecione a conta bancária" }).min(1, "A conta bancária é obrigatória"),
  tipo_cobranca: z.enum([
    TIPO_COBRANCA_CLIENTE.FIXO_MENSAL,
    TIPO_COBRANCA_CLIENTE.DIARIA_MOTOBOY,
    TIPO_COBRANCA_CLIENTE.PRODUCAO_ENTREGA,
  ]).default(TIPO_COBRANCA_CLIENTE.FIXO_MENSAL),
});

export type UnidadeFormData = z.infer<typeof unidadeSchema>;
