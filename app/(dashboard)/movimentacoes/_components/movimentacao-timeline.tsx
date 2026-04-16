import {
  Car,
  Factory,
  FilePenLine,
  Package,
  PackagePlus,
  ShoppingCart,
  Tag,
  Trash2,
  User,
  UserCog,
  Wrench
} from 'lucide-react';

import {
  type Entidade,
  type Movimentacao,
  type TipoAcao
} from '../_hook/useMovimentacoes';

const ENTIDADE_CONFIG: Record<
  Entidade,
  { label: string; icon: React.ElementType; className: string }
> = {
  produto: {
    label: 'Peça',
    icon: Package,
    className: 'bg-orange-500/10 text-orange-300'
  },
  cliente: {
    label: 'Cliente',
    icon: User,
    className: 'bg-violet-500/10 text-violet-300'
  },
  fornecedor: {
    label: 'Fornecedor',
    icon: Factory,
    className: 'bg-amber-500/10 text-amber-300'
  },
  categoria: {
    label: 'Categoria',
    icon: Tag,
    className: 'bg-pink-500/10 text-pink-300'
  },
  veiculo: {
    label: 'Veículo',
    icon: Car,
    className: 'bg-sky-500/10 text-sky-300'
  },
  ordem_venda: {
    label: 'Ordem de Venda',
    icon: ShoppingCart,
    className: 'bg-teal-500/10 text-teal-300'
  },
  ordem_servico: {
    label: 'Ordem de Serviço',
    icon: Wrench,
    className: 'bg-indigo-500/10 text-indigo-300'
  },
  usuario: {
    label: 'Usuário',
    icon: UserCog,
    className: 'bg-rose-500/10 text-rose-300'
  }
};

const ACAO_CONFIG: Record<
  TipoAcao,
  { label: string; icon: React.ElementType; className: string; dotColor: string }
> = {
  criacao: {
    label: 'Criação',
    icon: PackagePlus,
    className: 'bg-success/10 text-success',
    dotColor: 'var(--success)'
  },
  edicao: {
    label: 'Edição',
    icon: FilePenLine,
    className: 'bg-primary/10 text-primary',
    dotColor: 'var(--warning)'
  },
  exclusao: {
    label: 'Exclusão',
    icon: Trash2,
    className: 'bg-destructive/10 text-destructive',
    dotColor: 'var(--destructive)'
  }
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

interface MovimentacaoTimelineProps {
  movimentacoes: Movimentacao[];
}

export function MovimentacaoTimeline({
  movimentacoes
}: MovimentacaoTimelineProps) {
  if (movimentacoes.length === 0) {
    return (
      <div className='flex items-center justify-center py-12'>
        <p className='text-sm text-muted-foreground'>
          Nenhuma movimentação encontrada
        </p>
      </div>
    );
  }

  return (
    <div>
      {movimentacoes.map((mov, idx) => {
        const entidade = ENTIDADE_CONFIG[mov.entidade];
        const acao = ACAO_CONFIG[mov.tipo_acao];
        const EntidadeIcon = entidade?.icon;
        const AcaoIcon = acao?.icon;
        const isLast = idx === movimentacoes.length - 1;

        return (
          <div
            key={mov.id}
            className='flex items-center px-5 hover:bg-elevated transition-colors'>
            {/* Trilho da timeline */}
            <div className='flex flex-col items-center w-6 shrink-0 self-stretch'>
              <div
                className={`flex-1 w-px ${idx === 0 ? 'bg-transparent' : 'bg-border'}`}
              />
              <div
                className='h-2 w-2 rounded-full shrink-0'
                style={{
                  backgroundColor:
                    acao?.dotColor ?? 'var(--muted-foreground)'
                }}
              />
              <div
                className={`flex-1 w-px ${isLast ? 'bg-transparent' : 'bg-border'}`}
              />
            </div>

            {/* Row com 5 colunas proporcionais */}
            <div
              className={`flex flex-1 items-center py-2.5 pl-3 ${
                !isLast ? 'border-b border-border' : ''
              }`}>
              {/* Col 1: Descrição — flex:2 ≈ 1/3 da largura total */}
              <p className='flex-[2] min-w-0 text-[13px] text-foreground truncate pr-4'>
                {mov.descricao}
              </p>

              {/* Col 2: Entidade — flex:1 */}
              <div className='flex-1 min-w-0 pr-3'>
                {entidade && EntidadeIcon && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${entidade.className}`}>
                    <EntidadeIcon size={10} />
                    {entidade.label}
                  </span>
                )}
              </div>

              {/* Col 3: Ação — flex:1 */}
              <div className='flex-1 min-w-0 pr-3'>
                {acao && AcaoIcon && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${acao.className}`}>
                    <AcaoIcon size={10} />
                    {acao.label}
                  </span>
                )}
              </div>

              {/* Col 4: Autor — flex:1 */}
              <p className='flex-1 min-w-0 text-[12px] text-muted-foreground truncate pr-3'>
                {mov.autor}
              </p>

              {/* Col 5: Data · Hora — flex:1, alinhado à direita */}
              <p className='flex-1 min-w-0 text-[11px] text-muted-foreground text-right'>
                {formatDate(mov.created_at)} · {formatTime(mov.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
