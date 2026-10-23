import { z } from "zod";
import { STATUS_FATURA, TIPO_PERIODO_FATURA } from "@/constants/financeiro.constants";

export const faturaFormSchema = z.object({
  cliente_id: z.coerce.number({
    required_error: "Selecione o cliente",
    invalid_type_error: "Selecione o cliente",
  }).min(1, "Selecione o cliente"),
  empresa_id: z.coerce.number({
    required_error: "Selecione o CNPJ emissor",
    invalid_type_error: "Selecione o CNPJ emissor",
  }).min(1, "Selecione o CNPJ emissor"),
  mes_competencia: z.coerce.number().min(1).max(12),
  ano_competencia: z.coerce.number().min(2020).max(2100),
  tipo_periodo: z.nativeEnum(TIPO_PERIODO_FATURA).default(TIPO_PERIODO_FATURA.QUINZENAL),
  numero_periodo: z.coerce.number().min(1).default(1),
  data_emissao: z.string().min(1, "Informe a data de emissão"),
  data_vencimento: z.string().min(1, "Informe a data de vencimento"),
  valor_faturado: z.coerce.number({
    required_error: "Informe o valor faturado",
    invalid_type_error: "Informe o valor faturado",
  }).min(0.01, "O valor faturado deve ser maior que zero"),
  status: z.nativeEnum(STATUS_FATURA).default(STATUS_FATURA.PENDENTE),
  numero_os: z.string().trim().optional(),
  observacoes: z.string().optional(),
});

export type FaturaFormData = z.infer<typeof faturaFormSchema>;
