import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data.users || [];
    },
  });
};

export const useAdminUserMutation = () => {
  const queryClient = useQueryClient();

  const changeRole = useMutation({
    mutationFn: async ({ userId, role }) => {
      const { data } = await api.put(`/admin/users/${userId}/role`, { role });
      return data;
    },
    onSuccess: (_, { role }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`✅ Role updated to "${role}" successfully.`);
    },
    onError: (err) => {
      toast.error(`❌ ${err.response?.data?.message || 'Failed to update role.'}`);
    },
  });

  const deactivateUser = useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.delete(`/admin/users/${userId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('🔒 User deactivated. Their content is preserved.');
    },
    onError: (err) => {
      toast.error(`❌ ${err.response?.data?.message || 'Failed to deactivate user.'}`);
    },
  });

  const reactivateUser = useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.patch(`/admin/users/${userId}/reactivate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('✅ User account reactivated successfully.');
    },
    onError: (err) => {
      toast.error(`❌ ${err.response?.data?.message || 'Failed to reactivate user.'}`);
    },
  });

  return { changeRole, deactivateUser, reactivateUser };
};
