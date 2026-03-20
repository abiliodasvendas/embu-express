import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { DIAS_SEMANA } from "@/utils/formatters/constants";
import { cnpjMask } from "@/utils/masks";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <MapPinned className="h-6 w-6 text-primary" />
            Todas as Unidades / Filiais
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CNPJ, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white transition-all shadow-none"
            />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4">
          <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-gray-100 hover:bg-transparent">
                  <TableHead className="font-bold text-gray-500">Unidade</TableHead>
                  <TableHead className="font-bold text-gray-500">Endereço</TableHead>
                  <TableHead className="font-bold text-gray-500">KM</TableHead>
                  <TableHead className="font-bold text-gray-500 text-right">Escala</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                      Nenhuma unidade encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((unidade) => (
                    <TableRow
                      key={unidade.id}
                      className="border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => onNavigate?.(unidade.id)}
                    >
                      <TableCell>
                        <div>
                          <span className="font-bold text-gray-800">{unidade.nome_unidade}</span>
                          <p className="text-xs text-gray-400 mt-0.5">
                            CNPJ: {cnpjMask(unidade.cnpj)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-gray-600 capitalize max-w-xs">
                          {unidade.logradouro?.toLowerCase()}, {unidade.numero}
                          {unidade.complemento && ` - ${unidade.complemento}`}.
                          {" "}{unidade.bairro?.toLowerCase()}, {unidade.cidade?.toLowerCase()} - {unidade.estado}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-bold">{unidade.km_contratados || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {DIAS_SEMANA.map((day) => {
                            const isActive = unidade.escala_semanal?.includes(day.id);
                            return (
                              <div
                                key={day.id}
                                className={cn(
                                  "w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold",
                                  isActive
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-400",
                                )}
                              >
                                {day.label.substring(0, 1)}
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
