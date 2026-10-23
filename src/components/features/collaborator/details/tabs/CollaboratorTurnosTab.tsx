import { Can } from "@/components/auth/Can";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PERMISSIONS } from "@/constants/permissions.enum";
import { ColaboradorCliente } from "@/types/database";
import { CalendarOff, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { CollaboratorTurnCard } from "../CollaboratorTurnCard";

interface CollaboratorTurnosTabProps {
  activeLinks: ColaboradorCliente[];
  closedLinks: ColaboradorCliente[];
  onAddTurn: () => void;
  onEditTurn: (turn: ColaboradorCliente) => void;
  onEndTurn: (turn: ColaboradorCliente) => void;
  onReactivateTurn: (turn: ColaboradorCliente) => void;
  onDeleteTurn: (turnId: number) => void;
}

export function CollaboratorTurnosTab({
  activeLinks,
  closedLinks,
  onAddTurn,
  onEditTurn,
  onEndTurn,
  onReactivateTurn,
  onDeleteTurn,
}: CollaboratorTurnosTabProps) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm rounded-[24px] min-h-[300px] flex flex-col pt-2">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-6 pt-6 px-6 sm:px-8 gap-4">
          <div>
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="h-10 w-10 rounded-[14px] bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block font-semibold">Turnos Ativos</span>
                <span className="text-xs text-muted-foreground font-medium mt-0.5">
                  Vínculos diretos com clientes e horários em vigor.
                </span>
              </div>
            </CardTitle>
          </div>
          <Can I={PERMISSIONS.USUARIOS.EDITAR}>
            <Button
              onClick={onAddTurn}
              className="rounded-[18px] flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 px-4 shadow-xs select-none"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Turno</span>
            </Button>
          </Can>
        </CardHeader>
        <CardContent className="p-8 flex-1">
          {activeLinks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-[18px] flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="font-bold text-gray-700">Nenhum turno ativo</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                Este colaborador não possui vínculos ou turnos ativos no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLinks.map((link, index) => (
                <CollaboratorTurnCard
                  key={link.id || index}
                  link={link}
                  isClosed={false}
                  onEdit={onEditTurn}
                  onEnd={onEndTurn}
                  onDelete={onDeleteTurn}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {closedLinks.length > 0 && (
        <Card className="border border-dashed border-border shadow-none rounded-[24px] bg-muted/20 flex flex-col pt-4">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-5 pt-6 px-8 gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
                <div className="h-9 w-9 rounded-xl bg-gray-200/70 flex items-center justify-center shrink-0">
                  <CalendarOff className="h-4.5 w-4.5 text-gray-500" />
                </div>
                <div>
                  <span className="block font-bold">Histórico de Turnos Encerrados</span>
                  <span className="text-xs text-muted-foreground font-medium mt-0.5">
                    Vínculos finalizados anteriormente ({closedLinks.length}).
                  </span>
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {closedLinks.map((link, index) => (
                <CollaboratorTurnCard
                  key={link.id || index}
                  link={link}
                  isClosed={true}
                  onEdit={onEditTurn}
                  onReactivate={onReactivateTurn}
                  onDelete={onDeleteTurn}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
