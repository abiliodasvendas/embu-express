import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { useContasBancarias } from "@/hooks/api/useContasBancarias";
import { useEmpresas } from "@/hooks/api/useEmpresas";
import { toast } from "sonner";
import { Building2, CreditCard, Plus, Trash2, Loader2, Landmark } from "lucide-react";
import { cnpjMask } from "@/utils/masks";

export interface ContasBancariasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresaIdInicial?: number;
}

export function ContasBancariasDialog({
  open,
  onOpenChange,
  empresaIdInicial,
}: ContasBancariasDialogProps) {
  const { contas, isLoading, createMutation, deleteMutation } = useContasBancarias();
  const { data: empresas = [] } = useEmpresas();

  const [mostrarNovoFormulario, setMostrarNovoFormulario] = useState(false);
  const [empresaId, setEmpresaId] = useState<string>(empresaIdInicial ? String(empresaIdInicial) : "");
  const [bancoNome, setBancoNome] = useState("");
  const [agencia, setAgencia] = useState("");
  const [conta, setConta] = useState("");
  const [tipoConta, setTipoConta] = useState<"CORRENTE" | "POUPANCA">("CORRENTE");

  const handleSubmitNovaConta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empresaId) {
      toast.error("Selecione a empresa dona da conta bancária.");
      return;
    }
    if (!bancoNome.trim()) {
      toast.error("Informe o nome do banco.");
      return;
    }
    if (!conta.trim()) {
      toast.error("Informe o número da conta.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        empresa_id: Number(empresaId),
        banco_nome: bancoNome.trim(),
        agencia: agencia.trim() || undefined,
        conta: conta.trim(),
        tipo_conta: tipoConta,
        ativo: true,
      });

      toast.success("Conta bancária cadastrada com sucesso!");
      setBancoNome("");
      setAgencia("");
      setConta("");
      setMostrarNovoFormulario(false);
    } catch {
      toast.error("Erro ao cadastrar conta bancária.");
    }
  };

  const handleExcluirConta = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Conta bancária removida.");
    } catch {
      toast.error("Não foi possível excluir a conta bancária.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-slate-800">
            <Landmark className="w-5 h-5 text-indigo-600" />
            <DialogTitle className="text-xl">Contas Bancárias do Grupo</DialogTitle>
          </div>
          <DialogDescription>
            Gerencie as contas bancárias vinculadas a cada CNPJ para conciliação de pagamentos e acertos entre empresas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">Contas Cadastradas</h4>
            {!mostrarNovoFormulario && (
              <Button
                type="button"
                size="sm"
                onClick={() => setMostrarNovoFormulario(true)}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Conta Bancária
              </Button>
            )}
          </div>

          {mostrarNovoFormulario && (
            <form onSubmit={handleSubmitNovaConta} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Cadastrar Nova Conta</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMostrarNovoFormulario(false)}
                  className="h-6 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Empresa (CNPJ)</Label>
                  <Select value={empresaId} onValueChange={setEmpresaId}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)} className="text-xs">
                          {emp.nome_fantasia} {emp.cnpj ? `(${cnpjMask(emp.cnpj)})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Nome do Banco</Label>
                  <Input
                    placeholder="Ex: Itaú, Santander, Bradesco"
                    value={bancoNome}
                    onChange={(e) => setBancoNome(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Agência</Label>
                  <Input
                    placeholder="Ex: 0123"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Número da Conta</Label>
                  <Input
                    placeholder="Ex: 12345-6"
                    value={conta}
                    onChange={(e) => setConta(e.target.value)}
                    className="h-9 text-xs bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700">Tipo de Conta</Label>
                  <Select value={tipoConta} onValueChange={(v: "CORRENTE" | "POUPANCA") => setTipoConta(v)}>
                    <SelectTrigger className="h-9 text-xs bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CORRENTE" className="text-xs">Conta Corrente</SelectItem>
                      <SelectItem value="POUPANCA" className="text-xs">Poupança</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Salvar Conta
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-slate-400 text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Carregando contas...
            </div>
          ) : contas.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <CreditCard className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-60" />
              <p className="text-sm font-medium text-slate-600">Nenhuma conta bancária cadastrada.</p>
              <p className="text-xs text-slate-400 mt-0.5">Cadastre as contas das empresas para conciliar recebimentos.</p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {contas.map((c) => (
                <div key={c.id} className="p-3.5 bg-white hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">{c.banco_nome}</span>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                          {c.tipo_conta || "CORRENTE"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        {c.agencia && <span>Agência: <strong className="text-slate-700">{c.agencia}</strong></span>}
                        <span>Conta: <strong className="text-slate-700">{c.conta}</strong></span>
                        <span>•</span>
                        <span className="text-indigo-700 font-medium truncate">
                          {c.empresa?.nome_fantasia || `Empresa #${c.empresa_id}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExcluirConta(c.id)}
                    disabled={deleteMutation.isPending}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
