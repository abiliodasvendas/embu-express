import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { liquidarFaturaFormSchema, LiquidarFaturaFormData } from "@/schemas/liquidarFaturaSchema";
import { toLocalDateString } from "@/utils/formatters/date";
import { FaturaCliente } from "@/types/database";

interface ContaBancariaRef {
  id: string;
  empresa_id: number;
  ativo?: boolean;
}

interface UseLiquidarFaturaFormProps {
  open: boolean;
  fatura?: FaturaCliente | null;
  contas?: ContaBancariaRef[];
}

export function useLiquidarFaturaForm({ open, fatura, contas = [] }: UseLiquidarFaturaFormProps) {
  const saldoEmAberto = fatura ? Math.max(0, Number(fatura.valor_faturado) - Number(fatura.valor_pago || 0)) : 0;

  const getContaPadraoId = () => {
    if (!fatura || contas.length === 0) return "";
    const contaEmpresa = contas.find((c) => c.ativo !== false && c.empresa_id === fatura.empresa_id);
    return contaEmpresa ? contaEmpresa.id : (contas[0]?.id || "");
  };

  const form = useForm<LiquidarFaturaFormData>({
    resolver: zodResolver(liquidarFaturaFormSchema),
    defaultValues: {
      conta_bancaria_id: getContaPadraoId(),
      data_recebimento: toLocalDateString(),
      valor_pago: saldoEmAberto,
      observacao: "",
    },
  });

  useEffect(() => {
    if (open && fatura) {
      const saldo = Math.max(0, Number(fatura.valor_faturado) - Number(fatura.valor_pago || 0));
      const contaEmpresa = contas.find((c) => c.ativo !== false && c.empresa_id === fatura.empresa_id);
      const defaultId = contaEmpresa ? contaEmpresa.id : (contas[0]?.id || "");

      form.reset({
        conta_bancaria_id: defaultId,
        data_recebimento: toLocalDateString(),
        valor_pago: saldo,
        observacao: "",
      });
    }
  }, [open, fatura, contas, form]);

  return { form };
}
