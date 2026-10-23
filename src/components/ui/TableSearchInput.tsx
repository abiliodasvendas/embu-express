import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/ui/useDebounce";
import { cn } from "@/lib/utils";

interface TableSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function TableSearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className,
  debounceMs = 300,
}: TableSearchInputProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debounced = useDebounce(internalValue, debounceMs);

  useEffect(() => {
    onChange(debounced);
  }, [debounced, onChange]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex-1 min-w-[200px] max-w-sm", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
      <Input
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-8 h-10 rounded-[14px] bg-card border-border shadow-xs text-xs font-medium placeholder:text-muted-foreground/70 focus:bg-background focus:border-primary transition-all"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors"
          title="Limpar busca"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
