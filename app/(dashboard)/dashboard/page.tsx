import { Card, CardContent } from '@/components/ui/card';

import { Activity, AlertTriangle, DollarSign, Package } from 'lucide-react';

// Dados mock para demonstração
const stats = [
  {
    title: 'Total de Produtos',
    value: '156',
    icon: Package,
    color: 'bg-primary/20 text-primary'
  },
  {
    title: 'Itens em Estoque',
    value: '2.847',
    icon: Activity,
    color: 'bg-chart-2/20 text-chart-2'
  },
  {
    title: 'Estoque Baixo',
    value: '12',
    icon: AlertTriangle,
    color: 'bg-chart-5/20 text-chart-5'
  },
  {
    title: 'Valor Total',
    value: 'R$ 45.230',
    icon: DollarSign,
    color: 'bg-chart-4/20 text-chart-4'
  }
];

export default function DashboardPage() {
  return (
    <div className='flex flex-1 flex-col gap-4 p-4 lg:p-4'>
      {/* Header da página */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h2 className='text-2xl font-bold text-foreground'>Dashboard</h2>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>Visão geral do seu estoque</p>
      </div>

      {/* Cards de estatísticas */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className='bg-card border-border'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {stat.title}
                    </p>
                    <p className='text-3xl font-bold text-foreground'>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className='h-6 w-6' />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Área de conteúdo principal */}
      <div className='grid gap-4 lg:grid-cols-2'>
        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <h3 className='text-lg font-semibold text-foreground mb-4'>
              Movimentações Recentes
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between rounded-lg bg-secondary/50 p-3'>
                <div>
                  <p className='font-medium text-foreground'>Filtro de Óleo</p>
                  <p className='text-xs text-muted-foreground'>
                    Entrada de estoque
                  </p>
                </div>
                <span className='font-bold text-chart-2'>+50</span>
              </div>
              <div className='flex items-center justify-between rounded-lg bg-secondary/50 p-3'>
                <div>
                  <p className='font-medium text-foreground'>
                    Pastilha de Freio
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Ordem de serviço #1234
                  </p>
                </div>
                <span className='font-bold text-primary'>-4</span>
              </div>
              <div className='flex items-center justify-between rounded-lg bg-secondary/50 p-3'>
                <div>
                  <p className='font-medium text-foreground'>Lâmpada H7</p>
                  <p className='text-xs text-muted-foreground'>
                    Ordem de serviço #1233
                  </p>
                </div>
                <span className='font-bold text-primary'>-2</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='px-4'>
            <h3 className='text-lg font-semibold text-foreground mb-4'>
              Alertas de Estoque
            </h3>
            <div className='space-y-3'>
              <div className='flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 p-3'>
                <div>
                  <p className='font-medium text-foreground'>Correia Dentada</p>
                  <p className='text-xs text-destructive'>
                    Estoque crítico: 2 unidades
                  </p>
                </div>
                <AlertTriangle className='h-5 w-5 text-destructive' />
              </div>
              <div className='flex items-center justify-between rounded-lg bg-chart-4/10 border border-chart-4/20 p-3'>
                <div>
                  <p className='font-medium text-foreground'>Vela de Ignição</p>
                  <p className='text-xs text-chart-4'>
                    Estoque baixo: 8 unidades
                  </p>
                </div>
                <AlertTriangle className='h-5 w-5 text-chart-4' />
              </div>
              <div className='flex items-center justify-between rounded-lg bg-chart-4/10 border border-chart-4/20 p-3'>
                <div>
                  <p className='font-medium text-foreground'>Filtro de Ar</p>
                  <p className='text-xs text-chart-4'>
                    Estoque baixo: 5 unidades
                  </p>
                </div>
                <AlertTriangle className='h-5 w-5 text-chart-4' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
