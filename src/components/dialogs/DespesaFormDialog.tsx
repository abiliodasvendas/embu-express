import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useDespesas } from "@/hooks/api/useDespesas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { DespesaOperacional, CategoriaDespesa, StatusDespesa } from "@/types/database";
import {
  CATEGORIA_DESPESA,
  CATEGORIA_DESPESA_LABELS,
  STATUS_DESPESA,
} from "@/constants/financeiro.constants";
import { toast } from "sonner";
import { Receipt, Loader2 } from "lucide-react";
import { toLocalDateString } from "@/utils/formatters/date";

export interface DespesaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesaToEdit?: DespesaOperacional | null;
  onSuccess?: () => void;
}

export function DespesaFormDialog({
  open,
  onOpenChange,
  despesaToEdit,
  onSuccess,
}: DespesaFormDialogProps) {
  const { createMutation, updateMutation } = useDespesas();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });

  const hoje = new Date();
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState<CategoriaDespesa>(CATEGORIA_DESPESA.DESPESA_FIXA);
  const [empresaId, setEmpresaId] = useState<string>("holding");
  const [isHolding, setIsHolding] = useState<boolean>(true);
  const [mesCompetencia, setMesCompetencia] = useState<number>(hoje.getMonth() + 1);
  const [anoCompetencia, setAnoCompetencia] = useState<number>(hoje.getFullYear());
  const [dataVencimento, setDataVencimento] = useState<string>(toLocalDateString(hoje));
  const [valorPrevisto, setValorPrevisto] = useState<number>(0);
  const [status, setStatus] = useState<StatusDespesa>(STATUS_DESPESA.PENDENTE);
  const [valorPago, setValorPago] = useState<number>(0);
  const [dataPagamento, setDataPagamento] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (despesaToEdit) {
        setDescricao(despesaToEdit.descricao);
        setCategoria(despesaToEdit.categoria);
        setIsHolding(despesaToEdit.is_holding);
        setEmpresaId(despesaToEdit.empresa_id ? String(despesaToEdit.empresa_id) : "holding");
        setMesCompetencia(despesaToEdit.mes_competencia);
        setAnoCompetencia(despesaToEdit.ano_competencia);
        setDataVencimento(despesaToEdit.data_vencimento);
        setValorPrevisto(despesaToEdit.valor_previsto);
        setStatus(despesaToEdit.status);
        setValorPago(despesaToEdit.valor_pago || 0);
        setDataPagamento(despesaToEdit.data_pagamento || "");
      } else {
        setDescricao("");
        setCategoria(CATEGORIA_DESPESA.DESPESA_FIXA);
        setIsHolding(true);
        setEmpresaId("holding");
        setMesCompetencia(hoje.getMonth() + 1);
        setAnoCompetencia(hoje.getFullYear());
        setDataVencimento(toLocalDateString(hoje));
        setValorPrevisto(0);
        setStatus(STATUS_DESPESA.PENDENTE);
        setValorPago(0);
        setDataPagamento("");
      }
    }
  }, [open, despesaToEdit]);

  const handleEmpresaChange = (val: string) => {
    setEmpresaId(val);
    setIsHolding(val === "holding");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!descricao.trim()) {
      toast.error("Informe a descrição da conta a pagar.");
      return;
    }
    if (!dataVencimento) {
      toast.error("Informe a data de vencimento.");
      return;
    }
    if (valorPrevisto <= 0) {
      toast.error("O valor previsto deve ser maior que zero.");
      return;
    }

    const payload = {
      descricao: descricao.trim(),
      categoria,
      empresa_id: empresaId === "holding" ? null : Number(empresaId),
      is_holding: isHolding,
      mes_competencia: mesCompetencia,
      ano_competencia: anoCompetencia,
      data_vencimento: dataVencimento,
      valor_previsto: valorPrevisto,
      status,
      valor_pago: status === STATUS_DESPESA.PAGO ? valorPago || valorPrevisto : undefined,
      data_pagamento: status === STATUS_DESPESA.PAGO ? dataPagamento || dataVencimento : null,
    };

    try {
      if (despesaToEdit) {
        await updateMutation.mutateAsync({ id: despesaToEdit.id, data: payload });
        toast.success("Despesa atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Conta a pagar lançada com sucesso!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao salvar despesa.";
      toast.error(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-800">
            <Receipt className="w-5 h-5 text-rose-600" />
            <DialogTitle className="text-xl">
              {despesaToEdit ? "Editar Conta a Pagar" : "Lançar Conta a Pagar / Despesa"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Lançamento de despesas fixas, tributos e financiamentos para apuração do DRE e Curva de Caixa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Descrição da Conta *</Label>
            <Input
              placeholder="Ex: Aluguel do Galpão, Contador, DAS Simples Nacional"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Categoria de Despesa *</Label>
              <Select value={categoria} onValueChange={(val) => setCategoria(val as CategoriaDespesa)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CATEGORIA_DESPESA).map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">
                      {CATEGORIA_DESPESA_LABELS[cat] || cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Destinação da Despesa *</Label>
              <Select value={empresaId} onValueChange={handleEmpresaChange}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holding" className="font-semibold text-indigo-700 text-xs">
                    Geral da Holding (Rateio entre CNPJs)
                  </SelectItem>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)} className="text-xs">
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Mês Competência</Label>
              <Select value={String(mesCompetencia)} onValueChange={(val) => setMesCompetencia(Number(val))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)} className="text-xs">
                      {new Date(2000, m - 1, 1).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Ano Competência</Label>
              <Input
                type="number"
                value={anoCompetencia}
                onChange={(e) => setAnoCompetencia(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Vencimento *</Label>
              <Input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor Previsto (R$) *</Label>
              <MoneyInput
                value={valorPrevisto}
                onChange={setValorPrevisto}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Status do Pagamento</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as StatusDespesa)}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STATUS_DESPESA.PENDENTE} className="text-xs">A Pagar (Pendente)</SelectItem>
                  <SelectItem value={STATUS_DESPESA.PAGO} className="text-xs">Pago / Liquidado</SelectItem>
                  <SelectItem value={STATUS_DESPESA.ADIADA} className="text-xs">Adiada</SelectItem>
                  <SelectItem value={STATUS_DESPESA.CANCELADO} className="text-xs">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === STATUS_DESPESA.PAGO && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-emerald-800">Valor Efetivamente Pago (R$)</Label>
                <MoneyInput
                  value={valorPago || valorPrevisto}
                  onChange={setValorPago}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-emerald-800">Data do Pagamento</Label>
                <Input
                  type="date"
                  value={dataPagamento || dataVencimento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  className="text-xs bg-white"
                />
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {despesaToEdit ? "Salvar Alterações" : "Confirmar Lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
