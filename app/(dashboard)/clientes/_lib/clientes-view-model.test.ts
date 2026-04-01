import assert from 'node:assert/strict';
import test from 'node:test';

import type { Cliente, Veiculo } from '@/db/schema';

import {
  deriveClientesViewModel,
  resolveExpandedClienteIds,
  toggleExpandedCliente
} from './clientes-view-model';

const clientes: Cliente[] = [
  {
    id: 1,
    name_cliente: 'Ana Souza',
    nome_empresa: 'Trans Souza',
    cpf: '123.456.789-00',
    cnpj: '',
    telefone: '(11) 91234-0000',
    status: true,
    id_veiculos: [10]
  },
  {
    id: 2,
    name_cliente: 'Bruno Lima',
    nome_empresa: 'Lima Cargas',
    cpf: '',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 95555-9999',
    status: true,
    id_veiculos: [20, 21]
  }
];

const veiculosByCliente = new Map<number, Veiculo[]>([
  [
    1,
    [
      {
        id: 10,
        cliente_id: 1,
        placa: 'ABC-1234',
        modelo: 'Volvo FH',
        status: true
      }
    ]
  ],
  [
    2,
    [
      {
        id: 20,
        cliente_id: 2,
        placa: 'BRA-2026',
        modelo: 'Scania R450',
        status: true
      },
      {
        id: 21,
        cliente_id: 2,
        placa: 'LIM-9001',
        modelo: 'Mercedes Actros',
        status: true
      }
    ]
  ]
]);

test('filters by vehicle plate and marks matching clients for auto expansion', () => {
  const result = deriveClientesViewModel({
    clientes,
    veiculosByCliente,
    search: 'bra2026'
  });

  assert.equal(result.totalClientes, 2);
  assert.equal(result.totalVeiculos, 3);
  assert.equal(result.results.length, 1);
  assert.equal(result.results[0]?.cliente.id, 2);
  assert.deepEqual(result.results[0]?.matchedVehicleIds, [20]);
  assert.deepEqual(result.autoExpandedClienteIds, [2]);
});

test('does not auto expand any client when search is empty', () => {
  const result = deriveClientesViewModel({
    clientes,
    veiculosByCliente,
    search: ''
  });

  assert.equal(result.results.length, 2);
  assert.deepEqual(result.autoExpandedClienteIds, []);
  assert.deepEqual(result.results[0]?.matchedVehicleIds, []);
  assert.deepEqual(result.results[1]?.matchedVehicleIds, []);
});

test('matches formatted document and phone searches without breaking result count', () => {
  const documentResult = deriveClientesViewModel({
    clientes,
    veiculosByCliente,
    search: '12345678000190'
  });
  const phoneResult = deriveClientesViewModel({
    clientes,
    veiculosByCliente,
    search: '11912340000'
  });

  assert.equal(documentResult.results.length, 1);
  assert.equal(documentResult.results[0]?.cliente.id, 2);
  assert.equal(phoneResult.results.length, 1);
  assert.equal(phoneResult.results[0]?.cliente.id, 1);
});

test('combines manual and auto expansion in desktop mode', () => {
  const expandedIds = resolveExpandedClienteIds({
    manualExpandedClienteIds: new Set([1]),
    autoExpandedClienteIds: [2],
    allowMultiple: true
  });

  assert.deepEqual([...expandedIds], [1, 2]);
});

test('prefers the auto-expanded match when mobile mode allows only one open item', () => {
  const expandedIds = resolveExpandedClienteIds({
    manualExpandedClienteIds: new Set([1, 2]),
    autoExpandedClienteIds: [2],
    allowMultiple: false
  });

  assert.deepEqual([...expandedIds], [2]);
});

test('toggles one item at a time in single-open mode', () => {
  const expandedIds = toggleExpandedCliente({
    currentExpandedClienteIds: new Set([1]),
    clienteId: 2,
    allowMultiple: false
  });

  assert.deepEqual([...expandedIds], [2]);
});

test('keeps multiple items open in multi-open mode', () => {
  const expandedIds = toggleExpandedCliente({
    currentExpandedClienteIds: new Set([1]),
    clienteId: 2,
    allowMultiple: true
  });

  assert.deepEqual([...expandedIds], [1, 2]);
});
