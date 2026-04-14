import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useMyRequests = () => {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests/my-requests');
      return data.requests || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
