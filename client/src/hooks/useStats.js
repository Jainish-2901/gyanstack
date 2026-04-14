import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useStats = () => {
  return useQuery({
    queryKey: ['public-stats'],
    queryFn: async () => {
      const { data } = await api.get('/auth/stats');
      return data;
    },
  });
};

export const useTopUploaders = () => {
  return useQuery({
    queryKey: ['top-uploaders'],
    queryFn: async () => {
      const { data } = await api.get('/auth/top-uploaders');
      return data.uploaders;
    },
  });
};
