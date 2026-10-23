import { z } from "zod";
import { CATEGORIA_DESPESA, STATUS_DESPESA } from "@/constants/financeiro.constants";

export const despesaFormSchema = z.object({
  descricao: z.string({
    required_error: "Informe a descrição da conta",
  }).min(2, "Informe a descrição da conta"),
  categoria: z.nativeEnum(CATEGORIA_DESPESA, {
    required_error: "Selecione a categoria de despesa",
  }),
  empresa_id: z.string().default("holding"),
  is_holding: z.boolean().default(true),
  mes_competencia: z.coerce.number().min(1).max(12),
  ano_competencia: z.coerce.number().min(2020).max(2100),
  data_vencimento: z.string().min(1, "Informe a data de vencimento"),
  valor_previsto: z.coerce.number({
    required_error: "Informe o valor previsto",
    invalid_type_error: "Informe o valor previsto",
  }).min(0.01, "O valor previsto deve ser maior que zero"),
  status: z.nativeEnum(STATUS_DESPESA).default(STATUS_DESPESA.PENDENTE),
  valor_pago: z.coerce.number().optional().default(0),
  data_pagamento: z.string().optional(),
  is_parcelado: z.boolean().default(false),
  quantidade_parcelas: z.coerce.number().min(2, "Mínimo 2 parcelas").max(60).optional(),
  is_recorrente: z.boolean().default(false),
  meses_recorrencia: z.coerce.number().min(2).max(36).optional(),
});

export type DespesaFormData = z.infer<typeof despesaFormSchema>;
