import { z } from 'zod';
import objectIdSchema from './ObjectIdSchema.js';

const EstoqueSchema = z.object({
    quantidade: z
        .number()
        .min(0, { message: "Quantidade não pode ser negativa" })
        .or(z.string().transform((val) => {
            const num = Number(val);
            if (isNaN(num)) {
                throw new Error("Quantidade deve ser um número válido");
            }
            return num;
        })),
    componente: objectIdSchema,
    localizacao: objectIdSchema,
});

const EstoqueUpdateSchema = EstoqueSchema.partial();

export { EstoqueSchema, EstoqueUpdateSchema };