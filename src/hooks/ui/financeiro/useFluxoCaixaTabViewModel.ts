import { useState, useMemo } from "react";
import { useFluxoCaixa } from "@/hooks/api/useFluxoCaixa";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { toast } from "sonner";

export type ModoVisaoFluxo = "realizado" | "projetado";

interface UseFluxoCaixaTabViewModelProps {
  mes: number;
  ano: number;
}

export function useFluxoCaixaTabViewModel({ mes, ano }: UseFluxoCaixaTabViewModelProps) {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("todas");
  const empresaIdNumber = selectedEmpresaId === "todas" ? undefined : Number(selectedEmpresaId);

  const { data: empresas = [] } = useEmpresas();
  const {
    fluxo,
    isLoading,
    isFetching,
    isError,
    setSaldoInicialMutation,
  } = useFluxoCaixa(mes, ano, empresaIdNumber);

  const [isEditingSaldo, setIsEditingSaldo] = useState(false);
  const [saldoInput, setSaldoInput] = useState<string>("");
  const [modoVisao, setModoVisao] = useState<ModoVisaoFluxo>("realizado");

  const selectedEmpresa = useMemo(() => {
    return empresas.find((e) => String(e.id) === selectedEmpresaId);
  }, [empresas, selectedEmpresaId]);

  const diaSalariosStr = String(fluxo?.config_dias?.dia_salarios ?? 7).padStart(2, "0");
  const diaConveniosStr = String(fluxo?.config_dias?.dia_convenios ?? 15).padStart(2, "0");
  const diaValesStr = String(fluxo?.config_dias?.dia_vales ?? 20).padStart(2, "0");

  const handleSalvarSaldoInicial = async () => {
    const valor = parseFloat(saldoInput.replace(/\./g, "").replace(",", "."));
    if (isNaN(valor)) {
      toast.error("Insira um valor numérico válido");
      return;
    }

    try {
      await setSaldoInicialMutation.mutateAsync({ saldoInicial: valor });
      toast.success("Saldo inicial consolidado atualizado com sucesso!");
      setIsEditingSaldo(false);
    } catch {
      toast.error("Erro ao atualizar saldo inicial");
    }
  };

  return {
    selectedEmpresaId,
    setSelectedEmpresaId,
    selectedEmpresa,
    empresas,
    fluxo,
    isLoading,
    isFetching,
    isError,
    isEditingSaldo,
    setIsEditingSaldo,
    saldoInput,
    setSaldoInput,
    modoVisao,
    setModoVisao,
    diaSalariosStr,
    diaConveniosStr,
    diaValesStr,
    isSavingSaldo: setSaldoInicialMutation.isPending,
    handleSalvarSaldoInicial,
  };
}
