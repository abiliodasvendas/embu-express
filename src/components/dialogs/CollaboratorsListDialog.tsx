import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

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

  const handleClose = () => {
    safeCloseDialog(() => {
      onOpenChange(false);
      setSearch("");
    });
  };

  const allLinks = collaborators.flatMap((collab) => {
    const links = collab.links?.filter((l) => l.cliente_id?.toString() === clientId) || [];
    return links.map((link) => ({
      ...link,
      colaborador: collab,
    }));
  });

  const filteredLinks = allLinks.filter((link) => {
    const searchLower = search.toLowerCase();
    const unit = unidades.find((u) => u.id === link.unidade_id);
    return (
      link.colaborador.nome_completo.toLowerCase().includes(searchLower) ||
      unit?.nome_unidade.toLowerCase().includes(searchLower)
    );
  });

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="4xl"
    >
      <BaseDialog.Header
        icon={<User className="h-5 w-5 text-foreground" />}
        title="Todos os Colaboradores / Turnos"
        subtitle="Visualização consolidada de vínculos e escalas com esta unidade/cliente."
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou unidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-background border-border rounded-[18px] text-sm font-normal focus:bg-white focus:border-primary transition-all shadow-xs"
            />
          </div>

          <div className="border border-border rounded-[18px] overflow-hidden bg-card shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-muted-foreground">Colaborador</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground">Unidade</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground">Horário</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLinks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-sm text-muted-foreground">
                      Nenhum colaborador/turno encontrado para os critérios de busca.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLinks.map((link, idx) => {
                    const unit = unidades.find((u) => u.id === link.unidade_id);
                    return (
                      <TableRow key={idx} className="border-border/60 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-medium text-sm text-foreground">
                          {link.colaborador.nome_completo}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5 opacity-60" />
                            {unit?.nome_unidade || "Sem Unidade"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 opacity-60" />
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
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Fechar"
          variant="secondary"
          onClick={handleClose}
          type="button"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
