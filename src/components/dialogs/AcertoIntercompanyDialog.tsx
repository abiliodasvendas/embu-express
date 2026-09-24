import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIntercompany } from "@/hooks/api/useIntercompany";
import { TransferenciaIntercompany } from "@/types/database";
import { toast } from "sonner";
import { ArrowRightLeft, CheckCircle2, Loader2 } from "lucide-react";
import { toLocalDateString } from "@/utils/formatters/date";

export interface AcertoIntercompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transferencia?: TransferenciaIntercompany | null;
  onSuccess?: () => void;
}

export function AcertoIntercompanyDialog({
  open,
  onOpenChange,
  transferencia,
  onSuccess,
}: AcertoIntercompanyDialogProps) {
  const { registrarAcertoMutation } = useIntercompany();

  const [dataAcerto, setDataAcerto] = useState<string>(toLocalDateString());
  const [comprovanteUrl, setComprovanteUrl] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");

  useEffect(() => {
    if (open) {
      setDataAcerto(toLocalDateString());
      setComprovanteUrl("");
      setObservacao("");
    }
  }, [open, transferencia]);

  if (!transferencia) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataAcerto) {
      toast.error("Informe a data do acerto.");
      return;
    }

    try {
      await registrarAcertoMutation.mutateAsync({
        transferencia_id: transferencia.id,
        data_acerto: dataAcerto,
        comprovante_acerto_url: comprovanteUrl || null,
        observacao: observacao || null,
      });
      toast.success("Acerto intercompany registrado com sucesso!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao registrar acerto intercompany.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Registrar Acerto Entre Empresas</DialogTitle>
              <DialogDescription>
                Confirmação de repasse bancário do dinheiro recebido no lugar de outra empresa.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Quem recebeu o dinheiro:</span>
            <span className="font-bold text-slate-800">{transferencia.empresa_devedora?.nome_fantasia || "Empresa A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">Dona da fatura (Quem vai receber):</span>
            <span className="font-bold text-slate-800">{transferencia.empresa_credora?.nome_fantasia || "Empresa B"}</span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-slate-200">
            <span className="text-gray-500 font-medium">Valor a Repassar:</span>
            <span className="font-extrabold text-sm text-indigo-700">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(transferencia.valor)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <Label>Data da Transferência / Acerto *</Label>
            <Input
              type="date"
              value={dataAcerto}
              onChange={(e) => setDataAcerto(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>URL do Comprovante Bancário (Opcional)</Label>
            <Input
              placeholder="https://..."
              value={comprovanteUrl}
              onChange={(e) => setComprovanteUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Observação do Repasse</Label>
            <Textarea
              placeholder="Ex: TED realizada da CC 1234 para CC 5678..."
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
              disabled={registrarAcertoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={registrarAcertoMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {registrarAcertoMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar Acerto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
