import { MoneyInput } from "@/components/forms/MoneyInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCollaborator, useCreateVinculo, useEmpresas, useUpdateVinculo } from "@/hooks";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { cn } from "@/lib/utils";
import { ColaboradorCliente } from "@/types/database";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { timeMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Clock, DollarSign, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { ROLES } from "@/constants/permissions.enum";
import { TurnFormData, turnSchema } from "@/schemas/turnSchema";

interface CollaboratorTurnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collaboratorId: string;
  turnToEdit?: ColaboradorCliente | null;
  onSuccess?: () => void;
}

export function CollaboratorTurnDialog({
  open,
  onOpenChange,
  collaboratorId,
  turnToEdit,
  onSuccess,
}: CollaboratorTurnDialogProps) {
  const [openSections, setOpenSections] = useState<string[]>(["vinculo", "financeiro"]);
  const { data: clients } = useClientSelection(undefined, { enabled: open });
  const { data: empresas } = useEmpresas({ ativo: "true" }, { enabled: open });
  const { data: collaborator } = useCollaborator(collaboratorId);

  const createVinculo = useCreateVinculo();
  const updateVinculo = useUpdateVinculo();

  const formatCurrency = (val: number | null = 0) => {
    if (val === null || val === 0) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const form = useForm<any>({
    resolver: zodResolver(turnSchema),
    defaultValues: {
      cliente_id: "",
      empresa_id: "",
      hora_inicio: "",
      hora_fim: "",
      valor_contrato: "",
      valor_aluguel: "",
      valor_bonus: "",
      ajuda_custo: "",
      valor_mei: "",
      valor_adiantamento: "",
      data_inicio: "",
      isMotoboy: false,
    },
  });

  const isMotoboy = form.watch("isMotoboy");

  useEffect(() => {
    if (open) {
      if (turnToEdit) {
        form.reset({
          cliente_id: turnToEdit.cliente_id?.toString() || "",
          empresa_id: turnToEdit.empresa_id.toString(),
          hora_inicio: turnToEdit.hora_inicio.substring(0, 5),
          hora_fim: turnToEdit.hora_fim.substring(0, 5),
          valor_contrato: formatCurrency(turnToEdit.valor_contrato || 0),
          valor_aluguel: formatCurrency(turnToEdit.valor_aluguel || 0),
          valor_bonus: formatCurrency(turnToEdit.valor_bonus || 0),
          ajuda_custo: formatCurrency(turnToEdit.ajuda_custo || 0),
          valor_mei: formatCurrency(turnToEdit.valor_mei || 0),
          valor_adiantamento: formatCurrency(turnToEdit.valor_adiantamento || 0),
          data_inicio: turnToEdit.data_inicio || new Date().toISOString().split('T')[0],
          isMotoboy: collaborator?.perfil?.nome === ROLES.MOTOBOY,
        });
      } else {
        const isM = !!(collaborator?.perfil?.nome?.toLowerCase() === ROLES.MOTOBOY.toLowerCase());
        form.reset({
          cliente_id: "",
          empresa_id: "",
          hora_inicio: "",
          hora_fim: "",
          valor_contrato: "",
          valor_aluguel: "",
          valor_bonus: "",
          ajuda_custo: "",
          valor_mei: "",
          valor_adiantamento: "",
          data_inicio: "",
          isMotoboy: isM,
        });
      }
      setOpenSections(["vinculo", "financeiro"]);
    } else {
      form.reset();
    }
  }, [open, turnToEdit, form, collaborator]);

  const onSubmit = async (values: TurnFormData) => {
    try {
      const data = {
        ...values,
        colaborador_id: collaboratorId,
        cliente_id: (values.isMotoboy && values.cliente_id) ? parseInt(values.cliente_id) : null,
        empresa_id: parseInt(values.empresa_id),
        valor_contrato: values.valor_contrato,
        valor_aluguel: values.valor_aluguel,
        valor_bonus: values.valor_bonus,
        ajuda_custo: values.ajuda_custo,
        valor_mei: values.valor_mei,
        valor_adiantamento: values.valor_adiantamento,
        data_inicio: values.data_inicio,
      };

      if (turnToEdit) {
        await updateVinculo.mutateAsync({ id: turnToEdit.id, ...data });
      } else {
        await createVinculo.mutateAsync(data);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isSubmitting = createVinculo.isPending || updateVinculo.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}>
      <DialogContent
        className="w-full max-w-2xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {turnToEdit ? "Editar Turno" : "Novo Turno"}
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent bg-gray-50/30">
          <Form {...form}>
            <form id="collaborator-turn-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-4"
              >
                <AccordionItem value="vinculo" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                  <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      Dados do Turno
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cliente_id"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              Cliente 
                              {isMotoboy && <span className="text-red-500">*</span>}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className={cn(
                                  "h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors",
                                  fieldState.error && "border-red-500 focus:ring-red-500"
                                )}>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {clients?.map((client) => (
                                  <SelectItem key={client.id} value={client.id.toString()}>
                                    {client.nome_fantasia}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="empresa_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Empresa (Contratante) <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {empresas?.map((emp) => (
                                  <SelectItem key={emp.id} value={emp.id.toString()}>
                                    {emp.nome_fantasia}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="hora_inicio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Início <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="text"
                                  placeholder="00:00"
                                  maxLength={5}
                                  {...field}
                                  className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono"
                                  onChange={(e) => field.onChange(timeMask(e.target.value))}
                                  autoComplete="off"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hora_fim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fim <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                  type="text"
                                  placeholder="00:00"
                                  maxLength={5}
                                  {...field}
                                  className="pl-10 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors font-mono"
                                  onChange={(e) => field.onChange(timeMask(e.target.value))}
                                  autoComplete="off"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="financeiro" className="border rounded-2xl px-4 bg-white shadow-sm border-gray-100">
                  <AccordionTrigger className="hover:no-underline py-4 font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      Configuração Financeira
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pt-2 space-y-6">
                    {/* 1. PERÍODO */}
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="data_inicio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data de Início do Período <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input type="date" {...field} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                              </FormControl>
                              <FormDescription className="text-[10px] leading-tight">
                                Usado para calcular o pro-rata automático no primeiro mês de trabalho.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* 2. CRÉDITOS */}
                    <div className="space-y-3 bg-green-50/30 p-4 rounded-2xl border border-green-100">
                      <h4 className="text-sm font-bold text-green-800 ml-1">Ganhos / Créditos</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="valor_contrato"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Salário Base"
                              required={true}
                              inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="valor_mei"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Valor MEI"
                              required={false}
                              inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                          )}
                        />
                      </div>

                      {collaborator?.perfil?.nome === ROLES.MOTOBOY && (
                        <>
                          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-green-100">
                            <FormField
                              control={form.control}
                              name="valor_aluguel"
                              render={({ field }) => (
                                <MoneyInput
                                  field={field}
                                  label="Aluguel Moto"
                                  required={false}
                                  inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors text-xs"
                                />
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="ajuda_custo"
                              render={({ field }) => (
                                <MoneyInput
                                  field={field}
                                  label="Ajuda Custo"
                                  required={false}
                                  inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors text-xs"
                                />
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 pt-2">
                            <FormField
                              control={form.control}
                              name="valor_bonus"
                              render={({ field }) => (
                                <MoneyInput
                                  field={field}
                                  label="Bônus Zero Falta"
                                  required={false}
                                  inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors text-xs"
                                />
                              )}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* 3. DÉBITOS */}
                    <div className="space-y-3 bg-red-50/30 p-4 rounded-2xl border border-red-100">
                      <h4 className="text-sm font-bold text-red-800 ml-1">Descontos / Débitos</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="valor_adiantamento"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Adiantamento"
                              required={false}
                              inputClassName="pl-12 h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-white"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="collaborator-turn-form"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : turnToEdit ? "Salvar Alterações" : "Criar Turno"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
