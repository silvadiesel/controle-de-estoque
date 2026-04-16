import assert from 'node:assert/strict';
import test from 'node:test';

import { buildModalPecaInitialState } from './useModalPecaState';

test('buildModalPecaInitialState returns empty state for create mode', () => {
  const state = buildModalPecaInitialState();

  assert.deepEqual(state.defaultValues, {
    name_peca: '',
    codigo: '',
    estante: '',
    prateleira: '',
    categoria_id: 0,
    fornecedor_id: null,
    quantidade: 0,
    preco: 0,
    alerta: 1
  });
  assert.equal(state.image, null);
  assert.equal(state.precoDisplay, '');
});

test('buildModalPecaInitialState maps existing product data to form snapshot', () => {
  const state = buildModalPecaInitialState({
    id: 12,
    name_peca: 'Filtro de Ar',
    codigo: 'FA-01',
    localizacao: ['A2', '4'],
    categoria_id: 7,
    fornecedor_id: 9,
    quantidade: 12,
    preco: 4590,
    alerta: 3,
    imagem: 'data:image/png;base64,abc'
  });

  assert.deepEqual(state.defaultValues, {
    name_peca: 'Filtro de Ar',
    codigo: 'FA-01',
    estante: 'A2',
    prateleira: '4',
    categoria_id: 7,
    fornecedor_id: 9,
    quantidade: 12,
    preco: 4590,
    alerta: 3
  });
  assert.equal(state.image, 'data:image/png;base64,abc');
  assert.equal(state.precoDisplay, '45,9');
});
