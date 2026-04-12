import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch all nested categories for the home tree.
 */
export const useNestedCategories = () => {
  return useQuery({
    queryKey: ['nested-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/all-nested');
      return data.categories || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour stale time for client categories
    gcTime: 1000 * 60 * 90,    // 1.5 hours garbage collection
  });
};
