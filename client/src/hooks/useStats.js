import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch public statistics (content count, student count, views).
 */
export const useStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data } = await api.get('/auth/stats');
      return data;
    },
  });
};

/**
 * Hook to fetch top contributors/uploaders.
 */
export const useTopUploaders = () => {
  return useQuery({
    queryKey: ['top-uploaders'],
    queryFn: async () => {
      const { data } = await api.get('/auth/top-uploaders');
      return data.uploaders;
    },
  });
};
