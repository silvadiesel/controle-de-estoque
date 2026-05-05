'use client';

import { useState } from 'react';

import type { PecaFormValues } from '@/app/utils/validators';
import type { Peca } from '@/db/schema';

export interface ModalPecaInitialState {
  defaultValues: PecaFormValues;
  image: string | null;
  precoDisplay: string;
}

export function getPecaFormDefaultValues(
  initialData?: Partial<Peca>
): PecaFormValues {
  return {
    name_peca: initialData?.name_peca ?? '',
    codigo: initialData?.codigo ?? '',
    estante: Array.isArray(initialData?.localizacao)
      ? String(initialData?.localizacao[0] || '')
      : '',
    prateleira: Array.isArray(initialData?.localizacao)
      ? String(initialData?.localizacao[1] || '')
      : '',
    categoria_id: initialData?.categoria_id ?? null,
    fornecedor_id: initialData?.fornecedor_id ?? null,
    quantidade: initialData?.quantidade ?? 0,
    preco: initialData?.preco ?? 0,
    alerta: initialData?.alerta ?? 1
  };
}

export function formatPrecoDisplay(preco?: number | null) {
  if (!preco) return '';
  return (preco / 100).toString().replace('.', ',');
}

export function buildModalPecaInitialState(
  initialData?: Partial<Peca>
): ModalPecaInitialState {
  return {
    defaultValues: getPecaFormDefaultValues(initialData),
    image: initialData?.imagem ?? null,
    precoDisplay: formatPrecoDisplay(initialData?.preco)
  };
}

export function useModalPecaState(initialData?: Partial<Peca>) {
  const initialState = buildModalPecaInitialState(initialData);
  const [image, setImage] = useState<string | null>(initialState.image);
  const [precoDisplay, setPrecoDisplay] = useState(initialState.precoDisplay);

  return {
    initialState,
    image,
    setImage,
    precoDisplay,
    setPrecoDisplay
  };
}
