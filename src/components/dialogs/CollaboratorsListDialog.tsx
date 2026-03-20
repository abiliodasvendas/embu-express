import { StatusBadge } from "@/components/common/StatusBadge";
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
import { Unidade, Usuario } from "@/types/database";
import { Building2, Clock, Search, User } from "lucide-react";
import { useState } from "react";

interface CollaboratorsListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaborators: Usuario[];
  unidades: Unidade[];
  clientId: string;
}

export function CollaboratorsListDialog({
  open,
  onOpenChange,
  collaborators,
  unidades,
  clientId,
}: CollaboratorsListDialogProps) {
  const [search, setSearch] = useState("");

  const allLinks = collaborators.flatMap((collab) => {
    const links = collab.links?.filter(l => l.cliente_id?.toString() === clientId) || [];
    return links.map(link => ({
      ...link,
      colaborador: collab
    }));
  });

  const filteredLinks = allLinks.filter((link) => {
    const searchLower = search.toLowerCase();
    const unit = unidades.find(u => u.id === link.unidade_id);
    return (
      link.colaborador.nome_completo.toLowerCase().includes(searchLower) ||
      unit?.nome_unidade.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Todos os Colaboradores / Turnos
          </DialogTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou unidade..."
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
                  <TableHead className="font-bold text-gray-500">Colaborador</TableHead>
                  <TableHead className="font-bold text-gray-500">Unidade</TableHead>
                  <TableHead className="font-bold text-gray-500">Horário</TableHead>
                  <TableHead className="font-bold text-gray-500 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                      Nenhum colaborador/turno encontrado para os critérios de busca.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link, idx) => {
                    const unit = unidades.find(u => u.id === link.unidade_id);
                    return (
                      <TableRow key={idx} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-bold text-gray-800">
                          {link.colaborador.nome_completo}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building2 className="h-3.5 w-3.5 opacity-50" />
                            {unit?.nome_unidade || "Sem Unidade"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-3.5 w-3.5 opacity-50" />
                            {link.horarios?.[0]?.hora_inicio?.substring(0, 5)} - {link.horarios?.[0]?.hora_fim?.substring(0, 5)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={link.colaborador.status} className="scale-90" />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
