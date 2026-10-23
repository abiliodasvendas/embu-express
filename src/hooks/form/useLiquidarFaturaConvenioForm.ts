import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  liquidarFaturaConvenioFormSchema,
  LiquidarFaturaConvenioFormData,
} from "@/schemas/liquidarFaturaConvenioSchema";
import { toLocalDateString } from "@/utils/formatters/date";

export interface UseLiquidarFaturaConvenioFormProps {
  open: boolean;
  convenioId: string;
  faturaId?: string | null;
  mesCompetencia: number;
  anoCompetencia: number;
  dataVencimento: string;
  valorTotalFatura: number;
  empresaPadraoId?: number | null;
  contaBancariaPadraoId?: string | null;
}

export function useLiquidarFaturaConvenioForm({
  open,
  convenioId,
  faturaId,
  mesCompetencia,
  anoCompetencia,
  dataVencimento,
  valorTotalFatura,
  empresaPadraoId,
  contaBancariaPadraoId,
}: UseLiquidarFaturaConvenioFormProps) {
  const form = useForm<LiquidarFaturaConvenioFormData>({
    resolver: zodResolver(liquidarFaturaConvenioFormSchema),
    defaultValues: {
      fatura_id: faturaId || null,
      convenio_id: convenioId,
      mes_competencia: mesCompetencia,
      ano_competencia: anoCompetencia,
      data_vencimento: dataVencimento,
      valor_total_fatura: valorTotalFatura,
      valor_pago: valorTotalFatura,
      data_pagamento: toLocalDateString(),
      empresa_id: empresaPadraoId || undefined,
      conta_bancaria_id: contaBancariaPadraoId || "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fatura_id: faturaId || null,
        convenio_id: convenioId,
        mes_competencia: mesCompetencia,
        ano_competencia: anoCompetencia,
        data_vencimento: dataVencimento,
        valor_total_fatura: valorTotalFatura,
        valor_pago: valorTotalFatura,
        data_pagamento: toLocalDateString(),
        empresa_id: empresaPadraoId || undefined,
        conta_bancaria_id: contaBancariaPadraoId || "",
        observacoes: "",
      });
    }
  }, [
    open,
    convenioId,
    faturaId,
    mesCompetencia,
    anoCompetencia,
    dataVencimento,
    valorTotalFatura,
    empresaPadraoId,
    contaBancariaPadraoId,
    form,
  ]);

  return { form };
}