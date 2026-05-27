import { db } from '@/db';
import { EMPRESA_SINGLETON_ID, empresa } from '@/db/schema';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import { eq } from 'drizzle-orm';

export const auth = betterAuth({
  baseURL: {
    allowedHosts: ['controle.silvadiesel.com', '*.vercel.app', 'localhost:*'],
    protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https'
  },
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    // Sessão "praticamente eterna": dura 1 ano e renova a cada 1 dia de uso.
    // Enquanto o usuário acessar o sistema pelo menos 1x por ano, nunca expira.
    expiresIn: 60 * 60 * 24 * 365,
    updateAge: 60 * 60 * 24
  },
  // Rate limit persistente no Postgres. `memory` NÃO funciona em serverless
  // (Vercel) porque cada invocação pode ser uma instância nova, o que
  // invalidaria a proteção contra brute force do código de 4 dígitos.
  rateLimit: {
    enabled: true,
    storage: 'database',
    customRules: {
      '/sign-up/email': {
        window: 600, // 10 minutos
        max: 5
      }
    }
  },
  hooks: {
    // Valida o `codigo` da empresa ANTES do Better Auth executar o signup.
    // O campo `codigo` não está declarado em additionalFields, mas o endpoint
    // /sign-up/email aceita body tipado como record aberto, então o campo
    // chega intacto no ctx.body.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;

      const body = ctx.body as Record<string, unknown> | undefined;
      const codigo = typeof body?.codigo === 'string' ? body.codigo : undefined;

      if (!codigo) {
        throw new APIError('BAD_REQUEST', {
          message: 'Código de verificação obrigatório'
        });
      }

      const [row] = await db
        .select({ codigo: empresa.codigoVerificacao })
        .from(empresa)
        .where(eq(empresa.id, EMPRESA_SINGLETON_ID));

      if (!row || row.codigo !== codigo) {
        throw new APIError('UNAUTHORIZED', {
          message: 'Código de verificação inválido'
        });
      }
    })
  },
  user: {
    additionalFields: {
      cargo: {
        type: 'string',
        required: false,
        defaultValue: 'atendente',
        input: false // Impede que o usuário defina no signup
      },
      status: {
        type: 'boolean',
        required: false,
        defaultValue: true,
        input: false
      }
    }
  }
});
