import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
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
        <Input
          {...field}
          placeholder={placeholder}
          type="text"
          className={cn(
            "h-11 rounded-2xl bg-gray-50 border-gray-200 px-4 focus:bg-white transition-all",
            inputClassName
          )}
          disabled={disabled}
          onChange={(e) => {
            field.onChange(moneyMask(e.target.value));
          }}
          aria-invalid={!!error}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

