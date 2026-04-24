import type { Peca } from '@/db/schema';

type OrdemStatus = 'ativa' | 'fechada' | 'cancelada';

type OrdemCliente = {
  id: number;
  nome_empresa: string;
} | null;

type OrdemPecaItem = {
  peca_id: number;
  quantidade: number;
  peca?: unknown;
}[];

type OrdemServiceSearchable = {
  id: number;
  data_criacao: string;
  status: OrdemStatus;
  valor_total: number;
  observacao: string | null;
  cliente: OrdemCliente;
  veiculo?: {
    placa: string;
    modelo: string;
  } | null;
  funcionario?: {
    name: string;
  } | null;
  funcionario_responsavel?: {
    name: string;
  } | null;
  pecas: OrdemPecaItem;
};

type OrdemSaleSearchable = {
  id: number;
  data_criacao: string;
  status: OrdemStatus;
  valor_total: number;
  observacao: string | null;
  cliente: OrdemCliente;
  metodo_pagamento?: string | null;
  pecas: OrdemPecaItem;
};

export interface OrdemFilters {
  search: string;
  status: 'all' | OrdemStatus;
  month: string;
}

export interface OrdemMetrics {
  total: number;
  ativas: number;
  fechadas: number;
  canceladas: number;
  valorTotal: number;
}

export interface OrdemVendaFormInitialData {
  data_pagamento: string | null;
  data_previsao_pagamento?: string | null;
  status: OrdemStatus;
  cliente_id: number;
  observacao: string | null;
  valor_total: number;
  metodo_pagamento?:
    | 'pix'
    | 'boleto'
    | 'cheque'
    | 'debito'
    | 'credito'
    | 'dinheiro'
    | null;
  pecas: {
    peca_id: number;
    quantidade: number;
    peca?:
      | Pick<Peca, 'id' | 'name_peca' | 'quantidade' | 'preco'>
      | null;
  }[];
}

const normalizeSearchValue = (value: string | number | null | undefined) =>
  String(value ?? '').trim().toLowerCase();

export function buildOrdensMetrics(
  ordens: Array<Pick<OrdemServiceSearchable, 'status' | 'valor_total'>>
): OrdemMetrics {
  return ordens.reduce<OrdemMetrics>(
    (acc, ordem) => {
      acc.total += 1;
      acc.valorTotal += ordem.valor_total;

      if (ordem.status === 'ativa') acc.ativas += 1;
      if (ordem.status === 'fechada') acc.fechadas += 1;
      if (ordem.status === 'cancelada') acc.canceladas += 1;

      return acc;
    },
    {
      total: 0,
      ativas: 0,
      fechadas: 0,
      canceladas: 0,
      valorTotal: 0
    }
  );
}

export function buildAvailableMonths(
  ordens: Array<Pick<OrdemServiceSearchable, 'data_criacao'>>
) {
  const months = new Set<string>();

  for (const ordem of ordens) {
    const date = new Date(ordem.data_criacao);
    months.add(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    );
  }

  return [...months].sort().reverse();
}

export function filterOrdens<T extends OrdemServiceSearchable | OrdemSaleSearchable>(
  ordens: T[],
  filters: OrdemFilters
) {
  const search = normalizeSearchValue(filters.search);

  return ordens.filter((ordem) => {
    const baseSearchFields = [
      ordem.id,
      ordem.observacao,
      ordem.cliente?.nome_empresa
    ];

    const serviceSearchFields =
      'veiculo' in ordem
        ? [
            ordem.veiculo?.placa,
            ordem.veiculo?.modelo,
            ordem.funcionario_responsavel?.name
          ]
        : [];

    const saleSearchFields =
      'metodo_pagamento' in ordem ? [ordem.metodo_pagamento] : [];

    const matchesSearch =
      search.length === 0 ||
      [...baseSearchFields, ...serviceSearchFields, ...saleSearchFields].some(
        (field) => normalizeSearchValue(field).includes(search)
      );

    const matchesStatus =
      filters.status === 'all' || ordem.status === filters.status;

    const matchesMonth =
      filters.month === 'all' ||
      buildAvailableMonths([{ data_criacao: ordem.data_criacao }])[0] ===
        filters.month;

    return matchesSearch && matchesStatus && matchesMonth;
  });
}

export function buildVendaFormInitialData(
  ordem: OrdemVendaFormInitialData,
  availablePecas: Peca[] = []
) {
  const normalizedDate =
    ordem.data_pagamento ?? ordem.data_previsao_pagamento ?? null;

  return {
    data_pagamento: normalizedDate ? normalizedDate.split('T')[0] : '',
    status: ordem.status,
    cliente_id: ordem.cliente_id,
    observacao: ordem.observacao ?? '',
    valor_total: ordem.valor_total,
    metodo_pagamento: ordem.metodo_pagamento ?? undefined,
    pecas: ordem.pecas.map((peca) => {
      const pecaBanco = availablePecas.find((p) => p.id === peca.peca_id);
      const estoqueEfetivo = (pecaBanco?.quantidade ?? peca.peca?.quantidade ?? 0) + peca.quantidade;

      return {
        peca_id: peca.peca_id,
        quantidade: peca.quantidade,
        peca: pecaBanco
          ? { ...pecaBanco, quantidade: estoqueEfetivo }
          : (peca.peca
            ? { id: peca.peca.id, name_peca: peca.peca.name_peca, preco: peca.peca.preco, quantidade: estoqueEfetivo }
            : null)
      };
    })
  };
}
