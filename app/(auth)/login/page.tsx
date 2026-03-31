'use client';

import type React from 'react';
import { startTransition, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AuthShell } from '@/app/(auth)/auth-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn } from '@/lib/auth-client';

import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

function getLoginErrorMessage(message?: string) {
  const normalized = message?.toLowerCase() ?? '';

  if (
    normalized.includes('invalid') ||
    normalized.includes('credential') ||
    normalized.includes('senha') ||
    normalized.includes('password') ||
    normalized.includes('email')
  ) {
    return 'Email ou senha invalidos. Confira seus dados e tente novamente.';
  }

  return 'Nao foi possivel fazer login agora. Tente novamente em instantes.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password
      });

      if (result.error) {
        setError(getLoginErrorMessage(result.error.message));
      } else {
        startTransition(() => {
          router.push('/dashboard');
          router.refresh();
        });
      }
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      formTitle='Acesse sua conta'
      mobileMessage='Entre para centralizar sua operacao e manter estoque, ordens e relacionamento com clientes sob controle.'
      footer={
        <>
          Nao tem uma conta?{' '}
          <Link
            href='/register'
            className='font-medium text-primary transition-colors hover:text-white'>
            Criar conta
          </Link>
        </>
      }>
      <form onSubmit={handleSubmit} className='space-y-5'>
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
              autoComplete='current-password'
              aria-invalid={Boolean(error)}
              required
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
              Entrando...
            </>
          ) : (
            <>
              Entrar no sistema
              <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
            </>
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
