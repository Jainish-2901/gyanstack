import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch all users for management.
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.users || [];
    },
  });
};

/**
 * Mutation hooks for user management.
 */
export const useAdminUserMutation = () => {
  const queryClient = useQueryClient();

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deactivateUser = useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return { changeRole, deactivateUser };
};
