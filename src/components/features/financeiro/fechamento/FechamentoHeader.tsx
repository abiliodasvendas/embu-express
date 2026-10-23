import { Wallet } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import { meses } from "@/utils/formatters/constants";

interface FechamentoHeaderProps {
  selectedMes: number;
  selectedAno: number;
  onMesChange: (mes: number) => void;
  onAnoChange: (ano: number) => void;
}

export function FechamentoHeader({
  selectedMes,
  selectedAno,
  onMesChange,
  onAnoChange,
}: FechamentoHeaderProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Fechamento Financeiro
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ano e mês de referência para o fechamento
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <NativeSelect
          value={String(selectedMes)}
          onChange={(e) => onMesChange(Number(e.target.value))}
          className="h-11 flex-1 sm:w-[150px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
        >
          {meses.map((label, index) => (
            <option key={index + 1} value={String(index + 1)}>
              {label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(selectedAno)}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="h-11 w-[90px] sm:w-[110px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
        >
          {[anoAtual, anoAtual - 1].map((ano) => (
            <option key={ano} value={String(ano)}>
              {ano}
            </option>
          ))}
        </NativeSelect>
      </div>
    </div>
  );
}
