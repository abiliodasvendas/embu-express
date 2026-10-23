import { Bike, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { meses } from "@/utils/formatters/constants";

interface RetaguardaHeaderProps {
  mes: number;
  setMes: (mes: number) => void;
  ano: number;
  setAno: (ano: number) => void;
  anoAtual: number;
  canAlocar: boolean;
  onRegistrarCobertura: () => void;
}

export function RetaguardaHeader({
  mes,
  setMes,
  ano,
  setAno,
  anoAtual,
  canAlocar,
  onRegistrarCobertura,
}: RetaguardaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-[14px] bg-muted/70 text-foreground border border-border flex items-center justify-center shrink-0">
          <Bike className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Retaguarda Operacional & Risco de Folha
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Acompanhamento de coberturas por equipe interna e previsão de risco nos vales do dia 20
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          value={String(mes)}
          onChange={(e) => setMes(Number(e.target.value))}
          className="h-11 w-[140px] sm:w-[150px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
        >
          {meses.map((label, index) => (
            <option key={index + 1} value={String(index + 1)}>
              {label}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(ano)}
          onChange={(e) => setAno(Number(e.target.value))}
          className="h-11 w-[90px] sm:w-[110px] rounded-[18px] bg-card border-border shadow-xs text-xs sm:text-sm font-semibold"
        >
          {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
            <option key={a} value={String(a)}>
              {a}
            </option>
          ))}
        </NativeSelect>

        {canAlocar && (
          <Button
            onClick={onRegistrarCobertura}
            className="h-11 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Cobertura</span>
          </Button>
        )}
      </div>
    </div>
  );
}
