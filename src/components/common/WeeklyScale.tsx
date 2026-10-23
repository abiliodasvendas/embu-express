import { ScaleIndicators } from "@/components/common/ScaleIndicators";

interface WeeklyScaleProps {
  escala: number[];
  className?: string;
  variant?: "normal" | "condensed" | "light" | "soft";
  size?: "xs" | "sm" | "md";
}

export function WeeklyScale({
  escala,
  className,
  variant = "light",
  size = "sm",
}: WeeklyScaleProps) {
  return (
    <ScaleIndicators
      activeDays={escala}
      className={className}
      variant={variant}
      size={size}
    />
  );
}
