import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { useRetaguarda } from "@/hooks/api/useRetaguarda";
import { useCollaborators } from "@/hooks/api/useCollaborators";
import { useClients } from "@/hooks/api/useClients";
import { Client, Usuario } from "@/types/database";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";
import { CriarAlocacaoPayload } from "@/services/api/retaguarda.api";
import { toLocalDateString } from "@/utils/formatters/date";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

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
      toast.success("Cobertura registrada com sucesso!");
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : err instanceof Error
          ? err.message
          : "Erro ao registrar cobertura.";
      toast.error(msg);
    }
  };

  const handleClose = () => {
    if (criarAlocacaoMutation.isPending) return;
    safeCloseDialog(() => onOpenChange(false));
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="md"
      lockClose={criarAlocacaoMutation.isPending}
    >
      <BaseDialog.Header
        icon={<UserCheck className="h-5 w-5 text-foreground" />}
        title="Registrar Cobertura de Falta"
        subtitle="Registro de cobertura operacional por colaborador interno para o cliente."
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <BaseDialog.Body>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Colaborador da Reserva (Interno) *
              </Label>
              <NativeSelect
                value={reservaId}
                onChange={(e) => setReservaId(e.target.value)}
                className="h-11 rounded-[18px] text-xs sm:text-sm font-semibold"
                required
              >
                <option value="">Selecione o colaborador interno / reserva...</option>
                {todosColaboradores.map((colab) => (
                  <option key={colab.id} value={colab.id}>
                    {colab.nome_completo} ({colab.perfil?.nome || "Colaborador"})
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Titular Ausente (Quem faltou?)
              </Label>
              <NativeSelect
                value={titularAusenteId}
                onChange={(e) => setTitularAusenteId(e.target.value)}
                className="h-11 rounded-[18px] text-xs sm:text-sm font-semibold"
              >
                <option value="none">Nenhum titular específico / Demanda Extra</option>
                {todosColaboradores.map((colab) => (
                  <option key={colab.id} value={colab.id}>
                    {colab.nome_completo}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Cliente Atendido *
              </Label>
              <NativeSelect
                value={clienteId !== undefined ? String(clienteId) : ""}
                onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : undefined)}
                className="h-11 rounded-[18px] text-xs sm:text-sm font-semibold"
                required
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map((cli) => (
                  <option key={cli.id} value={String(cli.id)}>
                    {cli.nome_fantasia}
                  </option>
                ))}
              </NativeSelect>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Data da Cobertura *
              </Label>
              <Input
                type="date"
                value={dataCobertura}
                onChange={(e) => setDataCobertura(e.target.value)}
                className="h-11 rounded-[18px] text-xs sm:text-sm font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Observação Operacional
              </Label>
              <Textarea
                placeholder="Ex: Titular apresentou atestado, apoio interno assumiu o turno..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                rows={2}
                className="rounded-[18px] text-xs sm:text-sm"
              />
            </div>
          </div>
        </BaseDialog.Body>
        <BaseDialog.Footer>
          <BaseDialog.Action
            label="Cancelar"
            variant="secondary"
            disabled={criarAlocacaoMutation.isPending}
            onClick={handleClose}
            type="button"
          />
          <BaseDialog.Action
            label="Registrar Cobertura"
            variant="primary"
            isLoading={criarAlocacaoMutation.isPending}
            type="submit"
          />
        </BaseDialog.Footer>
      </form>
    </BaseDialog>
  );
}

export default AlocacaoTemporariaDialog;
