import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MESES_ANO } from "@/hooks/ui/aniversariantes/useAniversariantesViewModel";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface AniversariantesHeaderProps {
  mesSelecionado: number;
  mesAtual: number;
  termoBusca: string;
  onSelectMes: (mes: number) => void;
  onMesAnterior: () => void;
  onProximoMes: () => void;
  onVoltarMesAtual: () => void;
  onBuscaChange: (value: string) => void;
}

export function AniversariantesHeader({
  mesSelecionado,
  mesAtual,
  termoBusca,
  onSelectMes,
  onMesAnterior,
  onProximoMes,
  onVoltarMesAtual,
  onBuscaChange,
}: AniversariantesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
          Aniversariantes
        </h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe os aniversariantes ativos por mês e complete cadastros sem data.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1 sm:w-56">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={termoBusca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar colaborador..."
            className="pl-9 rounded-[18px] bg-card border-border shadow-xs focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onMesAnterior}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Select
            value={String(mesSelecionado)}
            onValueChange={(value) => onSelectMes(Number(value))}
          >
            <SelectTrigger className="w-36 rounded-[18px] bg-white border-[#e5e5e5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESES_ANO.map((mes) => (
                <SelectItem key={mes.value} value={String(mes.value)}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onProximoMes}
            aria-label="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {mesSelecionado !== mesAtual && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onVoltarMesAtual}
            >
              Mês atual
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
