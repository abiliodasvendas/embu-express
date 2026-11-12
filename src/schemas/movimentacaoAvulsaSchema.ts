import { z } from "zod";
import {
  MODO_LANCAMENTO_AVULSO,
  ModoLancamentoAvulsoType,
  TIPO_MOVIMENTACAO_AVULSA,
} from "@/constants/financeiro.constants";

export type ModoLancamentoAvulso = ModoLancamentoAvulsoType;

export const movimentacaoAvulsaFormSchema = z
  .object({
    modo_lancamento: z
      .enum([
        MODO_LANCAMENTO_AVULSO.ENTRADA,
        MODO_LANCAMENTO_AVULSO.SAIDA,
        MODO_LANCAMENTO_AVULSO.TRANSFERENCIA,
      ])
      .default(MODO_LANCAMENTO_AVULSO.ENTRADA),
    tipo_movimentacao: z.enum([
      TIPO_MOVIMENTACAO_AVULSA.ENTRADA,
      TIPO_MOVIMENTACAO_AVULSA.SAIDA,
    ]),
    empresa_id: z.coerce.number().optional().default(0),
    conta_bancaria_id: z.string().optional().default("none"),
    conta_destino_id: z.string().optional().default(""),
    categoria: z.string().optional().default(""),
    descricao: z.string().optional().default(""),
    valor: z.coerce
      .number({
        required_error: "Informe o valor",
        invalid_type_error: "Informe o valor",
      })
      .min(0.01, "O valor deve ser maior que zero"),
    data_movimentacao: z.string().min(1, "Informe a data da operação"),
  })
  .superRefine((data, ctx) => {
    if (data.modo_lancamento === MODO_LANCAMENTO_AVULSO.TRANSFERENCIA) {
      if (!data.conta_bancaria_id || data.conta_bancaria_id === "none") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["conta_bancaria_id"],
          message: "Selecione a conta bancária de origem",
        });
      }
      if (!data.conta_destino_id || data.conta_destino_id === "none") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["conta_destino_id"],
          message: "Selecione a conta bancária de destino",
        });
      }
      if (
        data.conta_bancaria_id &&
        data.conta_destino_id &&
        data.conta_bancaria_id !== "none" &&
        data.conta_bancaria_id === data.conta_destino_id
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["conta_destino_id"],
          message: "A conta de destino deve ser diferente da conta de origem",
        });
      }
    } else {
      if (!data.empresa_id || data.empresa_id < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["empresa_id"],
          message: "Selecione a empresa",
        });
      }
      if (!data.categoria || !data.categoria.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoria"],
          message: "Selecione a categoria",
        });
      }
      if (!data.descricao || data.descricao.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["descricao"],
          message: "Informe a descrição do lançamento",
        });
      }
    }
  });

export type MovimentacaoAvulsaFormData = z.infer<typeof movimentacaoAvulsaFormSchema>;
