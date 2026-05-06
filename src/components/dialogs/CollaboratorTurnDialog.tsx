import { MoneyInput } from "@/components/forms/MoneyInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import {
  useCollaborator,
  useCreateVinculo,
  useEmpresas,
  useUnidades,
  useUpdateVinculo,
} from "@/hooks";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { cn } from "@/lib/utils";
import { ColaboradorCliente } from "@/types/database";
import { getLocalDate } from "@/utils/date";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { timeMask } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  CalendarDays,
  Clock,
  DollarSign,
  Loader2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { messages } from "@/constants/messages";
import { TurnFormData, TurnFormInput, turnSchema } from "@/schemas/turnSchema";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "sonner";

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
  const empresasParams = useMemo(() => ({ ativo: "true" }), []);
  const { data: clients } = useClientSelection(undefined, { enabled: open });
  const { data: empresas } = useEmpresas(empresasParams, { enabled: open });
  const { data: collaborator } = useCollaborator(collaboratorId);

  const createVinculo = useCreateVinculo();
  const updateVinculo = useUpdateVinculo();

  const onFormError = (errors: FieldErrors<TurnFormInput>) => {
    toast.error(messages.validacao.formularioComErros);
  };

  const formatCurrency = (val: number | null = 0) => {
    if (val === null || val === 0) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const form = useForm<TurnFormInput>({
    resolver: zodResolver(turnSchema),
    defaultValues: {
      cliente_id: "",
      unidade_id: "",
      empresa_id: "",
      valor_contrato: 0 as any,
      valor_aluguel: 0 as any,
      valor_bonus: 0 as any,
      ajuda_custo: 0 as any,
      valor_adiantamento: 0 as any,
      taxa_entrega: 0 as any,
      data_inicio: "",

      horarios: [],
    },
  });

  const watchedHorarios = useWatch({ control: form.control, name: "horarios" }) || [];

  useEffect(() => {
    if (open) {

      if (turnToEdit) {
        form.reset({
          cliente_id: turnToEdit.cliente_id?.toString() || "",
          unidade_id: turnToEdit.unidade_id?.toString() || "",
          empresa_id: turnToEdit.empresa_id.toString(),
          valor_contrato: formatCurrency(turnToEdit.valor_contrato || 0),
          valor_aluguel: formatCurrency(turnToEdit.valor_aluguel || 0),
          valor_bonus: formatCurrency(turnToEdit.valor_bonus || 0),
          ajuda_custo: formatCurrency(turnToEdit.ajuda_custo || 0),
          valor_adiantamento: formatCurrency(
            turnToEdit.valor_adiantamento || 0,
          ),
          taxa_entrega: formatCurrency(turnToEdit.taxa_entrega || 0),
          data_inicio: turnToEdit.data_inicio || "",

          horarios:
            turnToEdit.horarios?.map((h) => ({
              dia_semana: h.dia_semana,
              hora_inicio: (h.hora_inicio || "").substring(0, 5),
              hora_fim: (h.hora_fim || "").substring(0, 5),
              tolerancia_pausa_min: h.tolerancia_pausa_min || 0,
            })) || [],
        });
      } else {
        form.reset({
          cliente_id: "",
          unidade_id: "",
          empresa_id: "",
          valor_contrato: "" as any,
          valor_aluguel: "" as any,
          valor_bonus: "" as any,
          ajuda_custo: "" as any,
          valor_adiantamento: "" as any,
          taxa_entrega: "" as any,
          data_inicio: "",

          horarios: [],
        });
      }
    } else {
      form.reset();
    }
  }, [open, turnToEdit, collaborator]);

  const handleFillMagic = () => {
    const data = mockGenerator.turn();
    const empresa = empresas?.[0];

    form.reset({
      ...form.getValues(),
      ...data,
      empresa_id: empresa?.id.toString() || "",
      valor_contrato: formatCurrency(data.valor_contrato),
      valor_aluguel: formatCurrency(data.valor_aluguel),
      ajuda_custo: formatCurrency(data.ajuda_custo),
      valor_bonus: formatCurrency(data.valor_bonus),
      taxa_entrega: formatCurrency(data.taxa_entrega),
      data_inicio: getLocalDate(),
    });
  };

  const selectedClientId = form.watch("cliente_id");
  const { data: unidades } = useUnidades(
    selectedClientId ? parseInt(selectedClientId) : undefined,
    { enabled: open },
  );

  // Auto-seleção de unidade se houver apenas uma
  useEffect(() => {
    if (unidades && unidades.length === 1 && !form.getValues("unidade_id")) {
      form.setValue("unidade_id", unidades[0].id.toString());
    }
  }, [unidades, form]);

  const selectedUnidadeId = form.watch("unidade_id");
  const selectedUnidade = unidades?.find(
    (u) => u.id.toString() === selectedUnidadeId,
  );
  const clientScale = selectedUnidade?.escala_semanal || [1, 2, 3, 4, 5, 6, 7];

  const lastUnidadeRef = useRef<string | null>(null);

  // Sincroniza horários com a escala da unidade
  useEffect(() => {
    if (!open) {
      lastUnidadeRef.current = null;
      return;
    }

    if (!turnToEdit && selectedUnidadeId && selectedUnidadeId !== lastUnidadeRef.current && selectedUnidade) {
      lastUnidadeRef.current = selectedUnidadeId;

      // Ao trocar de unidade, ativamos todos os dias da nova escala
      const initialHorarios = (selectedUnidade.escala_semanal || [1, 2, 3, 4, 5, 6, 7]).map(diaId => ({
        dia_semana: diaId,
        hora_inicio: "",
        hora_fim: "",
        tolerancia_pausa_min: "" as any,
      }));
      form.setValue("horarios", initialHorarios, { shouldValidate: true });
      return;
    }

    // Se mudar de unidade ou escala, limpamos os dias que não fazem mais parte da escala atual
    if (selectedUnidadeId && selectedUnidade && (turnToEdit || selectedUnidadeId === lastUnidadeRef.current)) {
      const current = form.getValues("horarios") || [];
      const updated = current.filter((h) => clientScale.includes(h.dia_semana));
      if (updated.length !== current.length) {
        form.setValue("horarios", updated);
      }
    } else if (!selectedUnidadeId && !turnToEdit && open) {
      // Se desmarcar a unidade em modo novo turno, garante que limpa horários
      lastUnidadeRef.current = null;
      const current = form.getValues("horarios");
      if (current && current.length > 0) {
        form.setValue("horarios", [], { shouldValidate: true });
      }
    }
  }, [selectedUnidadeId, selectedUnidade, clientScale, form, turnToEdit, open]);

  const onSubmit = async (values: TurnFormInput) => {
    try {
      const parsedValues = turnSchema.parse(values) as TurnFormData;

      const data = {
        ...parsedValues,
        colaborador_id: collaboratorId,
        cliente_id: parseInt(parsedValues.cliente_id),
        unidade_id: parseInt(parsedValues.unidade_id),
        empresa_id: parseInt(parsedValues.empresa_id),
        horarios: parsedValues.horarios,
      };

      if (turnToEdit) {
        await updateVinculo.mutateAsync({ id: turnToEdit.id, ...data } as any);
      } else {
        await createVinculo.mutateAsync(data as any);
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "";
      toast.error(
        errorMessage ||
        (turnToEdit
          ? messages.cliente.erro.atualizar
          : messages.cliente.erro.criar),
      );
    }
  };

  const diasSemana = [
    { id: 0, label: "Domingo" },
    { id: 1, label: "Segunda-feira" },
    { id: 2, label: "Terça-feira" },
    { id: 3, label: "Quarta-feira" },
    { id: 4, label: "Quinta-feira" },
    { id: 5, label: "Sexta-feira" },
    { id: 6, label: "Sábado" },
  ];

  const toggleDia = useCallback(
    (dia: number, checked: boolean) => {
      if (!selectedUnidadeId && !turnToEdit) return;

      const current = form.getValues("horarios") || [];
      if (checked) {
        const updated = [
          ...current,
          {
            dia_semana: dia,
            hora_inicio: "",
            hora_fim: "",
            tolerancia_pausa_min: "" as any,
          },
        ].sort((a, b) => a.dia_semana - b.dia_semana);

        form.setValue("horarios", updated, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } else {
        form.setValue(
          "horarios",
          current.filter((h) => h.dia_semana !== dia),
          { shouldValidate: true, shouldDirty: true },
        );
      }
    },
    [form, selectedUnidadeId, turnToEdit],
  );

  const handleRepeatAll = useCallback(() => {
    const current = form.getValues("horarios") || [];
    if (current.length < 2) return;

    const first = current[0];
    const updated = current.map((h, i) => {
      if (i === 0) return h;
      return {
        ...h,
        hora_inicio: first.hora_inicio,
        hora_fim: first.hora_fim,
        tolerancia_pausa_min: first.tolerancia_pausa_min,
      };
    });

    form.setValue("horarios", updated, {
      shouldValidate: true,
      shouldDirty: true,
    });
    toast.success("Horários replicados para todos os dias!");
  }, [form]);

  const isSubmitting = createVinculo.isPending || updateVinculo.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => !val && safeCloseDialog(() => onOpenChange(false))}
    >
      <DialogContent
        className="w-full max-w-5xl p-0 gap-0 bg-gray-50 h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-[2rem] border-0 shadow-2xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 sm:px-8 relative shrink-0 shadow-sm z-10">
          {import.meta.env.DEV && (
            <div className="absolute left-6 top-6 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-10 w-10 shadow-sm border border-white/20 transition-all active:scale-95"
                onClick={handleFillMagic}
                title="Preencher com dados mágicos"
              >
                <Wand2 className="h-5 w-5" />
              </Button>
            </div>
          )}

          <DialogClose className="absolute right-6 top-6 text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 active:scale-95">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="flex flex-col items-center pt-2">
            <div className="bg-white/20 p-3 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner ring-1 ring-white/30">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold text-white tracking-tight text-center">
              {turnToEdit ? "Editar Turno" : "Novo Turno"}
            </DialogTitle>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <Form {...form}>
            <form
              id="collaborator-turn-form"
              onSubmit={form.handleSubmit(onSubmit, onFormError)}
              className="lg:grid lg:grid-cols-12 lg:gap-10"
            >
              {/* COLUNA ESQUERDA: VÍNCULO E ESCALA */}
              <div className="lg:col-span-7 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-500" /> Dados
                    Institucionais
                  </h3>
                  <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="cliente_id"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 font-bold ml-1 text-sm">
                              Cliente
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    "h-12 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all",
                                    fieldState.error &&
                                    "border-red-500 focus:ring-red-500/20",
                                  )}
                                >
                                  <SelectValue placeholder="Selecione o Cliente" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl" side="bottom" sideOffset={4}>
                                {clients?.map((client) => (
                                  <SelectItem
                                    key={client.id}
                                    value={client.id.toString()}
                                    className="rounded-xl cursor-pointer"
                                  >
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
                        name="unidade_id"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-gray-600 font-bold ml-1 text-sm">
                              Unidade
                              <span className="text-red-500 ml-1">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!selectedClientId}
                            >
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    "h-12 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-60",
                                    fieldState.error &&
                                    "border-red-500 focus:ring-red-500/20",
                                  )}
                                >
                                  <SelectValue
                                    placeholder={
                                      !selectedClientId
                                        ? "Aguardando Cliente"
                                        : "Selecione a Unidade"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl" side="bottom" sideOffset={4}>
                                {unidades?.map((unidade) => (
                                  <SelectItem
                                    key={unidade.id}
                                    value={unidade.id.toString()}
                                    className="rounded-xl cursor-pointer"
                                  >
                                    {unidade.nome_unidade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="empresa_id"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-600 font-bold ml-1 text-sm">
                            Empresa Contratante{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-12 rounded-2xl bg-gray-50/50 border-gray-200 hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all",
                                  fieldState.error &&
                                  "border-red-500 focus:ring-red-500/20",
                                )}
                              >
                                <SelectValue placeholder="Selecione a Empresa" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl" side="bottom" sideOffset={4}>
                              {empresas?.map((emp) => (
                                <SelectItem
                                  key={emp.id}
                                  value={emp.id.toString()}
                                  className="rounded-xl cursor-pointer"
                                >
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
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" /> Escala Semanal{" "}
                      <span className="text-red-500">*</span>
                    </h3>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
                        Marque se trabalha no dia
                      </span>
                      {!selectedUnidadeId && (
                        <span className="text-[10px] font-bold text-amber-500 animate-pulse uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                          Selecione uma unidade primeiro
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 relative transition-all duration-300",
                      !selectedUnidadeId &&
                      !turnToEdit &&
                      "opacity-40 grayscale pointer-events-none select-none",
                    )}
                  >
                    {diasSemana.map((dia) => {
                      const isClosed = !clientScale.includes(dia.id);
                      const config = (watchedHorarios || []).find(
                        (h: any) => h.dia_semana === dia.id,
                      );
                      const index = (watchedHorarios || []).findIndex(
                        (h: any) => h.dia_semana === dia.id,
                      );
                      const isWorking = !!config;

                      return (
                        <div
                          key={dia.id}
                          className={cn(
                            "flex flex-col gap-3 p-4 border rounded-3xl transition-all duration-300 relative overflow-hidden group items-start",
                            isClosed ? "opacity-50" : "cursor-pointer",
                            isWorking
                              ? "bg-white border-blue-200 shadow-[0_2px_12px_-4px_rgba(59,130,246,0.15)] hover:border-blue-400 hover:shadow-lg"
                              : "bg-gray-100/50 border-gray-100 hover:bg-white hover:border-blue-200 hover:shadow-md",
                            isWorking &&
                            form.formState.errors.horarios?.[index] &&
                            "border-red-300 bg-red-50/20",
                          )}
                          onClick={() =>
                            !isClosed && toggleDia(dia.id, !isWorking)
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                              <div
                                className="relative flex items-center h-6"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Checkbox
                                  id={`dia-${dia.id}`}
                                  checked={isWorking}
                                  onCheckedChange={(val) =>
                                    !isClosed && toggleDia(dia.id, !!val)
                                  }
                                  disabled={isClosed}
                                  className={cn(
                                    "h-5 w-5 rounded-lg border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 transition-all pointer-events-auto",
                                    isWorking &&
                                    (form.formState.errors.horarios as any)?.[
                                    index
                                    ] &&
                                    "border-red-500",
                                  )}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Label
                                  htmlFor={`dia-${dia.id}`}
                                  className={cn(
                                    "text-base transition-colors cursor-pointer",
                                    isWorking
                                      ? "text-gray-900 font-extrabold"
                                      : "text-gray-500 font-bold",
                                    isClosed && "line-through opacity-70",
                                  )}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isClosed)
                                      toggleDia(dia.id, !isWorking);
                                  }}
                                >
                                  {dia.label}
                                </Label>
                                {isWorking &&
                                  (form.formState.errors.horarios as any)?.[
                                  index
                                  ] ? (
                                  <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5 animate-pulse">
                                    Preencha os horários
                                  </span>
                                ) : !isWorking && !isClosed ? (
                                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-0.5">
                                    Clique para ativar
                                  </span>
                                ) : (
                                  isClosed && (
                                    <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-0.5">
                                      Unidade Fechada
                                    </span>
                                  )
                                )}
                              </div>
                            </div>

                            {isWorking && (
                              <div
                                className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border transition-all",
                                  (form.formState.errors.horarios as any)?.[
                                    index
                                  ]
                                    ? "bg-red-500 text-white border-red-600 animate-bounce"
                                    : "bg-blue-50 text-blue-600 border-blue-100",
                                )}
                              >
                                {(form.formState.errors.horarios as any)?.[
                                  index
                                ]
                                  ? "Incompleto"
                                  : "Trabalha"}
                              </div>
                            )}
                            {isClosed && (selectedUnidadeId || turnToEdit) && (
                              <div className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-red-100">
                                Unidade Fechada
                              </div>
                            )}
                          </div>

                          {isWorking && config && index !== -1 && (
                            <div
                              className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 mt-1 w-full"
                              onClick={(e) => e.preventDefault()} // stop default label behavior for child clicks
                            >
                              <div className="space-y-1.5 flex flex-col">
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider pl-1",
                                    (form.formState.errors.horarios as any)?.[
                                      index
                                    ]?.hora_inicio
                                      ? "text-red-500"
                                      : "text-gray-500",
                                  )}
                                >
                                  Início <span className="text-red-500">*</span>
                                </span>
                                <Input
                                  placeholder="00:00"
                                  className={cn(
                                    "h-10 text-sm font-mono text-center rounded-xl transition-all",
                                    (form.formState.errors.horarios as any)?.[
                                      index
                                    ]?.hora_inicio
                                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                                      : "bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20",
                                  )}
                                  value={config.hora_inicio}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const current =
                                      form.getValues("horarios") || [];
                                    const newHorarios = [...current];
                                    if (newHorarios[index]) {
                                      newHorarios[index].hora_inicio = timeMask(
                                        e.target.value,
                                      );
                                      form.setValue("horarios", newHorarios, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5 flex flex-col">
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider pl-1",
                                    (form.formState.errors.horarios as any)?.[
                                      index
                                    ]?.hora_fim
                                      ? "text-red-500"
                                      : "text-gray-500",
                                  )}
                                >
                                  Fim <span className="text-red-500">*</span>
                                </span>
                                <Input
                                  placeholder="00:00"
                                  className={cn(
                                    "h-10 text-sm font-mono text-center rounded-xl transition-all",
                                    (form.formState.errors.horarios as any)?.[
                                      index
                                    ]?.hora_fim
                                      ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                                      : "bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20",
                                  )}
                                  value={config.hora_fim}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => {
                                    const current =
                                      form.getValues("horarios") || [];
                                    const newHorarios = [...current];
                                    if (newHorarios[index]) {
                                      newHorarios[index].hora_fim = timeMask(
                                        e.target.value,
                                      );
                                      form.setValue("horarios", newHorarios, {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                      });
                                    }
                                  }}
                                />
                              </div>
                              <div className="space-y-1.5 flex flex-col relative">
                                <span
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wider pl-1",
                                    (form.formState.errors.horarios as any)?.[
                                      index
                                    ]?.tolerancia_pausa_min
                                      ? "text-red-500"
                                      : "text-gray-500",
                                  )}
                                >
                                  Pausa <span className="text-red-500">*</span>
                                </span>
                                <div
                                  className="relative"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Input
                                    placeholder="Ex: 60"
                                    className={cn(
                                      "h-10 text-sm font-mono text-center pl-2 pr-8 rounded-xl transition-all",
                                      (form.formState.errors.horarios as any)?.[
                                        index
                                      ]?.tolerancia_pausa_min
                                        ? "bg-red-50 border-red-300 focus:ring-red-500/20"
                                        : "bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20",
                                    )}
                                    value={String(
                                      config.tolerancia_pausa_min ?? "",
                                    )}
                                    onChange={(e) => {
                                      const current =
                                        form.getValues("horarios") || [];
                                      const newHorarios = [...current];
                                      if (newHorarios[index]) {
                                        newHorarios[
                                          index
                                        ].tolerancia_pausa_min = e.target.value;
                                        form.setValue("horarios", newHorarios, {
                                          shouldValidate: true,
                                          shouldDirty: true,
                                        });
                                      }
                                    }}
                                  />
                                  <span className="absolute right-3 top-[11px] text-[9px] text-gray-400 font-bold pointer-events-none tracking-widest">
                                    MIN
                                  </span>
                                </div>
                              </div>
                              {index === 0 && watchedHorarios.length > 1 && (
                                <div className="col-span-3 pt-1 flex justify-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRepeatAll();
                                    }}
                                    className="h-8 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-2 rounded-xl border border-blue-100/50"
                                  >
                                    <Wand2 className="h-3 w-3" />
                                    Repetir para todos
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {form.formState.errors.horarios?.message && (
                    <p className="text-sm font-medium text-red-500 mt-2 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      {form.formState.errors.horarios.message}
                    </p>
                  )}
                </section>
              </div>

              {/* COLUNA DIREITA: FINANCEIRO E DÉBITOS */}
              <div className="lg:col-span-5 space-y-8 mt-10 lg:mt-0">
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />{" "}
                    Remuneração / Ganhos
                  </h3>

                  <div className="bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 p-5 sm:p-6 rounded-3xl border border-emerald-100/50 shadow-[0_2px_10px_-4px_rgba(16,185,129,0.05)] space-y-5 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>

                    <FormField
                      control={form.control}
                      name="data_inicio"
                      render={({ field }) => (
                        <FormItem className="relative z-10">
                          <FormLabel className="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider">
                            Data de Início {" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="h-12 rounded-2xl bg-white/70 backdrop-blur-sm border-emerald-200 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-emerald-950"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="valor_contrato"
                      render={({ field }) => (
                        <MoneyInput
                          field={field}
                          label="Salário Base"
                          required={true}
                          labelClassName="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider"
                        />
                      )}
                    />

                    <div className="pt-2 grid grid-cols-1 gap-5 relative z-10">
                      <FormField
                        control={form.control}
                        name="valor_bonus"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Bônus Zero Falta"
                            labelClassName="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider"
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="valor_aluguel"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Aluguel Veículo"
                            labelClassName="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider"
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ajuda_custo"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Ajuda de Custo"
                            labelClassName="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider"
                          />
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="taxa_entrega"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Taxa Entrega"
                            labelClassName="text-emerald-800 font-bold ml-1 text-xs uppercase tracking-wider"
                          />
                        )}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-red-500" /> Descontos
                  </h3>

                  <div className="bg-gradient-to-br from-red-50/50 to-red-100/30 p-5 sm:p-6 rounded-3xl border border-red-100/50 shadow-[0_2px_10px_-4px_rgba(239,68,68,0.05)] space-y-4 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/10 rounded-full blur-2xl"></div>

                    <FormField
                      control={form.control}
                      name="valor_adiantamento"
                      render={({ field }) => (
                        <MoneyInput
                          field={field}
                          label="Adiantamento"
                          labelClassName="text-red-900 font-bold ml-1 text-xs uppercase tracking-wider"
                        />
                      )}
                    />
                    <p className="text-xs text-gray-400 ml-1 font-medium leading-relaxed max-w-[90%]">
                      Este valor será incluído e descontado após a confirmação
                      do adiantamento no fechamento financeiro.
                    </p>
                  </div>
                </section>
              </div>
            </form>
          </Form>
        </div>

        <div className="p-4 sm:p-6 sm:px-8 border-t border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-gray-400 font-medium hidden sm:block">
            Preencha todos os campos obrigatórios (*)
          </p>
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none h-12 px-6 rounded-2xl border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="collaborator-turn-form"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none h-12 px-8 rounded-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Gravando...
                </>
              ) : turnToEdit ? (
                "Salvar Alterações"
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
