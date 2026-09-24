import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/utils/notifications/toast";
import { FaturaFornecedorConvenio, StatusFaturaFornecedorConvenio } from "@/types/database";
import { useSalvarFaturaFornecedor } from "@/hooks/api/useConvenioAuditoria";
import { Receipt, Loader2 } from "lucide-react";

export interface FaturaFornecedorConvenioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  convenioId: string;
  convenioNome?: string;
  mesCompetencia: number;
  anoCompetencia: number;
  faturaToEdit?: FaturaFornecedorConvenio | null;
  onSuccess?: () => void;
}

export function FaturaFornecedorConvenioDialog({
  open,
  onOpenChange,
  convenioId,
  convenioNome,
  mesCompetencia,
  anoCompetencia,
  faturaToEdit,
  onSuccess,
}: FaturaFornecedorConvenioDialogProps) {
  const [valor, setValor] = useState<string>("");
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [status, setStatus] = useState<StatusFaturaFornecedorConvenio>("PENDENTE");
  const [comprovanteUrl, setComprovanteUrl] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  const salvarFatura = useSalvarFaturaFornecedor(convenioId);

  useEffect(() => {
    if (faturaToEdit) {
      setValor(Number(faturaToEdit.valor_total_fatura).toFixed(2));
      setDataVencimento(faturaToEdit.data_vencimento);
      setStatus(faturaToEdit.status);
      setComprovanteUrl(faturaToEdit.comprovante_url || "");
      setObservacoes(faturaToEdit.observacoes || "");
    } else {
      setValor("");
      const mesStr = String(mesCompetencia).padStart(2, "0");
      setDataVencimento(`${anoCompetencia}-${mesStr}-15`);
      setStatus("PENDENTE");
      setComprovanteUrl("");
      setObservacoes("");
    }
  }, [faturaToEdit, mesCompetencia, anoCompetencia, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valorNum = parseFloat(valor.replace(",", "."));
    if (isNaN(valorNum) || valorNum < 0) {
      toast.error("Informe um valor válido para a fatura.");
      return;
    }

    if (!dataVencimento) {
      toast.error("Informe a data de vencimento (dia 15).");
      return;
    }

    try {
      await salvarFatura.mutateAsync({
        convenio_id: convenioId,
        mes_competencia: mesCompetencia,
        ano_competencia: anoCompetencia,
        valor_total_fatura: valorNum,
        data_vencimento: dataVencimento,
        status,
        comprovante_url: comprovanteUrl.trim() ? comprovanteUrl.trim() : null,
        observacoes: observacoes.trim() ? observacoes.trim() : null,
      });

      toast.success(
        faturaToEdit
          ? "Fatura do fornecedor atualizada com sucesso!"
          : "Fatura do fornecedor lançada com sucesso!"
      );
      onSuccess?.();
      onOpenChange(false);
    } catch {
      toast.error("Erro ao salvar fatura do fornecedor.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {faturaToEdit ? "Editar Fatura do Fornecedor" : "Lançar Fatura do Fornecedor"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {convenioNome ? `${convenioNome} — ` : ""}Competência {String(mesCompetencia).padStart(2, "0")}/{anoCompetencia}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="valor_fatura" className="text-xs font-semibold text-gray-700">
              Valor Total do Boleto (R$) *
            </Label>
            <Input
              id="valor_fatura"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="rounded-xl h-10 font-bold text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="data_vencimento" className="text-xs font-semibold text-gray-700">
                Data Vencimento *
              </Label>
              <Input
                id="data_vencimento"
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
                className="rounded-xl h-10 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status_fatura" className="text-xs font-semibold text-gray-700">
                Status *
              </Label>
              <Select value={status} onValueChange={(val) => setStatus(val as StatusFaturaFornecedorConvenio)}>
                <SelectTrigger id="status_fatura" className="rounded-xl h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_AUDITORIA">Em Auditoria</SelectItem>
                  <SelectItem value="APROVADA">Aprovada</SelectItem>
                  <SelectItem value="PAGA">Paga</SelectItem>
                  <SelectItem value="GLOSADA">Glosada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comprovante_url" className="text-xs font-semibold text-gray-700">
              Link do Boleto / Comprovante (URL)
            </Label>
            <Input
              id="comprovante_url"
              type="url"
              placeholder="https://..."
              value={comprovanteUrl}
              onChange={(e) => setComprovanteUrl(e.target.value)}
              className="rounded-xl h-10 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observacoes" className="text-xs font-semibold text-gray-700">
              Observações da Auditoria
            </Label>
            <Textarea
              id="observacoes"
              placeholder="Detalhes sobre a fatura, número da nota ou divergências..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="rounded-xl min-h-[70px] text-xs resize-none"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl h-9 text-xs"
              disabled={salvarFatura.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-xl h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm"
              disabled={salvarFatura.isPending}
            >
              {salvarFatura.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {faturaToEdit ? "Salvar Alterações" : "Registrar Fatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
