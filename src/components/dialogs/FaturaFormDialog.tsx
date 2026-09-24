import { useState, useEffect } from "react";
import { isAxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useClients } from "@/hooks/api/useClients";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useFaturas } from "@/hooks/api/useFaturamento";
import { Client, Empresa, FaturaCliente, StatusFatura } from "@/types/database";
import { toast } from "sonner";
import { Calculator, FileText, Loader2 } from "lucide-react";
import { faturamentoApi, SugestaoMedicaoResponse } from "@/services/api/faturamento.api";
import { toLocalDateString } from "@/utils/formatters/date";
import { STATUS_FATURA } from "@/constants/financeiro.constants";

export interface FaturaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faturaToEdit?: FaturaCliente | null;
  onSuccess?: () => void;
}

export function FaturaFormDialog({
  open,
  onOpenChange,
  faturaToEdit,
  onSuccess,
}: FaturaFormDialogProps) {
  const { createMutation, updateMutation } = useFaturas();
  const { data: clientsResponse } = useClients({ ativo: "true" });
  const { data: empresasResponse } = useEmpresas({ ativo: "true" });

  const clientes: Client[] = Array.isArray(clientsResponse)
    ? clientsResponse
    : (clientsResponse as { data?: Client[] })?.data || [];

  const empresas: Empresa[] = Array.isArray(empresasResponse)
    ? empresasResponse
    : (empresasResponse as { data?: Empresa[] })?.data || [];

  const hoje = new Date();
  const [clienteId, setClienteId] = useState<number | undefined>(undefined);
  const [empresaId, setEmpresaId] = useState<number | undefined>(undefined);
  const [mesCompetencia, setMesCompetencia] = useState<number>(hoje.getMonth() + 1);
  const [anoCompetencia, setAnoCompetencia] = useState<number>(hoje.getFullYear());
  const [quinzena, setQuinzena] = useState<1 | 2>(1);
  const [dataEmissao, setDataEmissao] = useState<string>(toLocalDateString(hoje));
  const [dataVencimento, setDataVencimento] = useState<string>("");
  const [valorFaturado, setValorFaturado] = useState<number>(0);
  const [status, setStatus] = useState<StatusFatura>(STATUS_FATURA.EMITIDA_PENDENTE);
  const [numeroFatura, setNumeroFatura] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");

  const [isCalculatingSugestao, setIsCalculatingSugestao] = useState<boolean>(false);
  const [sugestaoResultado, setSugestaoResultado] = useState<SugestaoMedicaoResponse | null>(null);

  useEffect(() => {
    if (open) {
      if (faturaToEdit) {
        setClienteId(faturaToEdit.cliente_id);
        setEmpresaId(faturaToEdit.empresa_id);
        setMesCompetencia(faturaToEdit.mes_competencia);
        setAnoCompetencia(faturaToEdit.ano_competencia);
        setQuinzena(faturaToEdit.quinzena as 1 | 2);
        setDataEmissao(faturaToEdit.data_emissao);
        setDataVencimento(faturaToEdit.data_vencimento);
        setValorFaturado(faturaToEdit.valor_faturado);
        setStatus(faturaToEdit.status);
        setObservacoes(faturaToEdit.observacoes || "");
        setSugestaoResultado(null);
      } else {
        setClienteId(undefined);
        setEmpresaId(undefined);
        setMesCompetencia(hoje.getMonth() + 1);
        setAnoCompetencia(hoje.getFullYear());
        setQuinzena(1);
        setDataEmissao(toLocalDateString(hoje));
        setDataVencimento("");
        setValorFaturado(0);
        setStatus(STATUS_FATURA.EMITIDA_PENDENTE);
        setObservacoes("");
        setSugestaoResultado(null);
      }
    }
  }, [open, faturaToEdit]);

  const handleBuscarSugestao = async () => {
    if (!clienteId) {
      toast.error("Selecione um cliente para calcular a sugestão de medição");
      return;
    }
    setIsCalculatingSugestao(true);
    try {
      const res = await faturamentoApi.getSugestao(clienteId, mesCompetencia, anoCompetencia, quinzena);
      setSugestaoResultado(res);
      setValorFaturado(res.valor_sugerido);
      toast.success("Sugestão calculada com sucesso!");
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao calcular sugestão de medição.";
      toast.error(msg);
    } finally {
      setIsCalculatingSugestao(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId) {
      toast.error("Informe o cliente");
      return;
    }
    if (!empresaId) {
      toast.error("Informe o CNPJ emissor");
      return;
    }
    if (!dataVencimento) {
      toast.error("Informe a data de vencimento");
      return;
    }
    if (valorFaturado <= 0) {
      toast.error("O valor da fatura deve ser maior que zero");
      return;
    }

    const payload: Partial<FaturaCliente> = {
      cliente_id: clienteId,
      empresa_id: empresaId,
      mes_competencia: mesCompetencia,
      ano_competencia: anoCompetencia,
      quinzena: quinzena,
      data_emissao: dataEmissao,
      data_vencimento: dataVencimento,
      valor_faturado: valorFaturado,
      status: status,
      dias_esperados: sugestaoResultado?.dias_esperados || faturaToEdit?.dias_esperados || 0,
      dias_trabalhados: sugestaoResultado?.dias_trabalhados || faturaToEdit?.dias_trabalhados || 0,
      faltas_sem_cobertura: sugestaoResultado?.faltas_sem_cobertura || faturaToEdit?.faltas_sem_cobertura || 0,
      valor_glosa: sugestaoResultado?.valor_glosa || faturaToEdit?.valor_glosa || 0,
      observacoes: observacoes || null,
    };

    try {
      if (faturaToEdit) {
        await updateMutation.mutateAsync({ id: faturaToEdit.id, data: payload });
        toast.success("Fatura atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Fatura gerada com sucesso!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao salvar fatura.";
      toast.error(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{faturaToEdit ? "Editar Fatura" : "Nova Fatura Quinzenal"}</DialogTitle>
              <DialogDescription>
                Emissão e controle de cobrança quinzenal com cálculo automático de diárias abatidas por faltas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Select
                value={clienteId ? String(clienteId) : ""}
                onValueChange={(val) => {
                  const numId = Number(val);
                  setClienteId(numId);
                  setSugestaoResultado(null);
                  const clienteSelecionado = clientes.find((c) => c.id === numId);
                  if (clienteSelecionado?.empresa_emissora_padrao_id) {
                    setEmpresaId(clienteSelecionado.empresa_emissora_padrao_id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nome_fantasia} ({c.tipo_cobranca || "NÃO DEF."})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>CNPJ Emissor *</Label>
              <Select
                value={empresaId ? String(empresaId) : ""}
                onValueChange={(val) => setEmpresaId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o CNPJ emissor" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Mês</Label>
              <Select value={String(mesCompetencia)} onValueChange={(val) => setMesCompetencia(Number(val))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {new Date(2000, m - 1, 1).toLocaleString("pt-BR", { month: "short" }).toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Ano</Label>
              <Input
                type="number"
                value={anoCompetencia}
                onChange={(e) => setAnoCompetencia(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Quinzena</Label>
              <Select value={String(quinzena)} onValueChange={(val) => setQuinzena(Number(val) as 1 | 2)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1ª Quinzena (01 a 15)</SelectItem>
                  <SelectItem value="2">2ª Quinzena (16 a 31)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Sugestão de Cobrança e Descontos por Falta
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBuscarSugestao}
                disabled={!clienteId || isCalculatingSugestao}
                className="h-7 text-xs bg-white hover:bg-slate-100"
              >
                {isCalculatingSugestao ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                ) : (
                  <Calculator className="h-3 w-3 mr-1.5 text-indigo-600" />
                )}
                Calcular Sugestão
              </Button>
            </div>

            {sugestaoResultado && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200 text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Tipo Cobrança</span>
                  <span className="font-semibold text-slate-800">{sugestaoResultado.tipo_cobranca}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Dias Esperados</span>
                  <span className="font-semibold text-slate-800">
                    {sugestaoResultado.dias_trabalhados} / {sugestaoResultado.dias_esperados}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-rose-500 block text-[10px] uppercase font-bold">Faltas Não Cobertas</span>
                  <span className="font-semibold text-rose-700">
                    {sugestaoResultado.faltas_sem_cobertura} dia(s)
                  </span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-rose-500 block text-[10px] uppercase font-bold">Desconto por Falta</span>
                  <span className="font-bold text-rose-700">
                    - {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(sugestaoResultado.valor_glosa)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Número Fatura / NF</Label>
              <Input
                placeholder="Ex: NF-10452"
                value={numeroFatura}
                onChange={(e) => setNumeroFatura(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Data de Emissão</Label>
              <Input
                type="date"
                value={dataEmissao}
                onChange={(e) => setDataEmissao(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Data de Vencimento *</Label>
              <Input
                type="date"
                value={dataVencimento}
                onChange={(e) => setDataVencimento(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Valor Faturado (R$) *</Label>
              <MoneyInput
                value={valorFaturado}
                onChange={setValorFaturado}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status da Fatura</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as StatusFatura)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={STATUS_FATURA.EM_MEDICAO}>Em Medição</SelectItem>
                  <SelectItem value={STATUS_FATURA.AGUARDANDO_APROVACAO}>Aguardando Aprovação</SelectItem>
                  <SelectItem value={STATUS_FATURA.EMITIDA_PENDENTE}>Aguardando Pagamento</SelectItem>
                  <SelectItem value={STATUS_FATURA.PAGO_PARCIAL}>Pago uma Parte</SelectItem>
                  <SelectItem value={STATUS_FATURA.LIQUIDADA}>Quitado / Recebido</SelectItem>
                  <SelectItem value={STATUS_FATURA.CANCELADA}>Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações / Detalhes de Descontos por Falta</Label>
            <Textarea
              placeholder="Descreva detalhes de descontos ou medição..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {faturaToEdit ? "Salvar Alterações" : "Emitir Fatura"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
