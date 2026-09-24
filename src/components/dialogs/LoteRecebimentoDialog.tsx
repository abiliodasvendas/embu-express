import { useState, useEffect, useMemo } from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { FaturaCliente } from "@/types/database";
import { toast } from "sonner";
import { Layers, AlertCircle, ArrowRightLeft, Loader2, Check } from "lucide-react";
import { ItemRecebimentoPayload, LoteRecebimentoPayload } from "@/services/api/faturamento.api";
import { toLocalDateString, formatDateToBR } from "@/utils/formatters/date";
import { STATUS_FATURA } from "@/constants/financeiro.constants";

export interface LoteRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoteRecebimentoDialog({
  open,
  onOpenChange,
  onSuccess,
}: LoteRecebimentoDialogProps) {
  const { faturas = [], loteRecebimentoMutation } = useFaturas();
  const { contas = [] } = useContasBancarias();

  const [contaBancariaId, setContaBancariaId] = useState<string>("");
  const [dataDeposito, setDataDeposito] = useState<string>(toLocalDateString());
  const [valorTotalDepositado, setValorTotalDepositado] = useState<number>(0);
  const [comprovanteUrl, setComprovanteUrl] = useState<string>("");
  const [observacao, setObservacao] = useState<string>("");

  const [alocacoes, setAlocacoes] = useState<{ [faturaId: string]: number }>({});

  const faturasEmAberto = useMemo(() => {
    return (faturas || []).filter(
      (f) => f.status === STATUS_FATURA.EMITIDA_PENDENTE || f.status === STATUS_FATURA.PAGO_PARCIAL
    );
  }, [faturas]);

  useEffect(() => {
    if (open) {
      setContaBancariaId("");
      setDataDeposito(toLocalDateString());
      setValorTotalDepositado(0);
      setComprovanteUrl("");
      setObservacao("");
      setAlocacoes({});
    }
  }, [open]);

  const totalAlocado = useMemo(() => {
    return Object.values(alocacoes).reduce((acc, curr) => acc + (curr || 0), 0);
  }, [alocacoes]);

  const diferenca = valorTotalDepositado - totalAlocado;

  const contaBancariaSelecionada = useMemo(() => {
    return (contas || []).find((c) => c.id === contaBancariaId);
  }, [contas, contaBancariaId]);

  const acertosIntercompany = useMemo(() => {
    if (!contaBancariaSelecionada) return [];

    const grupos: { [empresaNome: string]: { empresaDestino: string; total: number } } = {};
    const empresaOrigemNome = contaBancariaSelecionada.empresa?.nome_fantasia || "Empresa de Crédito";

    for (const [fId, val] of Object.entries(alocacoes)) {
      if (!val || val <= 0) continue;
      const fat = (faturas || []).find((f) => f.id === fId);
      if (fat && fat.empresa_id !== contaBancariaSelecionada.empresa_id) {
        const empresaFaturaNome = fat.empresa?.nome_fantasia || `Empresa #${fat.empresa_id}`;
        if (!grupos[empresaFaturaNome]) {
          grupos[empresaFaturaNome] = { empresaDestino: empresaFaturaNome, total: 0 };
        }
        grupos[empresaFaturaNome].total += val;
      }
    }

    return Object.values(grupos).map((g) => ({
      origem: empresaOrigemNome,
      destino: g.empresaDestino,
      valor: g.total,
    }));
  }, [alocacoes, contaBancariaSelecionada, faturas]);

  const handleAlocacaoChange = (faturaId: string, valor: number) => {
    setAlocacoes((prev) => ({
      ...prev,
      [faturaId]: valor,
    }));
  };

  const handleDistribuirAutomatico = () => {
    if (valorTotalDepositado <= 0) {
      toast.error("Informe primeiro o valor total depositado.");
      return;
    }

    let restante = valorTotalDepositado;
    const novasAlocacoes: { [faturaId: string]: number } = {};

    for (const fatura of faturasEmAberto) {
      if (restante <= 0) break;
      const saldoDevedor = (fatura.valor_faturado || 0) - (fatura.valor_pago || 0);
      const valorAlocar = Math.min(restante, saldoDevedor);
      novasAlocacoes[fatura.id] = Math.round(valorAlocar * 100) / 100;
      restante -= valorAlocar;
    }

    setAlocacoes(novasAlocacoes);
    toast.success("Distribuição automática sugerida!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaBancariaId) {
      toast.error("Selecione a conta bancária de destino.");
      return;
    }
    if (valorTotalDepositado <= 0) {
      toast.error("O valor depositado deve ser maior que zero.");
      return;
    }
    if (Math.abs(diferenca) > 0.01) {
      toast.error("A soma dos valores alocados deve ser exatamente igual ao total depositado.");
      return;
    }

    const itens: ItemRecebimentoPayload[] = Object.entries(alocacoes)
      .filter(([_, val]) => val > 0)
      .map(([fatura_id, valor_alocado]) => ({
        fatura_id,
        valor_alocado,
      }));

    if (itens.length === 0) {
      toast.error("Aloca ao menos um valor em uma fatura.");
      return;
    }

    const payload: LoteRecebimentoPayload = {
      conta_bancaria_destino_id: contaBancariaId,
      data_deposito: dataDeposito,
      valor_total_depositado: valorTotalDepositado,
      comprovante_url: comprovanteUrl || null,
      observacao: observacao || null,
      itens,
    };

    try {
      await loteRecebimentoMutation.mutateAsync(payload);
      toast.success("Lote de recebimento liquidado e conciliação realizada!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao processar lote de recebimento.";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Liquidação de Recebimento em Lote</DialogTitle>
              <DialogDescription>
                Dê baixa em um único depósito distribuindo o valor entre faturas do cliente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Conta Bancária de Destino *</Label>
              <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione onde o dinheiro caiu..." />
                </SelectTrigger>
                <SelectContent>
                  {(contas || []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.banco_nome} (Ag {c.agencia || "-"} / CC {c.conta || "-"}) - {c.empresa?.nome_fantasia || "CNPJ"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Data do Depósito *</Label>
              <Input
                type="date"
                value={dataDeposito}
                onChange={(e) => setDataDeposito(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor Total Depositado (R$) *</Label>
              <MoneyInput
                value={valorTotalDepositado}
                onChange={setValorTotalDepositado}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label>URL do Comprovante (Opcional)</Label>
              <Input
                placeholder="https://..."
                value={comprovanteUrl}
                onChange={(e) => setComprovanteUrl(e.target.value)}
              />
            </div>
          </div>

          {acertosIntercompany.length > 0 && (
            <div className="space-y-2">
              {acertosIntercompany.map((acerto, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 flex items-start gap-2.5">
                  <ArrowRightLeft className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold text-blue-900">Aviso de Acerto Automático Entre Empresas</p>
                    <p className="text-blue-800 mt-0.5">
                      Este pagamento caiu na conta da empresa <strong>{acerto.origem}</strong>, mas quita faturas da empresa <strong>{acerto.destino}</strong>. Um acerto automático de <strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(acerto.valor)}</strong> foi registrado entre elas.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold text-slate-500">
                Alocação entre Faturas em Aberto ({faturasEmAberto.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDistribuirAutomatico}
                className="h-7 text-xs"
              >
                Distribuir Automaticamente
              </Button>
            </div>

            <div className="border rounded-xl divide-y max-h-60 overflow-y-auto bg-slate-50">
              {faturasEmAberto.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-500">
                  Nenhuma fatura com saldo em aberto encontrada para este período.
                </div>
              ) : (
                faturasEmAberto.map((f) => {
                  const saldoPendente = (f.valor_faturado || 0) - (f.valor_pago || 0);
                  const valorAlocadoFatura = alocacoes[f.id] || 0;

                  return (
                    <div key={f.id} className="p-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs">
                        <p className="font-semibold text-slate-800">
                          {f.cliente?.nome_fantasia || `Cliente #${f.cliente_id}`} - Quinzena {f.quinzena} ({f.mes_competencia}/{f.ano_competencia})
                        </p>
                        <p className="text-gray-500 text-[11px]">
                          Vencimento: {formatDateToBR(f.data_vencimento)} | Total: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(f.valor_faturado)} | Saldo Pendente: <span className="font-bold text-rose-600">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoPendente)}</span>
                        </p>
                      </div>

                      <div className="w-full sm:w-44 shrink-0">
                        <MoneyInput
                          value={valorAlocadoFatura}
                          onChange={(val) => handleAlocacaoChange(f.id, val)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 text-xs font-semibold">
              <span>Total Alocado: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalAlocado)}</span>
              <span className={Math.abs(diferenca) < 0.01 ? "text-emerald-600" : "text-rose-600"}>
                {Math.abs(diferenca) < 0.01 ? "Alocação 100% Correta" : `Diferença: ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(diferenca)}`}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observação do Lote</Label>
            <Textarea
              placeholder="Informações adicionais da operação..."
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
              disabled={loteRecebimentoMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loteRecebimentoMutation.isPending || Math.abs(diferenca) > 0.01}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {loteRecebimentoMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Liquidar Lote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
