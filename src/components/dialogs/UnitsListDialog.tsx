import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, MapPinned, Zap } from "lucide-react";
import { useState } from "react";
import { Unidade } from "@/types/database";
import { cn } from "@/lib/utils";
import { ScaleIndicators } from "@/components/common/ScaleIndicators";
import { cnpjMask } from "@/utils/masks";
import { safeCloseDialog } from "@/utils/dialogUtils";

interface UnitsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unidades: Unidade[];
  onEdit?: (unidade: Unidade) => void;
  onNavigate?: (unidadeId: number) => void;
}

export function UnitsListDialog({
  open,
  onOpenChange,
  unidades,
  onNavigate,
}: UnitsListDialogProps) {
  const [search, setSearch] = useState("");

  const filtered = unidades.filter((u) => {
    const s = search.toLowerCase();
    return (
      u.nome_unidade.toLowerCase().includes(s) ||
      u.cnpj?.includes(s) ||
      u.cidade?.toLowerCase().includes(s) ||
      u.bairro?.toLowerCase().includes(s)
    );
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) safeCloseDialog(() => onOpenChange(false));
      }}
      maxWidth="4xl"
      description="Listagem de todas as unidades e filiais do cliente"
    >
      <BaseDialog.Header
        title="Todas as Unidades / Filiais"
        subtitle="Consulte e acesse as filiais vinculadas"
        icon={<MapPinned className="h-5 w-5" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="p-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por nome, CNPJ, cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
          />
        </div>

        <div className="border border-border rounded-[18px] overflow-hidden bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Unidade</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Endereço</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">KM</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Escala</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground text-sm">
                    Nenhuma unidade encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((unidade) => (
                  <TableRow
                    key={unidade.id}
                    className="border-border hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => {
                      safeCloseDialog(() => onOpenChange(false));
                      onNavigate?.(unidade.id);
                    }}
                  >
                    <TableCell>
                      <div>
                        <span className="font-bold text-sm text-foreground">{unidade.nome_unidade}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          CNPJ: {cnpjMask(unidade.cnpj)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground capitalize max-w-xs">
                        {unidade.logradouro?.toLowerCase()}, {unidade.numero}
                        {unidade.complemento && ` - ${unidade.complemento}`}.
                        {" "}{unidade.bairro?.toLowerCase()}, {unidade.cidade?.toLowerCase()} - {unidade.estado}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-foreground">
                        <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold">{unidade.km_contratados || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <ScaleIndicators
                          activeDays={unidade.escala_semanal || []}
                          variant="light"
                          size="xs"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
