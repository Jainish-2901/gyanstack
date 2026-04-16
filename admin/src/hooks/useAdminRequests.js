import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useContentRequests = () => {
  return useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests');
      return data.requests || [];
    },
    retry: 1,
  });
};

export const useRequestMutation = () => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/requests/${id}`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast.success(
        variables.status === 'fulfilled'
          ? '✅ Request marked as fulfilled!'
          : '🔄 Request reopened as pending.'
      );
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to update request status.';
      toast.error(`❌ ${msg}`);
      console.error('Status update error:', err);
    },
  });

  const deleteRequest = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/requests/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
      toast.success('🗑️ Request deleted successfully.');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to delete request.';
      toast.error(`❌ ${msg}`);
      console.error('Delete error:', err);
    },
  });

  return { updateStatus, deleteRequest };
};
