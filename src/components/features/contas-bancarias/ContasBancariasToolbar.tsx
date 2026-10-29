import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSearchInput } from "@/components/ui/TableSearchInput";
import { Empresa } from "@/types/database";
import { meses } from "@/utils/formatters/constants";
import { TipoContaFiltro } from "@/hooks/ui/contas-bancarias/useContasBancariasViewModel";
import { Plus } from "lucide-react";

interface ContasBancariasToolbarProps {
  busca: string;
  onBuscaChange: (busca: string) => void;
  mes: number;
  onMesChange: (mes: number) => void;
  ano: number;
  onAnoChange: (ano: number) => void;
  empresaId: number | null;
  onEmpresaChange: (id: number | null) => void;
  tipoConta: TipoContaFiltro;
  onTipoContaChange: (tipo: TipoContaFiltro) => void;
  empresas: Empresa[];
  onNovaConta: () => void;
  canEdit?: boolean;
}

export function ContasBancariasToolbar({
  busca,
  onBuscaChange,
  mes,
  onMesChange,
  ano,
  onAnoChange,
  empresaId,
  onEmpresaChange,
  tipoConta,
  onTipoContaChange,
  empresas,
  onNovaConta,
  canEdit = true,
}: ContasBancariasToolbarProps) {
  const anoAtual = new Date().getFullYear();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
        <TableSearchInput
          value={busca}
          onChange={onBuscaChange}
          placeholder="Buscar banco, agência, conta ou empresa..."
          className="w-full sm:w-64"
        />

        <NativeSelect
          value={String(mes)}
          onChange={(e) => onMesChange(Number(e.target.value))}
          className="h-10 w-[130px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          {meses.map((m, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={String(ano)}
          onChange={(e) => onAnoChange(Number(e.target.value))}
          className="h-10 w-[90px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
            <option key={a} value={String(a)}>
              {a}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={empresaId ? String(empresaId) : "todas"}
          onChange={(e) =>
            onEmpresaChange(e.target.value === "todas" ? null : Number(e.target.value))
          }
          className="h-10 w-[180px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="todas">Todas as Empresas</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={String(emp.id)}>
              {emp.nome_fantasia || emp.razao_social}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          value={tipoConta}
          onChange={(e) => onTipoContaChange(e.target.value as TipoContaFiltro)}
          className="h-10 w-[140px] rounded-[14px] bg-card border-border shadow-xs text-xs font-medium"
        >
          <option value="TODOS">Todos os Tipos</option>
          <option value="CORRENTE">Conta Corrente</option>
          <option value="POUPANCA">Poupança</option>
          <option value="PAGAMENTO">Pagamento</option>
          <option value="INVESTIMENTO">Investimento</option>
        </NativeSelect>
      </div>

      {canEdit && (
        <Button
          size="sm"
          onClick={onNovaConta}
          className="h-10 rounded-[14px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold px-4 gap-2 shadow-xs transition-all active:scale-95 text-xs shrink-0 cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Conta Bancária</span>
        </Button>
      )}
    </div>
  );
}
