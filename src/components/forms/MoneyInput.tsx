import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

interface MoneyInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function MoneyInput<T extends FieldValues>({
  field,
  label = "Valor",
  required = false,
  placeholder = "R$ 0,00",
  className,
  inputClassName,
  labelClassName,
  disabled = false,
}: MoneyInputProps<T>) {
  const { error } = useFormField();

  return (
    <FormItem className={className}>
      <FormLabel className={labelClassName}>
        {label} {required && <span className="text-red-600">*</span>}
      </FormLabel>
      <FormControl>
        <div className="relative group">
          <Input
            {...field}
            placeholder={placeholder}
            type="text"
            className={cn(inputClassName, "pl-11")}
            disabled={disabled}
            onChange={(e) => {
              field.onChange(moneyMask(e.target.value));
            }}
            aria-invalid={!!error}
          />
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600/50 group-focus-within:text-emerald-600 transition-colors pointer-events-none z-10" />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

