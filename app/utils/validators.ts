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

export const cpfSchema = z.string().refine(
  (cpf) => {
    const cleanCPF = cpf.replace(/[^\d]/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    return true;
  },
  {
    message: 'CPF deve ter 11 dígitos e não pode ter todos os dígitos iguais'
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

export const clienteSchema = z
  .object({
    nome_empresa: z
      .string()
      .min(1, 'Nome da empresa é obrigatório')
      .refine((name) => name.trim().length > 0, {
        message: 'Nome da empresa não pode ser vazio'
      }),
    cpf: z.string().optional(),
    cnpj: z.string().optional(),
    telefone: z
      .string()
      .optional()
      .refine(
        (phone) => {
          if (!phone || phone.trim() === '') return true;
          const cleanPhone = phone.replace(/[^\d]/g, '');
          return cleanPhone.length === 10 || cleanPhone.length === 11;
        },
        {
          message: 'Telefone deve ter 10 ou 11 dígitos'
        }
      ),
    rua: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z
      .string()
      .optional()
      .refine(
        (uf) => !uf || /^[A-Z]{2}$/.test(uf),
        { message: 'Estado deve ter 2 letras maiúsculas (ex: RS)' }
      ),
    cep: z
      .string()
      .optional()
      .refine(
        (cep) => !cep || cep.replace(/\D/g, '').length === 8,
        { message: 'CEP deve ter 8 dígitos' }
      )
  })
  .superRefine((data, ctx) => {
    const hasCpf = data.cpf && data.cpf.trim() !== '';
    const hasCnpj = data.cnpj && data.cnpj.trim() !== '';

    // At least one is required
    if (!hasCpf && !hasCnpj) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF ou CNPJ é obrigatório',
        path: ['cpf']
      });
      return;
    }

    // Validate CPF if provided
    if (hasCpf) {
      const cleanCPF = data.cpf!.replace(/[^\d]/g, '');
      if (cleanCPF.length !== 11) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CPF deve ter 11 dígitos',
          path: ['cpf']
        });
      } else if (/^(\d)\1+$/.test(cleanCPF)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CPF inválido',
          path: ['cpf']
        });
      }
    }

    // Validate CNPJ if provided
    if (hasCnpj) {
      const cleanCNPJ = data.cnpj!.replace(/[^\d]/g, '');
      if (cleanCNPJ.length !== 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CNPJ deve ter 14 dígitos',
          path: ['cnpj']
        });
      } else if (/^(\d)\1+$/.test(cleanCNPJ)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'CNPJ inválido',
          path: ['cnpj']
        });
      }
    }
  });

export const veiculoSchema = z.object({
  placa: z
    .string()
    .min(1, 'Placa é obrigatória')
    .refine(
      (placa) => {
        const cleanPlaca = placa.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        // Placa antiga: AAA1234 (7 chars) ou Mercosul: AAA1A23 (7 chars)
        return cleanPlaca.length === 7;
      },
      {
        message: 'Placa deve ter 7 caracteres (ex: ABC-1234 ou ABC1D23)'
      }
    ),
  modelo: z
    .string()
    .min(1, 'Modelo é obrigatório')
    .refine((modelo) => modelo.trim().length > 0, {
      message: 'Modelo não pode ser vazio'
    })
});

export const maoObraSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((name) => name.trim().length > 0, {
      message: 'Nome não pode ser vazio'
    }),
  valor: z
    .number({ message: 'Valor é obrigatório' })
    .min(1, 'Valor deve ser maior que zero'),
  descricao: z.string().optional()
});

export type MaoObraFormValues = z.infer<typeof maoObraSchema>;

export const pecaFormSchema = z.object({
  name_peca: z
    .string()
    .min(1, 'Nome é obrigatório')
    .refine((name) => name.trim().length > 0, {
      message: 'Nome não pode ser vazio'
    }),
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .refine((code) => code.trim().length > 0, {
      message: 'Código não pode ser vazio'
    }),
  estante: z.string(),
  prateleira: z.string(),
  categoria_id: z.number().nullable().optional(),
  fornecedor_id: z.number().nullable(),
  quantidade: z
    .number()
    .min(0, 'Quantidade não pode ser negativa')
    .int('Quantidade deve ser um número inteiro'),
  preco: z.number().min(0, 'Preço não pode ser negativo'),
  alerta: z
    .number()
    .min(0, 'Alerta não pode ser negativo')
    .int('Alerta deve ser um número inteiro')
});

export type PecaFormValues = z.infer<typeof pecaFormSchema>;

export const CARGO_VALUES = ['atendente', 'estoquista', 'admin'] as const;

export const updateUserServerSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(120),
  email: emailSchema.max(180),
  cargo: z.enum(CARGO_VALUES),
  status: z.boolean()
});
