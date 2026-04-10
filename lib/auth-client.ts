import type { auth } from '@/lib/auth';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

// baseURL é omitido de propósito. Como o servidor do Better Auth roda no mesmo
// domínio da aplicação (via `/api/auth/[...all]`), o cliente usa automaticamente
// o origin atual — funcionando em dev em qualquer porta, previews Vercel e produção
// sem depender de env vars específicas. Ver:
// https://www.better-auth.com/docs/concepts/client#create-client-instance
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()]
});

export const { signIn, signUp, signOut, useSession } = authClient;
