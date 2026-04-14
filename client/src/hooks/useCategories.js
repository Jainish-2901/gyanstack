import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useNestedCategories = () => {
  return useQuery({
    queryKey: ['nested-categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories/all-nested');
      return data.categories || [];
    },
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 90,
  });
};
