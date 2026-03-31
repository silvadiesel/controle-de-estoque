// app/(dashboard)/dashboard/_components/activity-feed.tsx
'use client';

import { useMemo } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

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
  produto: 'Produto',
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
  criacao: '#22c55e',
  edicao: '#eab308',
  exclusao: '#ef4444'
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
}

export function ActivityFeed({ movimentacoes, isLoading }: ActivityFeedProps) {
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
    <div className="flex-1 bg-card border border-border rounded-[10px] p-5">
      <div className="mb-4">
        <h2 className="text-heading" style={{ color: 'var(--text-bright)' }}>
          Atividade Recente
        </h2>
        <p className="text-muted-sm mt-0.5">Últimas ações no sistema</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-[6px]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-sm">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex flex-col">
            {items.map((item, idx) => (
              <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Linha vertical — conecta ao próximo item */}
                {idx < items.length - 1 && (
                  <div className="absolute left-[4px] top-[13px] bottom-0 w-px bg-border" />
                )}

                {/* Dot colorido */}
                <div className="relative mt-[4px] shrink-0">
                  <div
                    className="h-[9px] w-[9px] rounded-full"
                    style={{
                      backgroundColor: DOT_COLORS[item.tipo_acao] ?? '#52525b'
                    }}
                  />
                </div>

                {/* Texto */}
                <div className="min-w-0 flex-1">
                  <p className="text-body leading-snug" style={{ color: 'var(--text-primary)' }}>
                    <span style={{ color: 'var(--text-bright)' }}>{item.autor}</span>{' '}
                    <span style={{ color: 'var(--text-muted)' }}>
                      {ACAO_LABELS[item.tipo_acao] ?? item.tipo_acao}
                    </span>{' '}
                    <span className="font-medium text-primary">
                      {ENTIDADE_LABELS[item.entidade] ?? item.entidade}
                    </span>
                  </p>
                  <p className="mt-0.5" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
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
