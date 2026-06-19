'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useState
} from 'react';

import type { User } from '@/db/schema';
import type { FuzzySearchConfig } from '@/lib/fuzzy-search';
import { useFuzzySearch } from '@/hooks/useFuzzySearch';

import { toast } from 'sonner';

export type UserWithoutPassword = Omit<User, 'emailVerified' | 'updatedAt'>;

const USER_SEARCH: FuzzySearchConfig = {
  fuzzyKeys: ['name', 'email']
};

export interface UseUsersReturn {
  users: UserWithoutPassword[];
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  search: string;
  setSearch: (search: string) => void;
  filteredUsers: UserWithoutPassword[];
  editingUser: UserWithoutPassword | null;
  setEditingUser: Dispatch<SetStateAction<UserWithoutPassword | null>>;
  deletingUserId: string | null;
  setDeletingUserId: (id: string | null) => void;
  fetchUsers: () => Promise<void>;
  handleUpdateUser: () => Promise<void>;
  handleDeleteUser: () => Promise<boolean>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserWithoutPassword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(
    null
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // GET: List users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error('Falha ao carregar usuários');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao carregar usuários'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtered users - fuzzy search by name, email
  const filteredUsers = useFuzzySearch(users, search, USER_SEARCH);

  // PUT: Update user
  const handleUpdateUser = useCallback(async () => {
    if (!editingUser) return;

    try {
      setIsSaving(true);

      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          cargo: editingUser.cargo,
          status: editingUser.status
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao atualizar usuário');
      }

      await fetchUsers();
      setEditingUser(null);
      toast.success('Usuário atualizado com sucesso!');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao atualizar usuário'
      );
    } finally {
      setIsSaving(false);
    }
  }, [editingUser, fetchUsers]);

  // DELETE: Remove user
  const handleDeleteUser = useCallback(async (): Promise<boolean> => {
    if (!deletingUserId) {
      return false;
    }

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/users/${deletingUserId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Falha ao excluir usuário');
      }

      await fetchUsers();
      setDeletingUserId(null);
      toast.success('Usuário excluído com sucesso!');
      return true;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Erro ao excluir usuário'
      );
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [deletingUserId, fetchUsers]);

  return {
    users,
    isLoading,
    isSaving,
    isDeleting,
    search,
    setSearch,
    filteredUsers,
    editingUser,
    setEditingUser,
    deletingUserId,
    setDeletingUserId,
    fetchUsers,
    handleUpdateUser,
    handleDeleteUser
  };
}
