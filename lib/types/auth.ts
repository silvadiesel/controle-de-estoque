// Tipos de cargo disponíveis no sistema
export type Cargo = 'atendente' | 'estoquista' | 'admin';

// Hierarquia de permissões (maior = mais permissões)
export const CARGO_HIERARCHY: Record<Cargo, number> = {
  atendente: 1,
  estoquista: 2,
  admin: 3
};

// Labels amigáveis para exibição
export const CARGO_LABELS: Record<Cargo, string> = {
  atendente: 'Atendente',
  estoquista: 'Estoquista',
  admin: 'Administrador'
};

// Cores para badges (Tailwind)
export const CARGO_COLORS: Record<Cargo, string> = {
  atendente: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  estoquista:
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  admin:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
};

// Tipo do usuário estendido com os campos adicionais
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  cargo: Cargo;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
