import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

interface MoneyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onChange?: (value: number) => void;
}

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ className, value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");

    // Format number to currency string (R$ 0,00)
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(val);
    };

    useEffect(() => {
        // Update display value when external value changes
        // Only if not currently focused or if drastically different (to avoid cursor jumping)
        // For simplicity, we always format on external change for now
        setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, ""); // Keep only numbers
        const numericValue = Number(rawValue) / 100; // Divide by 100 to get decimals

        setDisplayValue(formatCurrency(numericValue));
        
        if (onChange) {
            onChange(numericValue);
        }
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        className={cn("font-mono text-right", className)}
        {...props}
      />
    );
  }
);

MoneyInput.displayName = "MoneyInput";
