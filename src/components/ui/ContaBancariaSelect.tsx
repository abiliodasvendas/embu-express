import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContaBancaria } from "@/types/database";
import { cn } from "@/lib/utils";

interface ContaBancariaSelectProps {
  contas: ContaBancaria[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
}

export function ContaBancariaSelect({
  contas,
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione a conta bancária pagadora...",
  className,
  hasError = false,
}: ContaBancariaSelectProps) {
  const selectedConta = contas.find((c) => c.id === value);

  return (
    <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-auto min-h-11 py-2 rounded-[18px] text-left",
          hasError && "border-destructive focus:border-destructive bg-destructive/5",
          className
        )}
      >
        {selectedConta ? (
          <div className="flex flex-col text-left leading-tight">
            <span className="font-semibold text-xs sm:text-sm text-foreground">
              {selectedConta.banco_nome} • Ag: {selectedConta.agencia || "S/A"} • Cc: {selectedConta.conta || "S/C"}
            </span>
            <span className="text-[11px] text-muted-foreground font-normal">
              {selectedConta.empresa?.nome_fantasia ||
                selectedConta.empresa?.razao_social ||
                "Empresa"}
            </span>
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent className="rounded-[18px]">
        {contas.map((conta) => {
          const empresaNome =
            conta.empresa?.nome_fantasia ||
            conta.empresa?.razao_social ||
            "Empresa";

          return (
            <SelectItem
              key={conta.id}
              value={conta.id}
              className="rounded-[12px] py-2 cursor-pointer"
            >
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-xs sm:text-sm text-foreground">
                  {conta.banco_nome} • Ag: {conta.agencia || "S/A"} • Cc: {conta.conta || "S/C"}
                </span>
                <span className="text-[11px] text-muted-foreground font-normal mt-0.5">
                  {empresaNome}
                </span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
