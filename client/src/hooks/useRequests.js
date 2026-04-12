import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch current user's content requests.
 */
export const useMyRequests = () => {
  return useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const { data } = await api.get('/requests/my-requests');
      return data.requests || [];
    },
    // Requests don't change often, we can set a staleTime
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
