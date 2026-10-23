import { UseFormReturn } from "react-hook-form";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { TurnFormInput } from "@/schemas/turnSchema";
import { ColaboradorCliente } from "@/types/database";
import { timeMask } from "@/utils/masks";
import { Clock, Wand2 } from "lucide-react";

interface TurnEscalaSemanalSectionProps {
  form: UseFormReturn<TurnFormInput>;
  watchedHorarios?: {
    dia_semana?: number;
    hora_inicio?: string;
    hora_fim?: string;
    tolerancia_pausa_min?: unknown;
  }[];
  clientScale: number[];
  selectedUnidadeId?: string;
  turnToEdit?: ColaboradorCliente | null;
  toggleDia: (dia: number, checked: boolean) => void;
  handleRepeatAll: () => void;
  getHorarioError: (idx: number) =>
    | {
        hora_inicio?: { message?: string };
        hora_fim?: { message?: string };
        tolerancia_pausa_min?: { message?: string };
      }
    | undefined;
}

const DIAS_SEMANA = [
  { id: 0, label: "Domingo" },
  { id: 1, label: "Segunda-feira" },
  { id: 2, label: "Terça-feira" },
  { id: 3, label: "Quarta-feira" },
  { id: 4, label: "Quinta-feira" },
  { id: 5, label: "Sexta-feira" },
  { id: 6, label: "Sábado" },
];

export function TurnEscalaSemanalSection({
  form,
  watchedHorarios,
  clientScale,
  selectedUnidadeId,
  turnToEdit,
  toggleDia,
  handleRepeatAll,
  getHorarioError,
}: TurnEscalaSemanalSectionProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-foreground" /> Escala Semanal{" "}
          <span className="text-destructive">*</span>
        </h3>
        {!selectedUnidadeId && (
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-0.5 rounded-[8px] border border-border">
            Selecione uma unidade primeiro
          </span>
        )}
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-2.5 transition-all duration-300",
          !selectedUnidadeId &&
            !turnToEdit &&
            "opacity-40 grayscale pointer-events-none select-none"
        )}
      >
        {DIAS_SEMANA.map((dia) => {
          const isClosed = !clientScale.includes(dia.id);
          const config = (watchedHorarios || []).find((h) => h.dia_semana === dia.id);
          const index = (watchedHorarios || []).findIndex((h) => h.dia_semana === dia.id);
          const isWorking = Boolean(config);
          const error = getHorarioError(index);

          return (
            <div
              key={dia.id}
              className={cn(
                "flex flex-col gap-3 p-3.5 border rounded-[18px] transition-all duration-200 relative overflow-hidden",
                isClosed ? "opacity-50" : "cursor-pointer",
                isWorking
                  ? "bg-background border-primary/40 shadow-xs"
                  : "bg-muted/30 border-border hover:bg-muted/50",
                isWorking &&
                  form.formState.errors.horarios?.[index] &&
                  "border-destructive bg-destructive/5"
              )}
              onClick={() => !isClosed && toggleDia(dia.id, !isWorking)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div
                    className="relative flex items-center h-5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      id={`dia-${dia.id}`}
                      checked={isWorking}
                      onCheckedChange={(val) => !isClosed && toggleDia(dia.id, Boolean(val))}
                      disabled={isClosed}
                      className={cn(
                        "h-4 w-4 rounded-[6px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all",
                        isWorking && error && "border-destructive"
                      )}
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label
                      htmlFor={`dia-${dia.id}`}
                      className={cn(
                        "text-sm transition-colors cursor-pointer",
                        isWorking
                          ? "text-foreground font-bold"
                          : "text-muted-foreground font-medium",
                        isClosed && "line-through opacity-70"
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!isClosed) toggleDia(dia.id, !isWorking);
                      }}
                    >
                      {dia.label}
                    </Label>
                    {isWorking && error ? (
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-wider mt-0.5">
                        Preencha os horários
                      </span>
                    ) : null}
                  </div>
                </div>

                {isWorking && (
                  <div
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs border transition-all",
                      error
                        ? "bg-destructive text-destructive-foreground border-destructive"
                        : "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    {error ? "Incompleto" : "Trabalha"}
                  </div>
                )}
                {isClosed && (selectedUnidadeId || turnToEdit) && (
                  <div className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-border">
                    Fechada
                  </div>
                )}
              </div>

              {isWorking && config && index !== -1 && (
                <div
                  className="grid grid-cols-3 gap-2.5 pt-2.5 border-t border-border mt-0.5 w-full"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="space-y-1 flex flex-col">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider pl-1",
                        error?.hora_inicio ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      Início <span className="text-destructive">*</span>
                    </span>
                    <Input
                      placeholder="00:00"
                      className={cn(
                        "h-10 text-sm font-mono text-center rounded-[14px] bg-background border-border focus:bg-white focus:border-primary transition-all shadow-xs",
                        error?.hora_inicio && "border-destructive bg-destructive/10"
                      )}
                      value={config.hora_inicio || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const current = form.getValues("horarios") || [];
                        const newHorarios = [...current];
                        if (newHorarios[index]) {
                          newHorarios[index].hora_inicio = timeMask(e.target.value);
                          form.setValue("horarios", newHorarios, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1 flex flex-col">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider pl-1",
                        error?.hora_fim ? "text-destructive" : "text-muted-foreground"
                      )}
                    >
                      Fim <span className="text-destructive">*</span>
                    </span>
                    <Input
                      placeholder="00:00"
                      className={cn(
                        "h-10 text-sm font-mono text-center rounded-[14px] bg-background border-border focus:bg-white focus:border-primary transition-all shadow-xs",
                        error?.hora_fim && "border-destructive bg-destructive/10"
                      )}
                      value={config.hora_fim || ""}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const current = form.getValues("horarios") || [];
                        const newHorarios = [...current];
                        if (newHorarios[index]) {
                          newHorarios[index].hora_fim = timeMask(e.target.value);
                          form.setValue("horarios", newHorarios, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-1 flex flex-col relative">
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider pl-1",
                        error?.tolerancia_pausa_min
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      Pausa <span className="text-destructive">*</span>
                    </span>
                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Input
                        placeholder="60"
                        className={cn(
                          "h-10 text-sm font-mono text-center pl-2 pr-8 rounded-[14px] bg-background border-border focus:bg-white focus:border-primary transition-all shadow-xs",
                          error?.tolerancia_pausa_min &&
                            "border-destructive bg-destructive/10"
                        )}
                        value={String(config.tolerancia_pausa_min ?? "")}
                        onChange={(e) => {
                          const current = form.getValues("horarios") || [];
                          const newHorarios = [...current];
                          if (newHorarios[index]) {
                            newHorarios[index].tolerancia_pausa_min = e.target.value;
                            form.setValue("horarios", newHorarios, {
                              shouldValidate: true,
                              shouldDirty: true,
                            });
                          }
                        }}
                      />
                      <span className="absolute right-2.5 top-[11px] text-[9px] text-muted-foreground font-bold pointer-events-none tracking-wider">
                        MIN
                      </span>
                    </div>
                  </div>

                  {index === 0 && watchedHorarios.length > 1 && (
                    <div className="col-span-3 pt-1 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRepeatAll();
                        }}
                        className="h-8 text-[11px] font-semibold gap-1.5 rounded-[12px] border-border text-muted-foreground hover:text-foreground cursor-pointer"
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
        <div className="mt-3">
          <Banner
            variant="destructive"
            title="Atenção à escala"
            description={form.formState.errors.horarios.message}
          />
        </div>
      )}
    </section>
  );
}
