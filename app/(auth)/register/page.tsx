'use client';

import type React from 'react';
import { startTransition, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/app/(auth)/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth-client';

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

function getRegisterErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (normalized.includes('exist') || normalized.includes('already')) {
    return 'Esse email ja esta em uso. Tente entrar ou use outro endereco.';
  }

  if (normalized.includes('password') || normalized.includes('senha')) {
    return 'Sua senha precisa atender aos requisitos minimos para concluir o cadastro.';
  }

  return 'Nao foi possivel criar sua conta agora. Tente novamente em instantes.';
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const CODIGO_LOJA = '367';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (codigoVerificacao !== CODIGO_LOJA) {
      setError(
        'Codigo de verificacao invalido. Entre em contato com o administrador.'
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.email({
        name,
        email,
        password
      });

      if (result.error) {
        setError(getRegisterErrorMessage(result.error.message));
      } else {
        startTransition(() => {
          router.push('/login');
        });
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      formTitle='Crie sua conta'
      mobileMessage='Abra seu acesso para centralizar a operacao e comecar a organizar estoque, ordens e clientes em um so lugar.'
      footer={
        <>
          Ja tem uma conta?{' '}
          <Link
            href='/login'
            className='font-medium text-primary transition-colors hover:text-white'>
            Entrar
          </Link>
        </>
      }>
      <form onSubmit={handleSubmit} className='space-y-5'>
        <div className='space-y-2'>
          <Label htmlFor='name' className='text-base font-medium text-foreground'>
            Nome completo
          </Label>
          <Input
            id='name'
            type='text'
            placeholder='Seu nome'
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete='name'
            aria-invalid={Boolean(error)}
            required
            disabled={loading}
            className='h-14 rounded-2xl border-border bg-input px-4 text-base text-foreground placeholder:text-muted-foreground'
          />
        </div>

        <div className='space-y-2'>
          <Label
            htmlFor='email'
            className='text-base font-medium text-foreground'>
            Email
          </Label>
          <Input
            id='email'
            type='email'
            placeholder='seu@email.com'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete='email'
            aria-invalid={Boolean(error)}
            required
            disabled={loading}
            className='h-14 rounded-2xl border-border bg-input px-4 text-base text-foreground placeholder:text-muted-foreground'
          />
        </div>

        <div className='space-y-2'>
          <Label
            htmlFor='password'
            className='text-base font-medium text-foreground'>
            Senha
          </Label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='new-password'
              aria-invalid={Boolean(error)}
              required
              minLength={8}
              disabled={loading}
              className='h-14 rounded-2xl border-border bg-input px-4 pr-12 text-base text-foreground placeholder:text-muted-foreground'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'>
              {showPassword ? (
                <EyeOff className='h-5 w-5' />
              ) : (
                <Eye className='h-5 w-5' />
              )}
            </button>
          </div>
          <p className='text-sm leading-6 text-muted-foreground'>
            Minimo de 8 caracteres.
          </p>
        </div>

        <div className='space-y-2'>
          <Label
            htmlFor='codigoVerificacao'
            className='text-base font-medium text-foreground'>
            Codigo de verificacao
          </Label>
          <Input
            id='codigoVerificacao'
            type='text'
            placeholder='Digite o codigo da loja'
            value={codigoVerificacao}
            onChange={(e) => setCodigoVerificacao(e.target.value)}
            autoComplete='off'
            aria-invalid={Boolean(error)}
            required
            disabled={loading}
            className='h-14 rounded-2xl border-border bg-input px-4 text-base text-foreground placeholder:text-muted-foreground'
          />
          <p className='text-sm leading-6 text-muted-foreground'>
            Solicite o codigo ao administrador para liberar o cadastro.
          </p>
        </div>

        {error && (
          <div
            aria-live='polite'
            role='alert'
            className='flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            <AlertCircle className='h-5 w-5 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        <Button
          type='submit'
          className='group h-14 w-full rounded-2xl bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90'
          disabled={loading}>
          {loading ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Criando conta...
            </>
          ) : (
            <>
              Criar minha conta
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
