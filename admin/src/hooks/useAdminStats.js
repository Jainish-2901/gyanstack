import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch dashboard statistics with period filtering.
 * @param {string} period - 'all', 'week', or 'month'
 */
export const useAdminStats = (period = 'all') => {
  return useQuery({
    queryKey: ['admin-stats', period],
    queryFn: async () => {
      const { data } = await api.get(`/admin/stats?period=${period}`);
      return data;
    },
    // Admin stats might change frequently during operations, so we can set a shorter staleTime
    staleTime: 1000 * 60 * 1, // 1 minute
  });
};
