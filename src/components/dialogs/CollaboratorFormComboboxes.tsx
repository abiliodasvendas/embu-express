import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { FormControl } from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Empresa, Client } from "@/types/database";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface EmpresaComboboxProps {
    value?: string | null;
    onChange: (value: string | null) => void;
    empresas: Empresa[];
    hasError?: boolean;
}

export function EmpresaCombobox({ value, onChange, empresas, hasError }: EmpresaComboboxProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <FormControl>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                    "w-full justify-between h-11 rounded-[18px] bg-background border-border shadow-xs px-3 text-left focus-visible:ring-primary/20 font-normal hover:bg-white transition-all",
                    !value && "text-muted-foreground hover:text-muted-foreground",
                    hasError && "border-destructive focus-visible:ring-destructive/20"
                )}
                >
                {value
                    ? empresas?.find((empresa) => empresa.id.toString() === value)?.nome_fantasia
                    : "Selecione a empresa"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border-border bg-card">
            <Command>
                <CommandInput placeholder="Buscar empresa..." />
                <CommandList>
                <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                <CommandGroup>
                    {empresas?.map((empresa) => (
                    <CommandItem
                        value={empresa.nome_fantasia}
                        key={empresa.id}
                        onSelect={() => {
                            onChange(empresa.id.toString());
                            setOpen(false);
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            empresa.id.toString() === value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {empresa.nome_fantasia}
                    </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </Command>
            </PopoverContent>
        </Popover>
    );
}

interface ClienteComboboxProps {
    value?: string | null;
    onChange: (value: string | null) => void;
    clients: Client[];
    hasError?: boolean;
}

export function ClienteCombobox({ value, onChange, clients, hasError }: ClienteComboboxProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
            <FormControl>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                    "w-full justify-between h-11 rounded-[18px] bg-background border-border shadow-xs px-3 text-left focus-visible:ring-primary/20 font-normal hover:bg-white transition-all",
                    !value && "text-muted-foreground hover:text-muted-foreground",
                    hasError && "border-destructive focus-visible:ring-destructive/20"
                )}
                >
                {value
                    ? clients?.find((client) => client.id.toString() === value)?.nome_fantasia
                    : "Selecione o cliente"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border-border bg-card">
            <Command>
                <CommandInput placeholder="Buscar cliente..." />
                <CommandList>
                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                <CommandGroup>
                    {clients?.map((client) => (
                    <CommandItem
                        value={client.nome_fantasia}
                        key={client.id}
                        onSelect={() => {
                            onChange(client.id.toString());
                            setOpen(false);
                        }}
                    >
                        <Check
                        className={cn(
                            "mr-2 h-4 w-4",
                            client.id.toString() === value ? "opacity-100" : "opacity-0"
                        )}
                        />
                        {client.nome_fantasia}
                        {!client.ativo && <span className="ml-2 text-xs text-destructive">(Inativo)</span>}
                    </CommandItem>
                    ))}
                </CommandGroup>
                </CommandList>
            </Command>
            </PopoverContent>
        </Popover>
    );
}
