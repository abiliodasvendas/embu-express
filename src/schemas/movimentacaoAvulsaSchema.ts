import { z } from "zod";
import { TIPO_MOVIMENTACAO_AVULSA } from "@/constants/financeiro.constants";

export const movimentacaoAvulsaFormSchema = z.object({
  tipo_movimentacao: z.enum([
    TIPO_MOVIMENTACAO_AVULSA.ENTRADA,
    TIPO_MOVIMENTACAO_AVULSA.SAIDA,
  ]),
  empresa_id: z.coerce.number({
    required_error: "Selecione a empresa",
    invalid_type_error: "Selecione a empresa",
  }).min(1, "Selecione a empresa"),
  conta_bancaria_id: z.string().optional(),
  categoria: z.string().min(1, "Selecione a categoria"),
  descricao: z.string().min(2, "Informe a descrição do lançamento"),
  valor: z.coerce.number({
    required_error: "Informe o valor",
    invalid_type_error: "Informe o valor",
  }).min(0.01, "O valor deve ser maior que zero"),
  data_movimentacao: z.string().min(1, "Informe a data da operação"),
});

export type MovimentacaoAvulsaFormData = z.infer<typeof movimentacaoAvulsaFormSchema>;
