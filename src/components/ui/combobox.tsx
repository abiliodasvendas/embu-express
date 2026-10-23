
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onSelect: (value: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  className?: string
  modal?: boolean
  startIcon?: React.ReactNode
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onSelect,
  placeholder = "Selecione...",
  emptyText = "Nenhum resultado encontrado.",
  searchPlaceholder = "Buscar...",
  className,
  modal = false,
  startIcon,
  disabled = false
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between h-11 rounded-[18px] bg-background border-border text-sm font-normal shadow-xs px-3.5 text-left relative hover:bg-background focus:bg-white focus:border-primary transition-all",
            startIcon && "pl-10",
            !value && "text-muted-foreground hover:text-muted-foreground",
            disabled && "opacity-60 bg-muted cursor-not-allowed pointer-events-none",
            className
          )}
        >
          {startIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {startIcon}
            </div>
          )}
          <span className="truncate flex-1">
            {value
              ? options.find((option) => option.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-[18px] border-border bg-popover shadow-md overflow-hidden">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onSelect(option.value === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
