import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { messages } from "@/constants/messages";
import { STATUS_CADASTRO } from "@/constants/cadastro";

interface StatusFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

const defaultOptions = [
  { value: STATUS_CADASTRO.TODOS, label: messages.labels.todos },
  { value: STATUS_CADASTRO.ATIVO, label: messages.labels.ativo },
  { value: STATUS_CADASTRO.INATIVO, label: messages.labels.inativo },
  { value: STATUS_CADASTRO.PENDENTE, label: messages.labels.pendente },
];

export function StatusFilter({
  value,
  onValueChange,
  id = "status-filter",
  label = messages.labels.status,
  placeholder = messages.labels.todos,
  options = defaultOptions,
  className,
}: StatusFilterProps) {
  return (
    <div className={className}>
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger id={id} className="h-11 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

