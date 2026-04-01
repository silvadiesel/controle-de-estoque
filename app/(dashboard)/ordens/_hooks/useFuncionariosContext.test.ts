import assert from 'node:assert/strict';
import test from 'node:test';

import { parseFuncionariosResponse } from './useFuncionariosContext';

test('parseFuncionariosResponse returns an empty list for non-array payloads', () => {
  assert.deepEqual(
    parseFuncionariosResponse({ error: 'Sem permissão para executar esta ação' }),
    []
  );
});

test('parseFuncionariosResponse keeps only valid funcionario objects', () => {
  assert.deepEqual(
    parseFuncionariosResponse([
      {
        id: '1',
        name: 'Ana',
        email: 'ana@example.com',
        cargo: 'atendente',
        status: true
      },
      {
        id: 2,
        name: 'Inválido',
        email: 'bad@example.com',
        cargo: 'admin',
        status: true
      }
    ]),
    [
      {
        id: '1',
        name: 'Ana',
        email: 'ana@example.com',
        cargo: 'atendente',
        status: true
      }
    ]
  );
});
