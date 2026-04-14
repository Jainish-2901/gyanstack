import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useAdminStats = (period = 'all') => {
  return useQuery({
    queryKey: ['admin-stats', period],
    queryFn: async () => {
      const { data } = await api.get(`/admin/stats?period=${period}`);
      return data;
    },
    staleTime: 1000 * 60 * 1, 
  });
};
