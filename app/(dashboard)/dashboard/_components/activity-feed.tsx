// app/(dashboard)/dashboard/_components/activity-feed.tsx
'use client';

import { useMemo } from 'react';

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle
} from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';

import { Activity } from 'lucide-react';

export interface MovimentacaoAPI {
  id: number;
  tipo_acao: 'criacao' | 'edicao' | 'exclusao';
  entidade: string;
  entidade_id: string | null;
  descricao: string;
  created_at: string;
  usuario: { id: string; name: string } | null;
}

interface FeedItem {
  id: number;
  tipo_acao: 'criacao' | 'edicao' | 'exclusao';
  entidade: string;
  created_at: string;
  autor: string;
}

const ENTIDADE_LABELS: Record<string, string> = {
  produto: 'Peça',
  cliente: 'Cliente',
  fornecedor: 'Fornecedor',
  categoria: 'Categoria',
  veiculo: 'Veículo',
  ordem_venda: 'Ordem de Venda',
  ordem_servico: 'Ordem de Serviço',
  usuario: 'Usuário'
};

const ACAO_LABELS: Record<string, string> = {
  criacao: 'criou',
  edicao: 'editou',
  exclusao: 'excluiu'
};

const DOT_COLORS: Record<string, string> = {
  criacao: 'var(--success)',
  edicao: 'var(--warning)',
  exclusao: 'var(--destructive)'
};

function timeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'ontem';
  return `${diffD}d atrás`;
}

interface ActivityFeedProps {
  movimentacoes: MovimentacaoAPI[];
  isLoading: boolean;
  state?: 'ready' | 'unavailable';
}

export function ActivityFeed({
  movimentacoes,
  isLoading,
  state = 'ready'
}: ActivityFeedProps) {
  const items: FeedItem[] = useMemo(
    () =>
      [...movimentacoes]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 8)
        .map((m) => ({
          id: m.id,
          tipo_acao: m.tipo_acao,
          entidade: m.entidade,
          created_at: m.created_at,
          autor: m.usuario?.name ?? 'Usuário removido'
        })),
    [movimentacoes]
  );

  return (
    <div className='flex-1 bg-card border border-border rounded-xl p-5'>
      <div className='mb-4 flex items-start justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold leading-tight text-foreground'>Atividade Recente</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>Últimas ações no sistema</p>
        </div>
        <div className='size-8 rounded-md flex items-center justify-center border border-border bg-elevated text-primary'>
          <Activity size={16} aria-hidden='true' />
        </div>
      </div>

      {state === 'unavailable' ? (
        <Empty className='border-border bg-card'>
          <EmptyHeader>
            <EmptyTitle>Dados indisponíveis</EmptyTitle>
            <EmptyDescription>
              Esse bloco não pode ser carregado agora.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoading ? (
        <div className='flex flex-col gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-9 w-full rounded-md' />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className='flex items-center justify-center h-32'>
          <p className='text-xs text-muted-foreground'>Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className='relative'>
          <div className='flex flex-col'>
            {items.map((item, idx) => (
              <div key={item.id} className='relative flex gap-3 pb-4 last:pb-0'>
                {/* Linha vertical — conecta ao próximo item */}
                {idx < items.length - 1 && (
                  <div className='absolute left-1 top-3 bottom-0 w-px bg-border' />
                )}

                {/* Dot colorido */}
                <div className='relative mt-1 shrink-0'>
                  <div
                    className='size-2 rounded-full'
                    style={{
                      backgroundColor:
                        DOT_COLORS[item.tipo_acao] ?? 'var(--muted-foreground)'
                    }}
                  />
                </div>

                {/* Texto */}
                <div className='min-w-0 flex-1'>
                  <p className='text-sm leading-snug text-foreground'>
                    <span className='text-foreground'>{item.autor}</span>{' '}
                    <span className='text-muted-foreground'>
                      {ACAO_LABELS[item.tipo_acao] ?? item.tipo_acao}
                    </span>{' '}
                    <span className='font-medium text-primary'>
                      {ENTIDADE_LABELS[item.entidade] ?? item.entidade}
                    </span>
                  </p>
                  <p className='mt-0.5 text-[10px] text-muted-foreground'>
                    {timeAgo(item.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
