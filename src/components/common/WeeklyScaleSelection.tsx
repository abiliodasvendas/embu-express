import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";

interface WeeklyScaleSelectionProps {
  value: number[];
  onChange: (value: number[]) => void;
}

const DAYS = [
    { id: 1, label: "Segunda" },
    { id: 2, label: "Terça" },
    { id: 3, label: "Quarta" },
    { id: 4, label: "Quinta" },
    { id: 5, label: "Sexta" },
    { id: 6, label: "Sábado" },
    { id: 0, label: "Domingo" },
];

export function WeeklyScaleSelection({ value = [], onChange }: WeeklyScaleSelectionProps) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-3 ml-1">
      {DAYS.map((day) => (
        <FormItem
          key={day.id}
          className="flex flex-row items-center space-x-2 space-y-0"
        >
          <FormControl>
            <Checkbox
              checked={value.includes(day.id)}
              onCheckedChange={(checked) => {
                return checked
                  ? onChange([...value, day.id])
                  : onChange(value.filter((val) => val !== day.id));
              }}
            />
          </FormControl>
          <FormLabel className="text-sm font-medium leading-none cursor-pointer">
            {day.label}
          </FormLabel>
        </FormItem>
      ))}
    </div>
  );
}
