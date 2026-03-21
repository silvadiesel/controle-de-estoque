'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePagination } from '@/hooks/usePagination';

export type TipoAcao = 'criacao' | 'edicao' | 'exclusao';

export type Entidade =
  | 'produto'
  | 'cliente'
  | 'fornecedor'
  | 'categoria'
  | 'veiculo'
  | 'ordem_venda'
  | 'ordem_servico'
  | 'usuario';

export interface MovimentacaoAPI {
  id: number;
  tipo_acao: TipoAcao;
  entidade: Entidade;
  entidade_id: string | null;
  descricao: string;
  created_at: string;
  usuario: {
    id: string;
    name: string;
  } | null;
}

export interface Movimentacao {
  id: number;
  tipo_acao: TipoAcao;
  entidade: Entidade;
  entidade_id: string | null;
  descricao: string;
  autor: string;
  created_at: string;
}

export interface OpcaoMesAno {
  value: string; // "YYYY-MM"
  label: string; // "Março 2026"
}

export interface EstatisticasMovimentacoes {
  totalRegistros: number;
  totalCriacoes: number;
  totalEdicoes: number;
  totalExclusoes: number;
}

export interface UseMovimentacoesReturn {
  movimentacoesFiltradas: Movimentacao[];
  movimentacoesPaginadas: Movimentacao[];
  estatisticas: EstatisticasMovimentacoes;
  opcoesMessAno: OpcaoMesAno[];

  isLoading: boolean;
  temFiltroDeData: boolean;

  termoBusca: string;
  setTermoBusca: (value: string) => void;
  filtroTipoAcao: string;
  setFiltroTipoAcao: (value: string) => void;
  filtroEntidade: string;
  setFiltroEntidade: (value: string) => void;
  filtroMesAno: string;
  filtroDataInicial: Date | undefined;
  filtroDataFinal: Date | undefined;

  handleMesAnoChange: (value: string) => void;
  handleDataInicialChange: (date: Date | undefined) => void;
  handleDataFinalChange: (date: Date | undefined) => void;
  limparFiltrosDeData: () => void;

  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  pageItems: (number | 'ellipsis-start' | 'ellipsis-end')[];
  isFirstPage: boolean;
  isLastPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}

const ITENS_POR_PAGINA = 8;
const AUTOR_DESCONHECIDO = 'Usuário removido';

const AVATAR_COLORS = [
  'bg-orange-400 text-white',
  'bg-violet-400 text-white',
  'bg-teal-500 text-white',
  'bg-rose-400 text-white',
  'bg-sky-400 text-white',
  'bg-amber-500 text-white',
  'bg-indigo-400 text-white',
  'bg-emerald-500 text-white'
];

export function obterIniciais(nomeCompleto: string): string {
  return nomeCompleto
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

export function obterCorAvatar(nome: string): string {
  const index =
    nome.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function formatarDataHora(isoDate: string): { data: string; hora: string } {
  const date = new Date(isoDate);
  return {
    data: date.toLocaleDateString('pt-BR'),
    hora: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
}

/** Converte o formato da API para o formato normalizado da página */
function normalizarMovimentacao(mov: MovimentacaoAPI): Movimentacao {
  return {
    id: mov.id,
    tipo_acao: mov.tipo_acao,
    entidade: mov.entidade,
    entidade_id: mov.entidade_id,
    descricao: mov.descricao,
    autor: mov.usuario?.name ?? AUTOR_DESCONHECIDO,
    created_at: mov.created_at
  };
}

/** Gera a chave "YYYY-MM" a partir de uma data ISO */
function extrairChaveMesAno(isoDate: string): string {
  const data = new Date(isoDate);
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

/** Formata a chave "YYYY-MM" para label legível ex: "Março 2026" */
function formatarLabelMesAno(chave: string): string {
  const [ano, mes] = chave.split('-');
  const label = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString(
    'pt-BR',
    { month: 'long', year: 'numeric' }
  );
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Deriva as opções únicas de Mês/Ano das movimentações, em ordem decrescente */
function derivarOpcoesMesAno(movimentacoes: Movimentacao[]): OpcaoMesAno[] {
  const chavesUnicas = Array.from(
    new Set(movimentacoes.map((m) => extrairChaveMesAno(m.created_at)))
  );

  return chavesUnicas
    .sort((a, b) => b.localeCompare(a))
    .map((chave) => ({
      value: chave,
      label: formatarLabelMesAno(chave)
    }));
}

export function useMovimentacoes(): UseMovimentacoesReturn {
  // --- estado de dados ---
  const [todasMovimentacoes, setTodasMovimentacoes] = useState<Movimentacao[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  // --- estado de filtros ---
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroTipoAcao, setFiltroTipoAcao] = useState<string>('todas');
  const [filtroEntidade, setFiltroEntidade] = useState<string>('todas');
  const [filtroMesAno, setFiltroMesAno] = useState<string>('todos');
  const [filtroDataInicial, setFiltroDataInicial] = useState<
    Date | undefined
  >();
  const [filtroDataFinal, setFiltroDataFinal] = useState<Date | undefined>();

  const fetchMovimentacoes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/movimentacoes');

      if (!response.ok) {
        throw new Error(`Erro ao buscar movimentações: ${response.status}`);
      }

      const data: MovimentacaoAPI[] = await response.json();
      setTodasMovimentacoes(data.map(normalizarMovimentacao));
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  function handleMesAnoChange(value: string) {
    setFiltroMesAno(value);
    // Ao selecionar mês/ano, limpa o período personalizado
    setFiltroDataInicial(undefined);
    setFiltroDataFinal(undefined);
  }

  function handleDataInicialChange(date: Date | undefined) {
    setFiltroDataInicial(date);
    // Ao usar período personalizado, limpa o filtro de mês/ano
    setFiltroMesAno('todos');
  }

  function handleDataFinalChange(date: Date | undefined) {
    setFiltroDataFinal(date);
    // Ao usar período personalizado, limpa o filtro de mês/ano
    setFiltroMesAno('todos');
  }

  function limparFiltrosDeData() {
    setFiltroMesAno('todos');
    setFiltroDataInicial(undefined);
    setFiltroDataFinal(undefined);
  }

  const temFiltroDeData =
    filtroMesAno !== 'todos' ||
    filtroDataInicial !== undefined ||
    filtroDataFinal !== undefined;

  const movimentacoesFiltradas = useMemo(() => {
    return todasMovimentacoes.filter((movimentacao) => {
      const termoBuscaLower = termoBusca.toLowerCase();

      const correspondeAoBusca =
        termoBusca === '' ||
        movimentacao.descricao.toLowerCase().includes(termoBuscaLower) ||
        movimentacao.autor.toLowerCase().includes(termoBuscaLower);

      const correspondeAoTipoAcao =
        filtroTipoAcao === 'todas' || movimentacao.tipo_acao === filtroTipoAcao;

      const correspondeAEntidade =
        filtroEntidade === 'todas' || movimentacao.entidade === filtroEntidade;

      let correspondeAPeriodo = true;
      const dataMovimentacao = new Date(movimentacao.created_at);

      if (filtroMesAno !== 'todos') {
        const [ano, mes] = filtroMesAno.split('-');
        correspondeAPeriodo =
          dataMovimentacao.getFullYear() === Number(ano) &&
          dataMovimentacao.getMonth() + 1 === Number(mes);
      } else if (filtroDataInicial || filtroDataFinal) {
        if (filtroDataInicial) {
          const inicio = new Date(filtroDataInicial);
          inicio.setHours(0, 0, 0, 0);
          correspondeAPeriodo =
            correspondeAPeriodo && dataMovimentacao >= inicio;
        }
        if (filtroDataFinal) {
          const fim = new Date(filtroDataFinal);
          fim.setHours(23, 59, 59, 999);
          correspondeAPeriodo = correspondeAPeriodo && dataMovimentacao <= fim;
        }
      }

      return (
        correspondeAoBusca &&
        correspondeAoTipoAcao &&
        correspondeAEntidade &&
        correspondeAPeriodo
      );
    });
  }, [
    todasMovimentacoes,
    termoBusca,
    filtroTipoAcao,
    filtroEntidade,
    filtroMesAno,
    filtroDataInicial,
    filtroDataFinal
  ]);

  const estatisticas = useMemo<EstatisticasMovimentacoes>(
    () => ({
      totalRegistros: todasMovimentacoes.length,
      totalCriacoes: todasMovimentacoes.filter((m) => m.tipo_acao === 'criacao')
        .length,
      totalEdicoes: todasMovimentacoes.filter((m) => m.tipo_acao === 'edicao')
        .length,
      totalExclusoes: todasMovimentacoes.filter(
        (m) => m.tipo_acao === 'exclusao'
      ).length
    }),
    [todasMovimentacoes]
  );

  const opcoesMessAno = useMemo(
    () => derivarOpcoesMesAno(todasMovimentacoes),
    [todasMovimentacoes]
  );

  const paginacao = usePagination({
    items: movimentacoesFiltradas,
    itemsPerPage: ITENS_POR_PAGINA
  });

  return {
    movimentacoesFiltradas,
    movimentacoesPaginadas: paginacao.paginatedItems,
    estatisticas,
    opcoesMessAno,

    isLoading,
    temFiltroDeData,

    termoBusca,
    setTermoBusca,
    filtroTipoAcao,
    setFiltroTipoAcao,
    filtroEntidade,
    setFiltroEntidade,
    filtroMesAno,
    filtroDataInicial,
    filtroDataFinal,

    handleMesAnoChange,
    handleDataInicialChange,
    handleDataFinalChange,
    limparFiltrosDeData,

    currentPage: paginacao.currentPage,
    totalPages: paginacao.totalPages,
    totalItems: paginacao.totalItems,
    startItem: paginacao.startItem,
    endItem: paginacao.endItem,
    pageItems: paginacao.pageItems,
    isFirstPage: paginacao.isFirstPage,
    isLastPage: paginacao.isLastPage,
    goToPage: paginacao.goToPage,
    goToNextPage: paginacao.goToNextPage,
    goToPreviousPage: paginacao.goToPreviousPage
  };
}
