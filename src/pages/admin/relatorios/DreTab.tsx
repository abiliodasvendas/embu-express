import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { useDRE } from "@/hooks/api/useDRE";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { DreSkeleton } from "@/components/features/relatorios/dre/DreSkeleton";
import { DreHeader } from "@/components/features/relatorios/dre/DreHeader";
import { DreKpiCards } from "@/components/features/relatorios/dre/DreKpiCards";
import { DreDemonstrativoCorpo } from "@/components/features/relatorios/dre/DreDemonstrativoCorpo";

interface DreTabProps {
  mes: number;
  ano: number;
}

export function DreTab({ mes, ano }: DreTabProps) {
  const { openDespesaFormDialog } = useLayout();
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>("todas");
  const [modoVisao, setModoVisao] = useState<"realizado" | "projetado">("projetado");
  const empresaIdNumber = selectedEmpresaId === "todas" ? undefined : Number(selectedEmpresaId);

  const { data: empresas = [] } = useEmpresas();
  const { data: dre, isLoading, isError, refetch } = useDRE(mes, ano, empresaIdNumber, modoVisao);

  if (isLoading) {
    return <DreSkeleton />;
  }

  if (isError || !dre) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-[18px] bg-card border-border">
        <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
        <p className="font-semibold text-sm text-foreground">
          Erro ao carregar o DRE da competência selecionada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DreHeader
        empresaNome={dre.empresa_nome}
        modoVisao={modoVisao}
        onModoVisaoChange={setModoVisao}
        selectedEmpresaId={selectedEmpresaId}
        onEmpresaChange={setSelectedEmpresaId}
        empresas={empresas}
        onNovaDespesa={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
      />

      <DreKpiCards dre={dre} modoVisao={modoVisao} />

      <DreDemonstrativoCorpo
        dre={dre}
        modoVisao={modoVisao}
        onLancarDespesa={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
      />
    </div>
  );
}

export default DreTab;
