import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useCategoryContent = (categoryId, enabled = false) => {
  return useQuery({
    queryKey: ['category-content', categoryId],
    queryFn: async () => {
      const { data } = await api.get(`/content?categoryId=${categoryId}&limit=8`);
      return data.content || [];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

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
      return data; 
    },
    staleTime: 1000 * 60 * 5,
  });
};

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

export const useContentMutation = (currentUserId) => {
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.put(`/content/${id}/like`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.setQueryData(['content', id], (old) => {
        if (!old) return old;
        const prevLikedBy = old.likedBy || [];
        let updatedLikedBy;
        if (data.isLiked) {
          updatedLikedBy = currentUserId && !prevLikedBy.includes(currentUserId)
            ? [...prevLikedBy, currentUserId]
            : prevLikedBy;
        } else {
          updatedLikedBy = prevLikedBy.filter(uid => {
            const uidStr = uid?._id ? uid._id.toString() : uid?.toString();
            return uidStr !== currentUserId;
          });
        }
        return { ...old, likesCount: data.likesCount, likedBy: updatedLikedBy };
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
        const prevSavedBy = old.savedBy || [];
        let updatedSavedBy;
        if (data.isSaved) {
          updatedSavedBy = currentUserId && !prevSavedBy.includes(currentUserId)
            ? [...prevSavedBy, currentUserId]
            : prevSavedBy;
        } else {
          updatedSavedBy = prevSavedBy.filter(uid => {
            const uidStr = uid?._id ? uid._id.toString() : uid?.toString();
            return uidStr !== currentUserId;
          });
        }
        return { ...old, savesCount: data.savesCount, savedBy: updatedSavedBy };
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
