import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRetaguarda } from "@/hooks/api/useRetaguarda";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useClients } from "@/hooks/api/useClients";
import { Client, Usuario } from "@/types/database";
import { toast } from "sonner";
import { Loader2, UserCheck } from "lucide-react";
import { CriarAlocacaoPayload } from "@/services/api/retaguarda.api";
import { toLocalDateString } from "@/utils/formatters/date";

export interface AlocacaoTemporariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AlocacaoTemporariaDialog({
  open,
  onOpenChange,
  onSuccess,
}: AlocacaoTemporariaDialogProps) {
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();

  const { criarAlocacaoMutation } = useRetaguarda(mesAtual, anoAtual);
  const { data: colaboradoresResponse } = useCollaborators({ all: true });
  const { data: clientsResponse } = useClients({ ativo: "true" });

  const todosColaboradores: Usuario[] = Array.isArray(colaboradoresResponse)
    ? colaboradoresResponse
    : (colaboradoresResponse as { data?: Usuario[] })?.data || [];

  const clientes: Client[] = Array.isArray(clientsResponse)
    ? clientsResponse
    : (clientsResponse as { data?: Client[] })?.data || [];

  const [reservaId, setReservaId] = useState<string>("");
  const [titularAusenteId, setTitularAusenteId] = useState<string>("");
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);
  const [dataCobertura, setDataCobertura] = useState<string>(toLocalDateString(hoje));
  const [observacao, setObservacao] = useState<string>("");

  useEffect(() => {
    if (open) {
      setReservaId("");
      setTitularAusenteId("");
      setClienteId(undefined);
      setDataCobertura(toLocalDateString());
      setObservacao("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaId) {
      toast.error("Selecione o colaborador interno para a cobertura.");
      return;
    }
    if (!clienteId) {
      toast.error("Selecione o cliente atendido na cobertura.");
      return;
    }
    if (!dataCobertura) {
      toast.error("Informe a data da cobertura.");
      return;
    }

    const payload: CriarAlocacaoPayload = {
      reserva_id: reservaId,
      titular_ausente_id: titularAusenteId && titularAusenteId !== "none" ? titularAusenteId : null,
      cliente_id: clienteId,
      data_cobertura: dataCobertura,
      observacao: observacao || null,
    };

    try {
      await criarAlocacaoMutation.mutateAsync(payload);
      toast.success("Cobertura registrada com sucesso! Desconto na fatura do cliente evitado.");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao registrar cobertura.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Registrar Cobertura de Falta</DialogTitle>
              <DialogDescription>
                Registro de cobertura por colaborador interno para evitar glosa na fatura do cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Motoboy da Reserva (Interno) *</Label>
            <Select value={reservaId} onValueChange={setReservaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motoboy interno / reserva..." />
              </SelectTrigger>
              <SelectContent>
                {todosColaboradores.map((colab) => (
                  <SelectItem key={colab.id} value={colab.id}>
                    {colab.nome_completo} ({colab.perfil?.nome || "Colaborador"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Titular Ausente (Quem faltou?)</Label>
            <Select value={titularAusenteId} onValueChange={setTitularAusenteId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o titular que faltou (se houver)..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum titular específico / Demanda Extra</SelectItem>
                {todosColaboradores.map((colab) => (
                  <SelectItem key={colab.id} value={colab.id}>
                    {colab.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cliente Atendido *</Label>
            <Select
              value={clienteId !== undefined ? String(clienteId) : ""}
              onValueChange={(val) => setClienteId(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cli) => (
                  <SelectItem key={cli.id} value={String(cli.id)}>
                    {cli.nome_fantasia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Data da Cobertura *</Label>
            <Input
              type="date"
              value={dataCobertura}
              onChange={(e) => setDataCobertura(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observação Operacional</Label>
            <Textarea
              placeholder="Ex: Titular apresentou atestado, apoio interno assumiu o turno..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={criarAlocacaoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={criarAlocacaoMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
            >
              {criarAlocacaoMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Registrar Cobertura
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
