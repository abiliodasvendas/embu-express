import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { User, Building2, X, ChevronsUpDown, Check } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ManualTimeRecordFormValues } from "@/schemas/pontoSchema";
import { RegistroPonto, Usuario } from "@/types/database";

interface TimeRecordCollaboratorSectionProps {
  form: UseFormReturn<ManualTimeRecordFormValues>;
  record?: RegistroPonto | null;
  selectedCollaborator?: Usuario | null;
  selectedCollaboratorId?: string;
  collaborators: Usuario[];
  openCombobox: boolean;
  setOpenCombobox: (open: boolean) => void;
  isManualMode: boolean;
  onClear: () => void;
}

export function TimeRecordCollaboratorSection({
  form,
  record,
  selectedCollaborator,
  selectedCollaboratorId,
  collaborators,
  openCombobox,
  setOpenCombobox,
  isManualMode,
  onClear,
}: TimeRecordCollaboratorSectionProps) {
  if (record || selectedCollaboratorId) {
    return (
      <div className="bg-muted/30 p-3.5 rounded-[18px] border border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-muted/70 border border-border flex items-center justify-center text-foreground shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {selectedCollaborator?.nome_completo}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Building2 className="w-3 h-3" />
              <span>
                {record?.colaborador_cliente?.unidade?.nome_unidade ||
                  selectedCollaborator?.links?.[0]?.unidade?.nome_unidade ||
                  "Unidade padrão"}
              </span>
            </div>
          </div>
        </div>

        {isManualMode && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="h-8 w-8 rounded-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name="usuario_id"
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <FormLabel className="text-xs font-medium text-muted-foreground">
            Colaborador <span className="text-destructive">*</span>
          </FormLabel>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between h-11 rounded-[18px] bg-background border-border shadow-xs text-xs sm:text-sm font-normal focus:bg-white focus:border-primary",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <User className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {field.value
                        ? collaborators.find((c) => String(c.id) === field.value)?.nome_completo
                        : "Selecione o colaborador..."}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border border-border shadow-md" align="start">
              <Command className="rounded-[18px]">
                <CommandInput placeholder="Buscar colaborador..." />
                <CommandList>
                  <CommandEmpty>Nenhum colaborador encontrado.</CommandEmpty>
                  <CommandGroup>
                    {collaborators.map((collaborator) => (
                      <CommandItem
                        value={collaborator.nome_completo}
                        key={collaborator.id}
                        onSelect={() => {
                          form.setValue("usuario_id", String(collaborator.id));
                          form.setValue("perfil_nome", collaborator.perfil?.nome || "");
                          setOpenCombobox(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-foreground",
                            String(collaborator.id) === field.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {collaborator.nome_completo}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
