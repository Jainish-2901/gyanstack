import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch admin's own uploaded content.
 */
export const useMyContent = () => {
  return useQuery({
    queryKey: ['my-content'],
    queryFn: async () => {
      const { data } = await api.get('/content/my-content');
      return data.content || [];
    },
  });
};

/**
 * Hook to fetch all content for global management.
 */
export const useManageAllContent = () => {
  return useQuery({
    queryKey: ['manage-all-content'],
    queryFn: async () => {
      const { data } = await api.get('/content/manage-all');
      return data.content || [];
    },
  });
};

/**
 * Mutation hooks for content management (Creation, Edit, Delete).
 */
export const useAdminContentMutation = () => {
  const queryClient = useQueryClient();

  const uploadContent = useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/content', formData, {
        // Progress handling can still be done via callbacks if needed
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['manage-all-content'] });
    },
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const { data } = await api.put(`/content/${id}`, updatedData);
      return data;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['manage-all-content'] });
      queryClient.invalidateQueries({ queryKey: ['content', id] });
    },
  });

  const deleteContent = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/content/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['manage-all-content'] });
    },
  });

  const bulkDeleteContent = useMutation({
    mutationFn: async (ids) => {
      const { data } = await api.delete('/content/bulk-delete', { data: { ids } });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-content'] });
      queryClient.invalidateQueries({ queryKey: ['manage-all-content'] });
    },
  });

  const reassignContent = useMutation({
    mutationFn: async ({ contentIds, newUploaderId }) => {
      const { data } = await api.post('/content/reassign', { contentIds, newUploaderId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manage-all-content'] });
    },
  });

  return { uploadContent, updateContent, deleteContent, bulkDeleteContent, reassignContent };
};
