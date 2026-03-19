import { Users, Clock, PlayCircle, LogOut, AlertTriangle } from "lucide-react";
import { ManagementStatus } from "@/types/enums";
import { LucideIcon } from "lucide-react";

export interface PontoStatusConfig {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
  border: string;
  borderSide: string;
}

export const PONTO_STATUS_UI_CONFIG: Record<ManagementStatus, PontoStatusConfig> = {
  [ManagementStatus.ALL]: { label: "Todos", color: "text-primary", bg: "bg-primary/5", border: "border-primary", borderSide: "bg-primary", icon: Users },
  [ManagementStatus.LATE]: { label: "Atrasados", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500", borderSide: "bg-amber-500", icon: Clock },
  [ManagementStatus.WORKING]: { label: "Trabalhando", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500", borderSide: "bg-blue-500", icon: PlayCircle },
  [ManagementStatus.DONE]: { label: "Finalizado", color: "text-gray-400", bg: "bg-gray-100", border: "border-gray-500", borderSide: "bg-gray-400", icon: LogOut },
  [ManagementStatus.WAITING]: { label: "Aguar. Início", color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-300", borderSide: "bg-sky-400", icon: Clock },
  [ManagementStatus.ABSENT]: { label: "Falta", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-500", borderSide: "bg-rose-500", icon: AlertTriangle },
};
