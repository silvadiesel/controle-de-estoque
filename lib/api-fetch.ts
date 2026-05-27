export class ApiError extends Error {
  status: number;
  backendMessage?: string;

  constructor(status: number, message: string, backendMessage?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.backendMessage = backendMessage;
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, init);

  if (res.ok) return res;

  let backendMessage: string | undefined;
  try {
    const body = await res.clone().json();
    if (body && typeof body.error === 'string') {
      backendMessage = body.error;
    } else if (body && typeof body.message === 'string') {
      backendMessage = body.message;
    }
  } catch {
    // resposta não-JSON (HTML do login, vazio, etc) — segue sem mensagem do backend
  }

  throw new ApiError(res.status, formatApiError(res.status, backendMessage), backendMessage);
}

export function formatApiError(status: number, backendMessage?: string): string {
  switch (status) {
    case 401:
      return 'Sua sessão expirou. Faça logout e entre novamente.';
    case 403:
      return 'Você não tem permissão para executar esta ação.';
    case 409:
      return backendMessage ?? 'Conflito: registro já existe ou está em uso.';
    case 413:
      return 'Arquivo muito grande. Reduza o tamanho da imagem e tente novamente.';
    case 429:
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Erro no servidor. Tente novamente em instantes.';
    default:
      return backendMessage ?? `Erro inesperado (HTTP ${status}).`;
  }
}
