'use client';

import { useCallback, useState } from 'react';

import type { Empresa } from '@/db/schema';

import { toast } from 'sonner';

export type EmpresaFormData = {
  nomeFantasia: string;
  cnpj: string;
  cidade: string;
  estado: string;
  codigoVerificacao: string;
};

export interface UseEmpresaReturn {
  empresa: Empresa | null;
  isLoading: boolean;
  isSaving: boolean;
  isRegenerating: boolean;
  formData: EmpresaFormData;
  setFormData: (data: EmpresaFormData) => void;
  updateField: <K extends keyof EmpresaFormData>(
    field: K,
    value: EmpresaFormData[K]
  ) => void;
  fetchEmpresa: () => Promise<void>;
  handleUpdateEmpresa: () => Promise<void>;
  handleRegenerateCodigo: () => Promise<void>;
}

const emptyForm: EmpresaFormData = {
  nomeFantasia: '',
  cnpj: '',
  cidade: '',
  estado: '',
  codigoVerificacao: ''
};

function toFormData(e: Empresa): EmpresaFormData {
  return {
    nomeFantasia: e.nomeFantasia,
    cnpj: e.cnpj,
    cidade: e.cidade,
    estado: e.estado,
    codigoVerificacao: e.codigoVerificacao
  };
}

export function useEmpresa(): UseEmpresaReturn {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [formData, setFormData] = useState<EmpresaFormData>(emptyForm);

  const fetchEmpresa = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/empresa');

      if (!response.ok) {
        throw new Error('Falha ao carregar dados da empresa');
      }

      const data = (await response.json()) as Empresa;
      setEmpresa(data);
      setFormData(toFormData(data));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao carregar empresa'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateField = useCallback(
    <K extends keyof EmpresaFormData>(field: K, value: EmpresaFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleUpdateEmpresa = useCallback(async () => {
    if (
      !formData.nomeFantasia.trim() ||
      !formData.cnpj.trim() ||
      !formData.cidade.trim() ||
      !formData.estado.trim() ||
      !formData.codigoVerificacao.trim()
    ) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    if (formData.estado.trim().length !== 2) {
      toast.error('Estado deve ter 2 caracteres (UF)');
      return;
    }

    if (!/^\d{4}$/.test(formData.codigoVerificacao.trim())) {
      toast.error('Código de verificação deve ter 4 dígitos numéricos');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch('/api/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeFantasia: formData.nomeFantasia.trim(),
          cnpj: formData.cnpj.trim(),
          cidade: formData.cidade.trim(),
          estado: formData.estado.trim().toUpperCase(),
          codigoVerificacao: formData.codigoVerificacao.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar empresa');
      }

      const updated = (await response.json()) as Empresa;
      setEmpresa(updated);
      setFormData(toFormData(updated));
      toast.success('Dados da empresa atualizados com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao atualizar empresa'
      );
    } finally {
      setIsSaving(false);
    }
  }, [formData]);

  const handleRegenerateCodigo = useCallback(async () => {
    try {
      setIsRegenerating(true);

      const response = await fetch('/api/empresa/regenerate-codigo', {
        method: 'POST'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao regenerar código');
      }

      const updated = (await response.json()) as Empresa;
      setEmpresa(updated);
      setFormData(toFormData(updated));
      toast.success('Código de verificação regenerado com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao regenerar código'
      );
    } finally {
      setIsRegenerating(false);
    }
  }, []);

  return {
    empresa,
    isLoading,
    isSaving,
    isRegenerating,
    formData,
    setFormData,
    updateField,
    fetchEmpresa,
    handleUpdateEmpresa,
    handleRegenerateCodigo
  };
}
