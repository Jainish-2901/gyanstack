import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch content for a specific category (limited for preview).
 */
export const useCategoryContent = (categoryId, enabled = false) => {
  return useQuery({
    queryKey: ['category-content', categoryId],
    queryFn: async () => {
      const { data } = await api.get(`/content?categoryId=${categoryId}&limit=8`);
      return data.content || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes cache for previews
  });
};

/**
 * Hook to fetch a list of content based on filters.
 */
export const useContentList = (params) => {
  return useQuery({
    queryKey: ['content-list', params],
    queryFn: async () => {
      const { data } = await api.get('/content', { 
        params: { 
          ...params, 
          limit: params.limit || 20,
          skip: params.skip || 0
        } 
      });
      return data; // Return whole object including hasMore/total
    },
    staleTime: 1000 * 60 * 5, // 5 minutes fresh for search results
  });
};

/**
 * Hook to fetch single content detail.
 */
export const useContentDetail = (id) => {
  return useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      const { data } = await api.get(`/content/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

/**
 * Hook to fetch related content.
 */
export const useRelatedContent = (categoryId, excludeId) => {
  return useQuery({
    queryKey: ['related-content', categoryId, excludeId],
    queryFn: async () => {
      const { data } = await api.get(`/content?categoryId=${categoryId}&limit=5`);
      return (data.content || []).filter(i => i._id !== excludeId).slice(0, 4);
    },
    enabled: !!categoryId,
  });
};

/**
 * Mutation hooks for content actions.
 */
export const useContentMutation = () => {
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/content/${id}/like`);
      return data;
    },
    onSuccess: (data, id) => {
      // Update the specific content in cache
      queryClient.setQueryData(['content', id], (old) => {
        if (!old) return old;
        return { ...old, likesCount: data.likesCount, likedBy: data.likedBy || old.likedBy };
      });
    },
  });

  const toggleSave = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/content/${id}/save`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['content', id], (old) => {
        if (!old) return old;
        return { ...old, savesCount: data.savesCount, savedBy: data.savedBy || old.savedBy };
      });
    },
  });

  const incrementDownload = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/content/${id}/download`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['content', id], (old) => {
        if (!old) return old;
        return { ...old, downloadsCount: data.downloadsCount };
      });
    },
  });

  return { toggleLike, toggleSave, incrementDownload };
};
