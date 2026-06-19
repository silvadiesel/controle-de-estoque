import type { Cliente, Veiculo } from '@/db/schema';
import type { FuzzySearchConfig } from '@/lib/fuzzy-search';
import { fuzzyFilter } from '@/lib/fuzzy-search';

const CLIENTE_SEARCH: FuzzySearchConfig = {
  fuzzyKeys: ['nome_empresa'],
  exactKeys: ['cpf', 'cnpj', 'telefone']
};

export interface ClienteViewResult {
  cliente: Cliente;
  veiculos: Veiculo[];
  vehicleCount: number;
  matchedVehicleIds: number[];
}

interface DeriveClientesViewModelParams {
  clientes: Cliente[];
  veiculosByCliente: Map<number, Veiculo[]>;
  search: string;
}

interface ResolveExpandedClienteIdsParams {
  manualExpandedClienteIds: Set<number>;
  autoExpandedClienteIds: number[];
  allowMultiple: boolean;
}

interface ToggleExpandedClienteParams {
  currentExpandedClienteIds: Set<number>;
  clienteId: number;
  allowMultiple: boolean;
}

export interface ClientesViewModel {
  results: ClienteViewResult[];
  autoExpandedClienteIds: number[];
  totalClientes: number;
  totalVeiculos: number;
}

function normalizeValue(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function compactValue(value: string | null | undefined) {
  return normalizeValue(value).replace(/[^a-z0-9]/g, '');
}

function matchesQuery(value: string | null | undefined, search: string) {
  const normalizedSearch = normalizeValue(search);

  if (!normalizedSearch) {
    return true;
  }

  const compactSearch = compactValue(search);
  const normalizedValue = normalizeValue(value);

  return (
    normalizedValue.includes(normalizedSearch) ||
    compactValue(value).includes(compactSearch)
  );
}

function countVeiculos(veiculosByCliente: Map<number, Veiculo[]>) {
  let total = 0;

  veiculosByCliente.forEach((veiculos) => {
    total += veiculos.length;
  });

  return total;
}

export function deriveClientesViewModel({
  clientes,
  veiculosByCliente,
  search
}: DeriveClientesViewModelParams): ClientesViewModel {
  const normalizedSearch = normalizeValue(search);
  const hasActiveSearch = normalizedSearch.length > 0;

  // Match do cliente via fuzzy (nome) + exato (documentos). O match do veículo
  // por placa segue exato/compacto (placa é código).
  const clienteMatchIds = hasActiveSearch
    ? new Set(fuzzyFilter(clientes, search, CLIENTE_SEARCH).map((c) => c.id))
    : new Set<number>();

  const results = clientes.reduce<ClienteViewResult[]>((acc, cliente) => {
    const veiculos = veiculosByCliente.get(cliente.id) ?? [];
    const matchedVehicleIds = hasActiveSearch
      ? veiculos
          .filter((veiculo) => matchesQuery(veiculo.placa, normalizedSearch))
          .map((veiculo) => veiculo.id)
      : [];

    const matchesCliente = !hasActiveSearch || clienteMatchIds.has(cliente.id);

    if (!matchesCliente && matchedVehicleIds.length === 0) {
      return acc;
    }

    acc.push({
      cliente,
      veiculos,
      vehicleCount: veiculos.length,
      matchedVehicleIds
    });

    return acc;
  }, []);

  return {
    results,
    autoExpandedClienteIds: results
      .filter((result) => result.matchedVehicleIds.length > 0)
      .map((result) => result.cliente.id),
    totalClientes: clientes.length,
    totalVeiculos: countVeiculos(veiculosByCliente)
  };
}

export function resolveExpandedClienteIds({
  manualExpandedClienteIds,
  autoExpandedClienteIds,
  allowMultiple
}: ResolveExpandedClienteIdsParams) {
  if (allowMultiple) {
    return new Set([
      ...manualExpandedClienteIds,
      ...autoExpandedClienteIds
    ]);
  }

  if (autoExpandedClienteIds.length > 0) {
    return new Set([autoExpandedClienteIds[0]]);
  }

  const manualIds = [...manualExpandedClienteIds];
  const lastManualId = manualIds[manualIds.length - 1];

  return lastManualId ? new Set([lastManualId]) : new Set<number>();
}

export function toggleExpandedCliente({
  currentExpandedClienteIds,
  clienteId,
  allowMultiple
}: ToggleExpandedClienteParams) {
  const nextExpandedClienteIds = new Set(currentExpandedClienteIds);

  if (allowMultiple) {
    if (nextExpandedClienteIds.has(clienteId)) {
      nextExpandedClienteIds.delete(clienteId);
    } else {
      nextExpandedClienteIds.add(clienteId);
    }

    return nextExpandedClienteIds;
  }

  if (nextExpandedClienteIds.has(clienteId)) {
    return new Set<number>();
  }

  return new Set([clienteId]);
}
