import { AlertCircle } from "lucide-react";
import { useFluxoCaixaTabViewModel } from "@/hooks";
import {
  FluxoCaixaSkeleton,
  FluxoCaixaHeader,
  FluxoCaixaKpiCards,
  FluxoCaixaMarcosSection,
  FluxoCaixaLiquidezChart,
  FluxoCaixaDetalhamentoCard,
} from "@/components/features/financeiro/fluxo-caixa";

interface FluxoCaixaTabProps {
  mes: number;
  ano: number;
}

export function FluxoCaixaTab({ mes, ano }: FluxoCaixaTabProps) {
  const {
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
    setSaldoInput,
    modoVisao,
    setModoVisao,
    diaSalariosStr,
    diaConveniosStr,
    diaValesStr,
    isSavingSaldo,
    handleSalvarSaldoInicial,
  } = useFluxoCaixaTabViewModel({ mes, ano });

  if (isLoading) {
    return <FluxoCaixaSkeleton />;
  }

  if (isError || !fluxo) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-[18px] bg-card border-border">
        <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
        <p className="font-semibold text-sm text-foreground">
          Erro ao carregar projeção de fluxo de caixa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FluxoCaixaHeader
        selectedEmpresaId={selectedEmpresaId}
        setSelectedEmpresaId={setSelectedEmpresaId}
        selectedEmpresa={selectedEmpresa}
        empresas={empresas}
      />

      <FluxoCaixaKpiCards
        fluxo={fluxo}
        isEditingSaldo={isEditingSaldo}
        setIsEditingSaldo={setIsEditingSaldo}
        setSaldoInput={setSaldoInput}
        isSavingSaldo={isSavingSaldo}
        onSalvarSaldoInicial={handleSalvarSaldoInicial}
        diaSalariosStr={diaSalariosStr}
        diaConveniosStr={diaConveniosStr}
      />

      <FluxoCaixaMarcosSection
        diaSalariosStr={diaSalariosStr}
        diaConveniosStr={diaConveniosStr}
        diaValesStr={diaValesStr}
      />

      <FluxoCaixaLiquidezChart
        curvaDiaria={fluxo.curva_diaria}
        isFetching={isFetching}
      />

      <FluxoCaixaDetalhamentoCard
        curvaDiaria={fluxo.curva_diaria}
        modoVisao={modoVisao}
        setModoVisao={setModoVisao}
        isFetching={isFetching}
      />
    </div>
  );
}
