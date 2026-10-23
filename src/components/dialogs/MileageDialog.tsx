import { BaseDialog } from "@/components/ui/BaseDialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { kmMask, kmToNumber } from "@/utils/masks";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface MileageDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (km: number) => void;
    title?: string;
    description?: string;
    lastKm?: number;
}

const createSchema = (lastKm: number) => z.object({
    km: z.string()
        .min(1, "Campo obrigatório")
        .transform((val) => kmToNumber(val))
        .refine((val) => val >= lastKm, {
            message: "O KM não pode ser menor que o último registrado",
        }),
});

export function MileageDialog({
    open,
    onClose,
    onConfirm,
    title = "Registrar Quilometragem",
    description = "Informe a quilometragem atual do veículo para prosseguir.",
    lastKm = 0,
}: MileageDialogProps) {
    const schema = createSchema(lastKm);

    const form = useForm<{ km: string }>({
        resolver: zodResolver(schema),
        defaultValues: {
            km: "",
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({ km: "" });
        }
    }, [open, form]);

    const onSubmit = (values: { km: string }) => {
        onConfirm(kmToNumber(values.km));
        safeCloseDialog(onClose);
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={(isOpen) => !isOpen && safeCloseDialog(onClose)}
            maxWidth="sm"
        >
            <BaseDialog.Header
                icon={<Gauge className="h-5 w-5" />}
                title={title}
                subtitle={description}
                onClose={() => safeCloseDialog(onClose)}
            />

            <BaseDialog.Body className="py-5 px-6">
                <Form {...form}>
                    <form id="mileage-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="km"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-semibold text-foreground">
                                        Quilometragem <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                type="text"
                                                {...field}
                                                onChange={(e) => {
                                                    const masked = kmMask(e.target.value);
                                                    field.onChange(masked);
                                                }}
                                                autoFocus
                                                placeholder="0"
                                                className={cn(
                                                    "pl-10 pr-12 h-11 rounded-[18px] bg-background border-border text-sm font-normal focus:bg-white focus:border-primary transition-all",
                                                    form.formState.errors.km && "border-destructive focus-visible:ring-destructive/20"
                                                )}
                                            />
                                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs tracking-wider pointer-events-none">
                                                KM
                                            </span>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs text-destructive ml-1" />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </BaseDialog.Body>

            <BaseDialog.Footer>
                <BaseDialog.Action
                    label="Cancelar"
                    variant="secondary"
                    onClick={() => safeCloseDialog(onClose)}
                />
                <BaseDialog.Action
                    label="Confirmar"
                    variant="primary"
                    type="submit"
                    form="mileage-form"
                />
            </BaseDialog.Footer>
        </BaseDialog>
    );
}
