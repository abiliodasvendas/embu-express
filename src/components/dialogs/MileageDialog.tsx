import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gauge, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { kmMask, kmToNumber } from "@/utils/masks";

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
            message: `O KM não pode ser menor que o último registrado (${lastKm})`,
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

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            km: "" as any,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({ km: "" as any });
        }
    }, [open, form]);

    const onSubmit = (values: z.infer<typeof schema>) => {
        onConfirm(values.km);
    };

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <AlertDialogContent className="max-w-md p-0 overflow-hidden border-0 rounded-[2rem] shadow-2xl bg-white">
                {/* Header Azul Premium */}
                <div className="bg-blue-600 p-6 text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                        <span className="sr-only">Fechar</span>
                    </button>

                    <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner">
                        <Gauge className="w-6 h-6 text-white" />
                    </div>

                    <AlertDialogTitle className="text-xl font-bold text-white mb-1">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-blue-100 text-sm leading-relaxed px-4">
                        {description}
                    </AlertDialogDescription>
                </div>

                <div className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="km"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-gray-700 font-bold ml-1 text-sm uppercase tracking-wider opacity-70">
                                            Quilometragem <span className="text-red-600">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <div className="relative group">
                                                <Gauge className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                                <Input
                                                    type="text"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const masked = kmMask(e.target.value);
                                                        field.onChange(masked);
                                                    }}
                                                    autoFocus
                                                    className={cn(
                                                        "pl-12 pr-14 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500/10 transition-all font-mono text-xl font-bold text-slate-700",
                                                        form.formState.errors.km && "border-red-500 bg-red-50/30"
                                                    )}
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs tracking-widest pointer-events-none group-focus-within:text-blue-500">
                                                    KM
                                                </span>
                                            </div>
                                        </FormControl>
                                        <FormMessage className="ml-1 font-semibold" />
                                    </FormItem>
                                )}
                            />

                            <AlertDialogFooter className="flex flex-row justify-end gap-3 mt-8">
                                <AlertDialogCancel
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 sm:flex-none h-14 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all m-0"
                                >
                                    CANCELAR
                                </AlertDialogCancel>
                                <Button
                                    type="submit"
                                    className="flex-1 sm:flex-none h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                                >
                                    CONFIRMAR
                                </Button>
                            </AlertDialogFooter>
                        </form>
                    </Form>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
