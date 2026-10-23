import { FormControl, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { moneyMask } from "@/utils/masks";
import { cn } from "@/lib/utils";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

interface MoneyInputProps<T extends FieldValues> {
  field: ControllerRenderProps<T, FieldPath<T>>;
  label?: string;
  required?: boolean;
  optional?: boolean;
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
  optional,
  placeholder = "R$ 0,00",
  className,
  inputClassName,
  labelClassName,
  disabled = false,
}: MoneyInputProps<T>) {
  const { error } = useFormField();
  const isOptional = Boolean(optional);

  return (
    <FormItem className={className}>
      {label && (
        <FormLabel className={labelClassName}>
          {label}
          {required ? (
            <span className="text-destructive ml-1">*</span>
          ) : isOptional ? (
            <span className="text-muted-foreground font-normal text-[11px] ml-1">(opcional)</span>
          ) : null}
        </FormLabel>
      )}
      <FormControl>
        <Input
          {...field}
          placeholder={placeholder}
          type="text"
          className={cn(
            "h-11 rounded-[18px] bg-background border-border px-4 text-sm font-normal focus:bg-white focus:border-primary transition-all",
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
