import { z } from 'zod';

const senhaRegex = /^(?=.*[?@!#$%^&*()/\\])(?=.*[0-9])(?=.*[a-zA-Z])[?@!#$%^&*()/\\a-zA-Z0-9]+$/
const nomeRegex = /^([A-ZÀ-Ö][a-zà-öø-ÿ]{1,})( ((de|da|do|das|dos)|[A-ZÀ-Ö][a-zà-öø-ÿ]{1,}))*$/

const UsuarioSchema = z.object({
  nome: z
    .string()
    .min(1, 'Campo nome é obrigatório.')
    .refine((nome)=>{
      return nomeRegex.test(nome)
    },{
      message:
        `O nome não pode ter caracteres especiais, nem numeros e somente ter letras maiúsculas no começo de cada nome/sobrenome, possuindo ao menos 2 letras.`
    }
  ),
  email: z
    .string()
    .email('Formato de email inválido.')
    .min(1, 'Campo email é obrigatório.'),
  senha: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .refine(
      (senha) => {
        return senhaRegex.test(senha);
      },
      {
        message:
          'A senha deve conter pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.',
      }
    ),
  ativo: z
    .boolean()
    .default(true),
});

const UsuarioUpdateSchema = UsuarioSchema
  .omit({ email: true })
  .partial();

export { UsuarioSchema, UsuarioUpdateSchema };