import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useContentRequests = () => {
  return useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests');
      return data.requests || [];
    },
  });
};

export const useRequestMutation = () => {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/requests/${id}`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
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
