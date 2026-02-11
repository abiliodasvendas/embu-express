import { MoneyInput } from "@/components/forms/MoneyInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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
import { Switch } from "@/components/ui/switch";
import { useCreateVinculo, useEmpresas, useUpdateVinculo } from "@/hooks";
import { useClientSelection } from "@/hooks/ui/useClientSelection";
import { ColaboradorCliente } from "@/types/database";
import { mockGenerator } from "@/utils/mocks/generator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, DollarSign, Loader2, Wand2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
  const { data: clients } = useClientSelection(undefined, { enabled: open });
  const { data: empresas } = useEmpresas({ ativo: "true" }, { enabled: open });
  
  const createVinculo = useCreateVinculo();
  const updateVinculo = useUpdateVinculo();

  // Helper to format currency for default values
  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
    }).format(val);
  };

  const form = useForm<any>({ // using any for defaultValues because schema expects strings for display but transforms to numbers
    resolver: zodResolver(turnSchema),
    defaultValues: {
      cliente_id: "",
      empresa_id: "",
      hora_inicio: "08:00",
      hora_fim: "18:00",
      valor_contrato: "",
      valor_aluguel: "",
      valor_bonus: "",
      ajuda_custo: "",
      mei: false,
    },
  });

  useEffect(() => {
    if (open) {
      if (turnToEdit) {
        form.reset({
          cliente_id: turnToEdit.cliente_id.toString(),
          empresa_id: turnToEdit.empresa_id.toString(),
          hora_inicio: turnToEdit.hora_inicio.substring(0, 5),
          hora_fim: turnToEdit.hora_fim.substring(0, 5),
          valor_contrato: formatCurrency(turnToEdit.valor_contrato || 0),
          valor_aluguel: formatCurrency(turnToEdit.valor_aluguel || 0),
          valor_bonus: formatCurrency(turnToEdit.valor_bonus || 0),
          ajuda_custo: formatCurrency(turnToEdit.ajuda_custo || 0),
          mei: turnToEdit.mei || false,
        });
      } else {
        form.reset({
          cliente_id: "",
          empresa_id: "",
          hora_inicio: "08:00",
          hora_fim: "18:00",
          valor_contrato: "",
          valor_aluguel: "",
          valor_bonus: "",
          ajuda_custo: "",
          mei: false,
        });
      }
    }
  }, [open, turnToEdit, form]);

  const handleMagicFill = (e: React.MouseEvent) => {
    e.preventDefault();
    const mockTurn = mockGenerator.turn();
    
    // Select random client & company if available
    if (clients && clients.length > 0) {
        const randomClient = clients[Math.floor(Math.random() * clients.length)];
        form.setValue("cliente_id", randomClient.id.toString());
    }
    
    if (empresas && empresas.length > 0) {
        const randomEmpresa = empresas[Math.floor(Math.random() * empresas.length)];
        form.setValue("empresa_id", randomEmpresa.id.toString());
    }

    form.setValue("hora_inicio", mockTurn.hora_inicio);
    form.setValue("hora_fim", mockTurn.hora_fim);
    form.setValue("valor_contrato", formatCurrency(mockTurn.valor_contrato));
    form.setValue("valor_aluguel", formatCurrency(mockTurn.valor_aluguel));
    form.setValue("valor_bonus", formatCurrency(mockTurn.valor_bonus));
    form.setValue("ajuda_custo", formatCurrency(mockTurn.ajuda_custo));
    form.setValue("mei", mockTurn.mei);
  };

  const onSubmit = async (values: TurnFormData) => {
    try {
      const data = {
        ...values,
        colaborador_id: collaboratorId,
        cliente_id: parseInt(values.cliente_id),
        empresa_id: parseInt(values.empresa_id),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[500px] rounded-3xl"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between pr-6 space-y-0">
          <div className="space-y-1">
            <DialogTitle>{turnToEdit ? "Editar Vínculo" : "Novo Vínculo"}</DialogTitle>
          </div>
          {!turnToEdit && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleMagicFill}
              className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
              title="Preencher Automaticamente (Magic Fill)"
            >
              <Wand2 className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cliente_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl bg-gray-50 border-gray-100">
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
                        <SelectTrigger className="rounded-xl bg-gray-50 border-gray-100">
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

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700">Horários do Turno</h4>
              </div>

               <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hora_inicio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input type="time" {...field} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
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
                        <Input type="time" {...field} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
               <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-700">Configuração Financeira</h4>
              </div>

              <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-200/60 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valor_contrato"
                    render={({ field }) => (
                      <MoneyInput
                        field={field}
                        label="Valor Contrato"
                        required={true}
                        inputClassName="pl-12 h-11 rounded-xl bg-white border-gray-200"
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_aluguel"
                    render={({ field }) => (
                       <MoneyInput
                        field={field}
                        label="Aluguel Moto"
                        required={true}
                        inputClassName="pl-12 h-11 rounded-xl bg-white border-gray-200"
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ajuda_custo"
                    render={({ field }) => (
                       <MoneyInput
                        field={field}
                        label="Ajuda Custo"
                        required={true}
                        inputClassName="pl-12 h-11 rounded-xl bg-white border-gray-200"
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="valor_bonus"
                    render={({ field }) => (
                       <MoneyInput
                        field={field}
                        label="Bônus Zero Falta"
                        required={true}
                        inputClassName="pl-12 h-11 rounded-xl bg-white border-green-100 text-green-700"
                      />
                    )}
                  />
                </div>
              
              <div className="pt-2">
                <FormField
                  control={form.control}
                  name="mei"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-white border-gray-200 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-semibold text-gray-800">Contratação via MEI</FormLabel>
                        <p className="text-xs text-muted-foreground">O colaborador emitirá nota fiscal para recebimento?</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
               </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl px-8">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : turnToEdit ? "Salvar Alterações" : "Criar Vínculo"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
