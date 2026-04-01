'use client';

import { useCallback, useState } from 'react';

export interface FuncionarioOption {
  id: string;
  name: string;
  email: string;
  cargo: string | null;
  status: boolean | null;
}

function isFuncionarioOption(value: unknown): value is FuncionarioOption {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    (typeof candidate.cargo === 'string' || candidate.cargo === null) &&
    (typeof candidate.status === 'boolean' || candidate.status === null)
  );
}

export function parseFuncionariosResponse(payload: unknown): FuncionarioOption[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.filter(isFuncionarioOption);
}

export function useFuncionariosContext() {
  const [funcionarios, setFuncionarios] = useState<FuncionarioOption[]>([]);

  const fetchFuncionarios = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message =
          data && typeof data === 'object' && 'error' in data
            ? String(data.error)
            : 'Erro ao carregar funcionários';
        throw new Error(message);
      }

      setFuncionarios(parseFuncionariosResponse(data));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setFuncionarios([]);
    }
  }, []);

  return {
    funcionarios,
    setFuncionarios,
    fetchFuncionarios
  };
}
