import { db } from '@/db';

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      'controle.silvadiesel.com',
      '*.vercel.app'
    ],
    protocol: process.env.NODE_ENV === 'development' ? 'http' : 'https'
  },
  database: drizzleAdapter(db, {
    provider: 'pg'
  }),
  emailAndPassword: {
    enabled: true
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
