import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Banner } from "@/components/ui/Banner";
import { useConvenios } from "@/hooks/api/useConvenios";
import {
  useBloqueiosColaborador,
  useSalvarBloqueiosColaborador,
} from "@/hooks/api/useBloqueiosConvenios";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "@/utils/notifications/toast";
import { ShieldAlert, X, Loader2, Store, CheckCircle2, Search } from "lucide-react";

export interface GerenciarBloqueioConvenioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaboradorId: string;
  colaboradorNome: string;
}

export function GerenciarBloqueioConvenioDialog({
  open,
  onOpenChange,
  colaboradorId,
  colaboradorNome,
}: GerenciarBloqueioConvenioDialogProps) {
  const { data: convenios = [], isLoading: isLoadingConvenios } = useConvenios();
  const { data: bloqueioData, isLoading: isLoadingBloqueios } =
    useBloqueiosColaborador(colaboradorId);
  const salvarBloqueios = useSalvarBloqueiosColaborador();

  const [bloqueioGeral, setBloqueioGeral] = useState(false);
  const [conveniosBloqueados, setConveniosBloqueados] = useState<string[]>([]);
  const [motivo, setMotivo] = useState("");
  const [searchConvenio, setSearchConvenio] = useState("");

  const conveniosFiltrados = useMemo(() => {
    if (!searchConvenio.trim()) return convenios;
    return convenios.filter((c) =>
      c.nome.toLowerCase().includes(searchConvenio.toLowerCase())
    );
  }, [convenios, searchConvenio]);

  useEffect(() => {
    if (bloqueioData) {
      setBloqueioGeral(bloqueioData.bloqueio_geral);
      setConveniosBloqueados(bloqueioData.convenios_bloqueados_ids || []);
      setMotivo(bloqueioData.motivo || "");
    }
  }, [bloqueioData]);

  const handleToggleConvenio = (id: string, checked: boolean) => {
    if (checked) {
      setConveniosBloqueados((prev) => [...prev, id]);
    } else {
      setConveniosBloqueados((prev) => prev.filter((cId) => cId !== id));
    }
  };

  const handleSave = async () => {
    try {
      await salvarBloqueios.mutateAsync({
        colaboradorId,
        payload: {
          bloqueio_geral: bloqueioGeral,
          convenios_bloqueados_ids: bloqueioGeral ? [] : conveniosBloqueados,
          motivo: motivo.trim() || null,
        },
      });

      toast.success("Restrições de convênio atualizadas com sucesso!");
      safeCloseDialog(() => onOpenChange(false));
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(err.message || "Erro ao salvar restrições de convênio");
    }
  };

  const isLoading = isLoadingConvenios || isLoadingBloqueios;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
    >
      <DialogContent
        className="w-full max-w-lg p-0 gap-0 h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-gray-50 flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
      >
        <div className="bg-slate-900 p-5 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-amber-500/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <DialogTitle className="text-lg font-bold text-white tracking-tight">
            Acesso a Convênios
          </DialogTitle>
          <p className="text-slate-300 text-xs mt-0.5">
            {colaboradorNome}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-white space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-xs">Carregando permissões...</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 pr-2">
                    <Label className="text-sm font-bold text-amber-950">
                      Bloqueio Geral (Todos os Convênios)
                    </Label>
                    <p className="text-xs text-amber-800/80">
                      Impede imediatamente novos lançamentos em todas as lojas parceiras.
                    </p>
                  </div>
                  <Switch
                    checked={bloqueioGeral}
                    onCheckedChange={setBloqueioGeral}
                    className="data-[state=checked]:bg-amber-600"
                  />
                </div>
              </div>

              {!bloqueioGeral && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bloqueio por Parceiro Específico
                    </Label>
                    <span className="text-xs text-slate-400">
                      {conveniosBloqueados.length} selecionado(s)
                    </span>
                  </div>

                  {convenios.length === 0 ? (
                    <Banner
                      variant="info"
                      description="Nenhum convênio cadastrado no momento."
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          placeholder="Buscar convênio..."
                          value={searchConvenio}
                          onChange={(e) => setSearchConvenio(e.target.value)}
                          className="pl-8 h-8 rounded-xl text-xs bg-slate-50 border-slate-200 focus:bg-white"
                        />
                      </div>

                      <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 max-h-48 overflow-y-auto">
                        {conveniosFiltrados.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-400">
                            Nenhum convênio encontrado com esse termo.
                          </div>
                        ) : (
                          conveniosFiltrados.map((c) => {
                            const isBlocked = conveniosBloqueados.includes(c.id);
                            return (
                              <div
                                key={c.id}
                                className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Store className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="text-sm font-medium text-slate-700">
                                    {c.nome}
                                  </span>
                                </div>
                                <Switch
                                  checked={isBlocked}
                                  onCheckedChange={(checked) =>
                                    handleToggleConvenio(c.id, checked)
                                  }
                                  className="data-[state=checked]:bg-red-600"
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">
                  Motivo / Observação da Restrição
                </Label>
                <Textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Atingiu limite mensal acordado ou pendência de manutenção..."
                  className="rounded-xl resize-none text-xs"
                  rows={3}
                />
              </div>

              {!bloqueioGeral && conveniosBloqueados.length === 0 && (
                <Banner
                  variant="success"
                  icon={CheckCircle2}
                  title="Colaborador Liberado"
                  description="Nenhuma restrição manual ativa. O colaborador está liberado para utilizar os convênios normalmente, respeitando o limite automático mensal de margem."
                />
              )}
            </>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl text-xs h-10 px-4"
            onClick={() => safeCloseDialog(() => onOpenChange(false))}
            disabled={salvarBloqueios.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className="rounded-xl text-xs h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            onClick={handleSave}
            disabled={isLoading || salvarBloqueios.isPending}
          >
            {salvarBloqueios.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
