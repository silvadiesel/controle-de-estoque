'use client';

import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from '@/lib/auth-client';

import { Eye, EyeOff, KeyRound, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const EMPTY_FORM: FormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.currentPassword) {
    errors.currentPassword = 'Informe sua senha atual.';
  }

  if (!form.newPassword) {
    errors.newPassword = 'Informe a nova senha.';
  } else if (form.newPassword.length < MIN_PASSWORD_LENGTH) {
    errors.newPassword = `A nova senha precisa ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  } else if (form.newPassword === form.currentPassword) {
    errors.newPassword = 'A nova senha deve ser diferente da atual.';
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Confirme a nova senha.';
  } else if (form.confirmPassword !== form.newPassword) {
    errors.confirmPassword = 'As senhas não coincidem.';
  }

  return errors;
}

const LABEL_CLASS =
  'text-muted-foreground uppercase text-[10px] tracking-wider font-medium';

export function ChangePasswordCard() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const updateField = (field: keyof FormState, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    // Re-valida em tempo real apenas após a primeira tentativa de envio.
    if (submitted) {
      setErrors(validate(next));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validate(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('Verifique os campos destacados.');
      return;
    }

    setIsSaving(true);

    const { error } = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      revokeOtherSessions: false
    });

    setIsSaving(false);

    if (error) {
      // Senha atual incorreta vem como 400/INVALID_PASSWORD no Better Auth.
      const isWrongCurrent =
        error.status === 400 ||
        error.code === 'INVALID_PASSWORD' ||
        error.message?.toLowerCase().includes('password');

      if (isWrongCurrent) {
        setErrors({ currentPassword: 'Senha atual incorreta.' });
        toast.error('Senha atual incorreta.');
      } else {
        toast.error(
          error.message ?? 'Não foi possível alterar a senha. Tente novamente.'
        );
      }
      return;
    }

    toast.success('Senha alterada com sucesso.');
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
  };

  return (
    <Card className='bg-card border-border mt-4'>
      <CardHeader>
        <CardTitle className='text-foreground flex items-center gap-2'>
          <KeyRound className='h-5 w-5 text-primary' />
          Alterar Senha
        </CardTitle>
        <CardDescription className='text-muted-foreground'>
          Atualize a senha da sua conta. É necessário informar a senha atual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit}
          className='flex max-w-md flex-col gap-5'
          noValidate>
          <div className='space-y-2'>
            <Label htmlFor='current-password' className={LABEL_CLASS}>
              Senha atual
            </Label>
            <Input
              id='current-password'
              type={showPasswords ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => updateField('currentPassword', e.target.value)}
              autoComplete='current-password'
              aria-invalid={Boolean(errors.currentPassword)}
              disabled={isSaving}
              className='bg-input border-border'
            />
            {errors.currentPassword && (
              <p className='text-sm text-destructive'>
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='new-password' className={LABEL_CLASS}>
              Nova senha
            </Label>
            <div className='relative'>
              <Input
                id='new-password'
                type={showPasswords ? 'text' : 'password'}
                value={form.newPassword}
                onChange={(e) => updateField('newPassword', e.target.value)}
                autoComplete='new-password'
                aria-invalid={Boolean(errors.newPassword)}
                disabled={isSaving}
                className='bg-input border-border pr-12'
              />
              <button
                type='button'
                onClick={() => setShowPasswords((v) => !v)}
                aria-label={showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'>
                {showPasswords ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            {errors.newPassword ? (
              <p className='text-sm text-destructive'>{errors.newPassword}</p>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Mínimo de {MIN_PASSWORD_LENGTH} caracteres.
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirm-password' className={LABEL_CLASS}>
              Confirmar nova senha
            </Label>
            <Input
              id='confirm-password'
              type={showPasswords ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              autoComplete='new-password'
              aria-invalid={Boolean(errors.confirmPassword)}
              disabled={isSaving}
              className='bg-input border-border'
            />
            {errors.confirmPassword && (
              <p className='text-sm text-destructive'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className='flex justify-end border-t border-border pt-4'>
            <Button
              type='submit'
              className='bg-primary text-primary-foreground hover:bg-primary/90'
              disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className='h-4 w-4 mr-2' />
                  Alterar senha
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
