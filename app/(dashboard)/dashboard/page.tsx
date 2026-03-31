'use client';

import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import {
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  Package,
  ShoppingCart,
  Users,
  Wrench
} from 'lucide-react';

interface DashboardStats {
  totalProdutos: number;
  totalClientes: number;
  ordensAtivas: number;
  alertasEstoque: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const [produtosRes, clientesRes, ordensServicoRes, ordensVendaRes] =
        await Promise.all([
          fetch('/api/produtos'),
          fetch('/api/clientes'),
          fetch('/api/ordens/servico'),
          fetch('/api/ordens/venda')
        ]);

      const produtos = await produtosRes.json();
      const clientes = await clientesRes.json();
      const ordensServico = await ordensServicoRes.json();
      const ordensVenda = await ordensVendaRes.json();

      const produtosArr = Array.isArray(produtos) ? produtos : [];
      const ordensServicoArr = Array.isArray(ordensServico)
        ? ordensServico
        : [];
      const ordensVendaArr = Array.isArray(ordensVenda) ? ordensVenda : [];

      const ordensAtivas =
        ordensServicoArr.filter(
          (o: { status: string }) => o.status === 'ativa'
        ).length +
        ordensVendaArr.filter((o: { status: string }) => o.status === 'ativa')
          .length;

      const alertas = produtosArr.filter(
        (p: { quantidade: number; alerta: number | null }) =>
          p.quantidade <= (p.alerta ?? 0)
      ).length;

      setStats({
        totalProdutos: produtosArr.length,
        totalClientes: Array.isArray(clientes) ? clientes.length : 0,
        ordensAtivas,
        alertasEstoque: alertas
      });
    } catch {
      // Silently fail — show zeros
      setStats({
        totalProdutos: 0,
        totalClientes: 0,
        ordensAtivas: 0,
        alertasEstoque: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const quickLinks = [
    {
      label: 'Produtos',
      href: '/produtos',
      icon: Package,
      description: 'Gerenciar estoque'
    },
    {
      label: 'Clientes',
      href: '/clientes',
      icon: Users,
      description: 'Ver clientes e veículos'
    },
    {
      label: 'Ordens de Serviço',
      href: '/ordens',
      icon: Wrench,
      description: 'Serviços e vendas'
    },
    {
      label: 'Movimentações',
      href: '/movimentacoes',
      icon: ClipboardList,
      description: 'Histórico de ações'
    }
  ];

  return (
    <div className='flex flex-1 flex-col gap-6 p-4 lg:p-6'>
      {/* Header */}
      <div className='flex flex-col gap-1'>
        <div className='flex items-center gap-2.5'>
          <div className='h-7 w-1 rounded-full bg-primary' />
          <h1 className='text-2xl font-bold text-foreground'>Dashboard</h1>
        </div>
        <p className='pl-3.5 text-sm text-muted-foreground'>
          Visão geral do seu sistema
        </p>
      </div>

      {/* Stats */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='bg-card border-border'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Produtos</p>
                {isLoading ? (
                  <Skeleton className='h-9 w-16 mt-1' />
                ) : (
                  <p className='text-3xl font-bold text-foreground'>
                    {stats?.totalProdutos ?? 0}
                  </p>
                )}
              </div>
              <div className='h-11 w-11 rounded-lg flex items-center justify-center bg-primary/10 text-primary'>
                <Package className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Clientes</p>
                {isLoading ? (
                  <Skeleton className='h-9 w-16 mt-1' />
                ) : (
                  <p className='text-3xl font-bold text-foreground'>
                    {stats?.totalClientes ?? 0}
                  </p>
                )}
              </div>
              <div className='h-11 w-11 rounded-lg flex items-center justify-center bg-primary/10 text-primary'>
                <Users className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Ordens Ativas</p>
                {isLoading ? (
                  <Skeleton className='h-9 w-16 mt-1' />
                ) : (
                  <p className='text-3xl font-bold text-foreground'>
                    {stats?.ordensAtivas ?? 0}
                  </p>
                )}
              </div>
              <div className='h-11 w-11 rounded-lg flex items-center justify-center bg-warning/10 text-warning'>
                <ShoppingCart className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-card border-border'>
          <CardContent className='p-5'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  Alertas de Estoque
                </p>
                {isLoading ? (
                  <Skeleton className='h-9 w-16 mt-1' />
                ) : (
                  <p className='text-3xl font-bold text-foreground'>
                    {stats?.alertasEstoque ?? 0}
                  </p>
                )}
              </div>
              <div className={`h-11 w-11 rounded-lg flex items-center justify-center ${(stats?.alertasEstoque ?? 0) > 0 ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                <AlertTriangle className='h-5 w-5' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick access */}
      <div>
        <h2 className='text-lg font-semibold text-foreground mb-3'>
          Acesso rápido
        </h2>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className='bg-card border-border hover:border-primary/40 transition-colors group cursor-pointer h-full'>
                <CardContent className='p-5 flex items-center gap-4'>
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'>
                    <link.icon className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='font-medium text-foreground text-sm'>
                      {link.label}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {link.description}
                    </p>
                  </div>
                  <ArrowRight className='h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0' />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
