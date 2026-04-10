/**
 * Wrapper de `fetch` que detecta respostas 401 (não autenticado)
 * e força navegação para a tela de login, preservando a rota atual
 * como `callbackUrl`.
 *
 * Use este helper em qualquer componente/hook do lado cliente que
 * consuma APIs internas protegidas — assim, quando a sessão expira
 * durante o uso, o usuário é levado para `/login` em vez de ficar
 * preso em uma tela sem dados.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status === 401 && typeof window !== 'undefined') {
    const callbackUrl = encodeURIComponent(
      window.location.pathname + window.location.search
    );
    window.location.href = `/login?callbackUrl=${callbackUrl}`;
    // Lança para interromper o fluxo chamador enquanto o redirect acontece.
    throw new Error('Sessão expirada');
  }

  return response;
}
