import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch uploader profile and their content.
 */
export const useUploaderProfile = (id) => {
  return useQuery({
    queryKey: ['uploader-profile', id],
    queryFn: async () => {
      const { data } = await api.get(`/auth/uploader/${id}`);
      return data;
    },
    enabled: !!id,
  });
};
