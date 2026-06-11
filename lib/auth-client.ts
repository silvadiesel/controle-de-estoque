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

export const { signIn, signUp, signOut, useSession, changePassword } =
  authClient;

export type SignUpWithCodigoPayload = {
  name: string;
  email: string;
  password: string;
  codigo: string;
};

/**
 * Wrapper tipado do signUp.email() que aceita o campo extra `codigo`.
 *
 * O Better Auth não declara `codigo` em `additionalFields` (o campo não deve
 * ser persistido no `user` — ele só é lido pelo hook `before` do server para
 * validar contra o código da empresa). O cast fica encapsulado aqui para
 * evitar `@ts-expect-error` no caminho feliz do componente de signup.
 */
export function signUpWithCodigo(payload: SignUpWithCodigoPayload) {
  return signUp.email(
    payload as unknown as Parameters<typeof signUp.email>[0]
  );
}
