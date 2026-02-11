import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelfRegistrationFormData } from "@/schemas/selfRegistrationSchema";
import { aplicarMascaraPlaca, cpfCnpjMask, dateMask, phoneMask } from "@/utils/masks";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface SelfRegistrationFormProps {
    form: UseFormReturn<SelfRegistrationFormData>;
    onSubmit: (values: SelfRegistrationFormData) => Promise<void>;
}

export function SelfRegistrationForm({ form, onSubmit }: SelfRegistrationFormProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Dados Pessoais</h3>
            </div>
            <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>E-mail *</FormLabel>
                        <FormControl>
                            <Input placeholder="seu@email.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="cpfcnpj"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>CPF / CNPJ *</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="000.000.000-00" 
                                    {...field} 
                                    onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                                    maxLength={18}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>RG *</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="00.000.000-0" 
                                    {...field} 
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="data_nascimento"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Data de Nascimento *</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="DD/MM/AAAA" 
                                    maxLength={10}
                                    {...field} 
                                    onChange={(e) => {
                                        const val = dateMask(e.target.value);
                                        field.onChange(val);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="nome_mae"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome da Mãe *</FormLabel>
                        <FormControl>
                            <Input placeholder="Nome completo da mãe" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="endereco_completo"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Endereço com CEP *</FormLabel>
                        <FormControl>
                            <Input placeholder="Rua, Número, Bairro, Cidade - CEP" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone / WhatsApp *</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="(11) 99999-9999" 
                                    {...field} 
                                    onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                    maxLength={15}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="telefone_recado"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone Recado</FormLabel>
                            <FormControl>
                                <Input 
                                    placeholder="(11) 99999-9999" 
                                    {...field} 
                                    onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                    maxLength={15}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

             <div className="grid grid-cols-1 gap-4">
                 <FormField
                    control={form.control}
                    name="chave_pix"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Chave Pix *</FormLabel>
                            <FormControl>
                                <Input placeholder="CPF, Email, ou Aleatória" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha *</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                        placeholder="******" 
                                        type={showPassword ? "text" : "password"} 
                                        className="pr-10"
                                        {...field} 
                                        aria-invalid={!!form.formState.errors.senha}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="pt-4 border-t">
                <h3 className="font-semibold text-gray-800 mb-3">Dados da CNH</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="cnh_registro"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Registro CNH *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nº Registro" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cnh_vencimento"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vencimento *</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="DD/MM/AAAA" 
                                        maxLength={10}
                                        {...field} 
                                        onChange={(e) => field.onChange(dateMask(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="cnh_categoria"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Categoria *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: A, AB" className="uppercase" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <h3 className="font-semibold text-gray-800 mb-3">Dados da Moto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <FormField
                        control={form.control}
                        name="moto_modelo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Modelo *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: CG 160" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="moto_placa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Placa *</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="ABC-1234" 
                                        className="uppercase" 
                                        {...field} 
                                        maxLength={8}
                                        onChange={(e) => {
                                            field.onChange(aplicarMascaraPlaca(e.target.value));
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="moto_cor"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cor *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Preta" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="moto_ano"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ano *</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="Ex: 2024" 
                                        {...field} 
                                        maxLength={4}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg font-bold mt-6">
                Solicitar Cadastro
            </Button>
        </form>
    );
}
