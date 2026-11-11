import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { useDRE } from "@/hooks/api/useDRE";
import { useEmpresas } from "@/hooks/api/useEmpresas";
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
  const [modoVisao, setModoVisao] = useState<"realizado" | "projetado">("realizado");
  const empresaIdNumber = selectedEmpresaId === "todas" ? undefined : Number(selectedEmpresaId);

  const { data: empresas = [] } = useEmpresas();
  const { data: dre, isLoading, isFetching, isError, refetch } = useDRE(
    mes,
    ano,
    empresaIdNumber,
    modoVisao
  );

  const showSkeleton = isLoading || isFetching;
  const selectedEmpresaNome =
    selectedEmpresaId === "todas"
      ? "Consolidado (Holding)"
      : empresas.find((e) => String(e.id) === selectedEmpresaId)?.nome_fantasia ||
        "Empresa Selecionada";

  return (
    <div className="space-y-6">
      <DreHeader
        empresaNome={dre?.empresa_nome || selectedEmpresaNome}
        modoVisao={modoVisao}
        onModoVisaoChange={setModoVisao}
        selectedEmpresaId={selectedEmpresaId}
        onEmpresaChange={setSelectedEmpresaId}
        empresas={empresas}
        onNovaDespesa={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
      />

      <DreKpiCards dre={dre} modoVisao={modoVisao} isLoading={showSkeleton} />

      {isError && !showSkeleton ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border rounded-[18px] bg-card border-border">
          <AlertCircle className="w-10 h-10 mb-2 text-destructive" />
          <p className="font-semibold text-sm text-foreground">
            Erro ao carregar o DRE da competência selecionada.
          </p>
        </div>
      ) : (
        <DreDemonstrativoCorpo
          dre={dre}
          modoVisao={modoVisao}
          isLoading={showSkeleton}
          onLancarDespesa={() => openDespesaFormDialog({ onSuccess: () => refetch() })}
        />
      )}
    </div>
  );
}

export default DreTab;
