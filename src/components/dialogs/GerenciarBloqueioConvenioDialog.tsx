import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
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
import { ShieldAlert, Loader2, Store, CheckCircle2, Search } from "lucide-react";

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

  const auditoriaBloqueio = useMemo(() => {
    if (!bloqueioData?.bloqueios || bloqueioData.bloqueios.length === 0) return null;
    const b = bloqueioData.bloqueios[0];
    const dataFormatada = new Date(b.criado_em).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    return {
      autor: b.criado_por_usuario?.nome_completo || "Não informado",
      dataFormatada,
    };
  }, [bloqueioData]);

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
    <BaseDialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
      maxWidth="md"
    >
      <BaseDialog.Header
        icon={<ShieldAlert className="h-5 w-5 text-foreground" />}
        title="Acesso a Convênios"
        subtitle={`Gerenciamento de permissões e bloqueios para ${colaboradorNome}`}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />

      <BaseDialog.Body className="py-5 px-6 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs">Carregando permissões...</p>
          </div>
        ) : (
          <>
            {auditoriaBloqueio && (bloqueioData?.bloqueio_geral || (bloqueioData?.convenios_bloqueados_ids?.length ?? 0) > 0) && (
              <Banner
                variant="info"
                description={`Restrição aplicada por ${auditoriaBloqueio.autor} em ${auditoriaBloqueio.dataFormatada}.`}
              />
            )}

            <div className="rounded-[18px] border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 pr-2">
                  <Label className="text-sm font-semibold text-amber-950 cursor-pointer">
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Bloqueio por Parceiro Específico
                  </Label>
                  <span className="text-xs text-muted-foreground font-medium">
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
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Buscar convênio..."
                        value={searchConvenio}
                        onChange={(e) => setSearchConvenio(e.target.value)}
                        className="pl-10 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all"
                      />
                    </div>

                    <div className="border border-border rounded-[18px] divide-y divide-border/60 max-h-48 overflow-y-auto bg-card">
                      {conveniosFiltrados.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          Nenhum convênio encontrado com esse termo.
                        </div>
                      ) : (
                        conveniosFiltrados.map((c) => {
                          const isBlocked = conveniosBloqueados.includes(c.id);
                          return (
                            <div
                              key={c.id}
                              className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <Store className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm font-medium text-foreground">
                                  {c.nome}
                                </span>
                              </div>
                              <Switch
                                checked={isBlocked}
                                onCheckedChange={(checked) =>
                                  handleToggleConvenio(c.id, checked)
                                }
                                className="data-[state=checked]:bg-destructive"
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
              <Label className="text-xs font-semibold text-foreground">
                Motivo / Observação da Restrição
              </Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Atingiu limite mensal acordado ou pendência de manutenção..."
                className="rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all min-h-[80px] resize-none"
                rows={3}
              />
            </div>

            {!bloqueioGeral && conveniosBloqueados.length === 0 && (
              <Banner
                variant="success"
                icon={CheckCircle2}
                title="Colaborador Liberado"
                description="Nenhuma restrição manual ativa. O colaborador está liberado para utilizar os convênios normalmente, respeitando o limite mensal da política interna."
              />
            )}
          </>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
          disabled={salvarBloqueios.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
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
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default GerenciarBloqueioConvenioDialog;
