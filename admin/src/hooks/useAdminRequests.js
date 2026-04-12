import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch all user content requests for admin management.
 */
export const useContentRequests = () => {
  return useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests');
      return data.requests || [];
    },
  });
};

/**
 * Mutation hooks for request management.
 */
export const useRequestMutation = () => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/requests/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      // Also potentially invalidate user-specific queries if they were viewing their own
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
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
    },
  });

  return { updateStatus, deleteRequest };
};
