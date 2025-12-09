import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .refine((email) => email.includes('@'), {
    message: 'Email deve conter @'
  })
  .refine((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), {
    message: 'Email inválido'
  });

export const cnpjSchema = z
  .string()
  .min(1, 'CNPJ é obrigatório')
  .refine(
    (cnpj) => {
      // Remove caracteres não numéricos
      const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

      // Verifica se tem 14 dígitos
      if (cleanCNPJ.length !== 14) return false;

      // Verifica se todos os dígitos são iguais
      if (/^(\d)\1+$/.test(cleanCNPJ)) return false;

      return true;
    },
    {
      message: 'CNPJ deve ter 14 dígitos e não pode ter todos os dígitos iguais'
    }
  );

export const phoneSchema = z.string().refine(
  (phone) => {
    const cleanPhone = phone.replace(/[^\d]/g, '');

    return cleanPhone.length === 11;
  },
  {
    message: 'Telefone incorreto'
  }
);

export const fornecedorSchema = z.object({
  name_empresa: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((name) => name.trim().length > 0, {
      message: 'Nome não pode ser vazio'
    }),
  cnpj: cnpjSchema,
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(
      (phone) => {
        const cleanPhone = phone.replace(/[^\d]/g, '');
        return cleanPhone.length === 10 || cleanPhone.length === 11;
      },
      {
        message: 'Telefone deve ter 10 ou 11 dígitos'
      }
    ),
  email: z
    .string()
    .optional()
    .refine(
      (email) => {
        if (!email || email.trim() === '') return true;
        return email.includes('@');
      },
      {
        message: 'Email incorreto'
      }
    )
    .refine(
      (email) => {
        if (!email || email.trim() === '') return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      {
        message: 'Email inválido'
      }
    )
});
