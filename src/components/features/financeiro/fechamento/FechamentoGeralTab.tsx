import {
  useFechamentoGeralViewModel,
} from "@/hooks/ui/financeiro";
import { FechamentoGeralKpis } from "./FechamentoGeralKpis";
import { FechamentoGeralToolbar } from "./FechamentoGeralToolbar";
import { FechamentoGeralTable } from "./FechamentoGeralTable";

interface FechamentoGeralTabProps {
  selectedMes: number;
  selectedAno: number;
  onSelectColaborador: (colaboradorId: string) => void;
}

export function FechamentoGeralTab({
  selectedMes,
  selectedAno,
  onSelectColaborador,
}: FechamentoGeralTabProps) {
  const vm = useFechamentoGeralViewModel({ selectedMes, selectedAno });

  return (
    <div className="space-y-6">
      <FechamentoGeralKpis
        estatisticas={vm.estatisticas}
        isLoading={vm.isGlobalLoading}
      />

      <FechamentoGeralToolbar
        adiantamentoFilter={vm.adiantamentoFilter}
        onAdiantamentoFilterChange={vm.setAdiantamentoFilter}
        fechamentoFilter={vm.fechamentoFilter}
        onFechamentoFilterChange={vm.setFechamentoFilter}
      />

      <FechamentoGeralTable
        colaboradores={vm.colaboradoresFiltrados}
        isLoading={vm.isGlobalLoading}
        hasData={vm.statusGeral.length > 0}
        onSelectColaborador={onSelectColaborador}
      />
    </div>
  );
}
