import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { kmMask, timeMask } from "@/utils/masks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, Gauge } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ManualTimeRecordFormValues } from "@/schemas/pontoSchema";
import { RegistroPonto } from "@/types/database";

interface TimeRecordFieldsSectionProps {
  form: UseFormReturn<ManualTimeRecordFormValues>;
  isManualMode: boolean;
  isFixingInconsistency: boolean;
  isMotoboyUser: boolean;
  record?: RegistroPonto | null;
  selectedCollaboratorId?: string;
  hasTurnos: boolean;
}

export function TimeRecordFieldsSection({
  form,
  isManualMode,
  isFixingInconsistency,
  isMotoboyUser,
  record,
  selectedCollaboratorId,
  hasTurnos,
}: TimeRecordFieldsSectionProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="data_referencia"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Data de Referência <span className="text-destructive">*</span>
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={!isManualMode}
                    className={cn(
                      "h-11 w-full pl-3 text-left font-normal rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm focus:bg-white focus:border-primary disabled:opacity-80",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      {field.value ? (
                        format(new Date(field.value + "T00:00:00"), "dd 'de' MMMM, yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-[18px] border border-border shadow-md" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                  onSelect={(e) => {
                    if (e) field.onChange(format(e, "yyyy-MM-dd"));
                  }}
                  disabled={(date) => date > new Date() || date < new Date("2024-01-01")}
                  initialFocus
                  locale={ptBR}
                  className="p-3"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="entrada_hora"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Entrada <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="00:00"
                    className="pl-10 h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary font-mono"
                    {...field}
                    readOnly={isFixingInconsistency && !!record?.entrada_hora}
                    onChange={(e) => field.onChange(timeMask(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entrada_km"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                KM Entrada {isMotoboyUser && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="0"
                    className="pl-10 h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary font-mono"
                    {...field}
                    readOnly={isFixingInconsistency && record?.entrada_km != null}
                    onChange={(e) => {
                      field.onChange(kmMask(e.target.value));
                      if (form.getValues("saida_km")) {
                        form.trigger("saida_km");
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="saida_hora"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">Saída</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="00:00"
                    className="pl-10 h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary font-mono"
                    {...field}
                    onChange={(e) => {
                      field.onChange(timeMask(e.target.value));
                      if (form.formState.errors.saida_km || form.getValues("saida_km")) {
                        form.trigger("saida_km");
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="saida_km"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-xs font-medium text-muted-foreground">
                KM Saída {isMotoboyUser && form.watch("saida_hora") && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="0"
                    className="pl-10 h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary font-mono"
                    {...field}
                    onChange={(e) => {
                      field.onChange(kmMask(e.target.value));
                      if (form.formState.errors.saida_hora || form.getValues("saida_hora")) {
                        form.trigger("saida_hora");
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="observacao"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-xs font-medium text-muted-foreground">
              Observações / Justificativa
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Observações pertinentes a este registro..."
                className="min-h-[80px] rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Banner
        variant="neutral"
        title="Recálculo Automático"
        description="Os status e o saldo de horas da atividade serão atualizados após a gravação."
      />

      {isManualMode && selectedCollaboratorId && !hasTurnos && (
        <Banner
          variant="destructive"
          title="Bloqueio de Registro"
          description="Este colaborador não possui vínculos ou turnos cadastrados para lançar atividade."
        />
      )}
    </>
  );
}
