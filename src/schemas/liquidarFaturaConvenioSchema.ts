import { z } from "zod";

export const liquidarFaturaConvenioFormSchema = z.object({
  fatura_id: z.string().optional().nullable(),
  convenio_id: z.string().min(1, "ID do convênio obrigatório"),
  mes_competencia: z.coerce.number().min(1).max(12),
  ano_competencia: z.coerce.number().min(2020),
  data_vencimento: z.string().min(10, "Data de vencimento inválida"),
  valor_total_fatura: z.coerce.number().min(0.01, "Valor da fatura deve ser maior que zero"),
  valor_pago: z.coerce.number().min(0.01, "Valor pago deve ser maior que zero"),
  data_pagamento: z.string().min(10, "Data de pagamento inválida"),
  empresa_id: z.coerce.number().positive("Selecione a empresa pagadora"),
  conta_bancaria_id: z.string().min(1, "Selecione a conta bancária"),
  observacoes: z.string().optional().nullable(),
});

export type LiquidarFaturaConvenioFormData = z.infer<typeof liquidarFaturaConvenioFormSchema>;