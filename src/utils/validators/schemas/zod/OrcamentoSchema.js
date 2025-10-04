import { z } from 'zod';
import mongoose from 'mongoose';

const ComponenteOrcamentoSchema = z.object({
    componente: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "ID do componente deve ser um ObjectId válido",
        }),
    fornecedor: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "ID do fornecedor deve ser um ObjectId válido",
        }),
    quantidade: z
        .number()
        .int()
        .min(1, { message: "Quantidade deve ser um número inteiro maior que zero" })
        .or(z.string().transform((val) => parseInt(val)).refine((val) => !isNaN(val) && val > 0, {
            message: "Quantidade deve ser um número inteiro maior que zero",
        })),
    valor_unitario: z
        .number()
        .min(0, { message: "Valor unitário deve ser maior ou igual a zero" })
        .or(z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, {
            message: "Valor unitário deve ser um número válido maior ou igual a zero",
        })),
});

const OrcamentoSchema = z.object({
    nome: z
        .string()
        .min(1, { message: "Nome é obrigatório" })
        .refine((val) => val.trim().length > 0, {
            message: "Nome não pode ser vazio",
        })
        .transform((val) => val.trim()),
    descricao: z
        .string()
        .optional(),
    componentes: z
        .array(ComponenteOrcamentoSchema)
        .min(1, { message: "Deve haver pelo menos um componente no orçamento." }),
});

const OrcamentoUpdateSchema = OrcamentoSchema.omit({ componentes: true }).partial();
const ComponenteOrcamentoUpdateSchema = ComponenteOrcamentoSchema.partial();

export { OrcamentoSchema, OrcamentoUpdateSchema, ComponenteOrcamentoSchema, ComponenteOrcamentoUpdateSchema };