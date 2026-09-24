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
import { MoneyInput } from "@/components/ui/MoneyInput";
import { useMovimentacoesAvulsas } from "@/hooks/api/useMovimentacoesAvulsas";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import {
  MovimentacaoAvulsa,
  TipoMovimentacaoAvulsa,
  CategoriaMovimentacaoAvulsa,
} from "@/types/database";
import {
  TIPO_MOVIMENTACAO_AVULSA,
  CATEGORIA_MOVIMENTACAO_AVULSA,
  CATEGORIA_MOVIMENTACAO_AVULSA_LABELS,
} from "@/constants/financeiro.constants";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, Banknote, Loader2 } from "lucide-react";
import { toLocalDateString } from "@/utils/formatters/date";

export interface MovimentacaoAvulsaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movimentacaoToEdit?: MovimentacaoAvulsa | null;
  onSuccess?: () => void;
}

const CATEGORIAS_ENTRADA: CategoriaMovimentacaoAvulsa[] = [
  "FRETE_ESPORADICO",
  "RENDIMENTO_APLICACAO",
  "REEMBOLSO_CLIENTE",
  "DOACAO_APORTE",
  "OUTRAS_ENTRADAS",
];

const CATEGORIAS_SAIDA: CategoriaMovimentacaoAvulsa[] = [
  "DESPESA_OPERACIONAL_AVULSA",
  "REEMBOLSO_DESPESA",
  "TARIFA_BANCARIA",
  "OUTRAS_SAIDAS",
];

export function MovimentacaoAvulsaFormDialog({
  open,
  onOpenChange,
  movimentacaoToEdit,
  onSuccess,
}: MovimentacaoAvulsaFormDialogProps) {
  const { createMutation, updateMutation } = useMovimentacoesAvulsas();
  const { data: empresas = [] } = useEmpresas({ ativo: "true" });

  const hoje = new Date();
  const [tipo, setTipo] = useState<TipoMovimentacaoAvulsa>(TIPO_MOVIMENTACAO_AVULSA.ENTRADA);
  const [empresaId, setEmpresaId] = useState<string>("");
  const [contaBancariaId, setContaBancariaId] = useState<string>("");
  const [categoria, setCategoria] = useState<CategoriaMovimentacaoAvulsa>(CATEGORIAS_ENTRADA[0]);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [dataMovimentacao, setDataMovimentacao] = useState<string>(toLocalDateString(hoje));

  const empresaIdNumber = empresaId ? Number(empresaId) : undefined;
  const { contas = [] } = useContasBancarias(empresaIdNumber);

  useEffect(() => {
    if (open) {
      if (movimentacaoToEdit) {
        setTipo(movimentacaoToEdit.tipo_movimentacao);
        setEmpresaId(String(movimentacaoToEdit.empresa_id));
        setContaBancariaId(movimentacaoToEdit.conta_bancaria_id || "");
        setCategoria(movimentacaoToEdit.categoria);
        setDescricao(movimentacaoToEdit.descricao);
        setValor(movimentacaoToEdit.valor);
        setDataMovimentacao(movimentacaoToEdit.data_movimentacao);
      } else {
        setTipo(TIPO_MOVIMENTACAO_AVULSA.ENTRADA);
        setEmpresaId(empresas[0] ? String(empresas[0].id) : "");
        setContaBancariaId("");
        setCategoria(CATEGORIAS_ENTRADA[0]);
        setDescricao("");
        setValor(0);
        setDataMovimentacao(toLocalDateString(hoje));
      }
    }
  }, [open, movimentacaoToEdit, empresas]);

  const handleTipoChange = (novoTipo: TipoMovimentacaoAvulsa) => {
    setTipo(novoTipo);
    if (novoTipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA) {
      setCategoria(CATEGORIAS_ENTRADA[0]);
    } else {
      setCategoria(CATEGORIAS_SAIDA[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId) {
      toast.error("Selecione a empresa.");
      return;
    }
    if (!descricao.trim()) {
      toast.error("Informe a descrição do lançamento.");
      return;
    }
    if (!dataMovimentacao) {
      toast.error("Informe a data da movimentação.");
      return;
    }
    if (valor <= 0) {
      toast.error("O valor deve ser maior que zero.");
      return;
    }

    const payload = {
      empresa_id: Number(empresaId),
      conta_bancaria_id: contaBancariaId ? contaBancariaId : null,
      tipo_movimentacao: tipo,
      categoria,
      descricao: descricao.trim(),
      valor,
      data_movimentacao: dataMovimentacao,
    };

    try {
      if (movimentacaoToEdit) {
        await updateMutation.mutateAsync({ id: movimentacaoToEdit.id, data: payload });
        toast.success("Movimentação avulsa atualizada com sucesso!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Movimentação avulsa registrada com sucesso!");
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const msg = isAxiosError(err) && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error
        ? err.message
        : "Erro ao salvar movimentação avulsa.";
      toast.error(msg);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const categoriasDisponiveis = tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-800">
            <Banknote className="w-5 h-5 text-indigo-600" />
            <DialogTitle className="text-xl">
              {movimentacaoToEdit ? "Editar Movimentação Avulsa" : "Novo Lançamento Avulso"}
            </DialogTitle>
          </div>
          <DialogDescription>
            Registre entradas ou saídas pontuais na conta bancária que não passam por fatura ou folha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Tipo de Movimentação *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA ? "default" : "outline"}
                className={`text-xs gap-1.5 ${
                  tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "text-slate-600 hover:text-emerald-700 hover:border-emerald-300"
                }`}
                onClick={() => handleTipoChange(TIPO_MOVIMENTACAO_AVULSA.ENTRADA)}
              >
                <ArrowDownRight className="w-4 h-4" />
                Entrada / Receita Avulsa
              </Button>
              <Button
                type="button"
                variant={tipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA ? "default" : "outline"}
                className={`text-xs gap-1.5 ${
                  tipo === TIPO_MOVIMENTACAO_AVULSA.SAIDA
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "text-slate-600 hover:text-rose-700 hover:border-rose-300"
                }`}
                onClick={() => handleTipoChange(TIPO_MOVIMENTACAO_AVULSA.SAIDA)}
              >
                <ArrowUpRight className="w-4 h-4" />
                Saída / Despesa Direta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Empresa (CNPJ) *</Label>
              <Select value={empresaId} onValueChange={setEmpresaId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)} className="text-xs">
                      {emp.nome_fantasia || emp.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Conta Bancária (Opcional)</Label>
              <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Sem conta bancária específica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs text-slate-500">
                    Nenhuma conta específica
                  </SelectItem>
                  {contas.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.banco_nome} {c.agencia ? `- Ag: ${c.agencia}` : ""} {c.conta ? `Cc: ${c.conta}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Categoria *</Label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaMovimentacaoAvulsa)}>
              <SelectTrigger className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoriasDisponiveis.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {CATEGORIA_MOVIMENTACAO_AVULSA_LABELS[cat] || cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Descrição do Lançamento *</Label>
            <Input
              placeholder="Ex: Frete extra cliente ABC, Aplicação CDB, Taxa de Manutenção"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor (R$) *</Label>
              <MoneyInput
                value={valor}
                onChange={setValor}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Data da Operação *</Label>
              <Input
                type="date"
                value={dataMovimentacao}
                onChange={(e) => setDataMovimentacao(e.target.value)}
                required
                className="text-xs"
              />
            </div>
          </div>

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
              className={`text-xs text-white gap-1.5 ${
                tipo === TIPO_MOVIMENTACAO_AVULSA.ENTRADA
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {movimentacaoToEdit ? "Salvar Alterações" : "Confirmar Lançamento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
