import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to fetch categorical tree (flat list for internal management).
 */
export const useAdminCategories = (parentId = 'root') => {
  return useQuery({
    queryKey: ['admin-categories', parentId],
    queryFn: async () => {
      const { data } = await api.get(`/categories?parentId=${parentId}`);
      return data.categories.sort((a, b) => a.order - b.order);
    },
    staleTime: 1000 * 60 * 10, 
    gcTime: 1000 * 60 * 15,    
  });
};

export const useAllCategoriesFlat = () => {
  return useQuery({
    queryKey: ['admin-categories-flat'],
    queryFn: async () => {
      const { data } = await api.get('/categories/all-nested');
      const flattened = [];
      const flatten = (cats) => {
        cats.forEach(c => {
          flattened.push({ _id: c._id, name: c.name, parentId: c.parentId });
          if (c.children) flatten(c.children);
        });
      };
      flatten(data.categories || data);
      return flattened;
    },
    staleTime: 1000 * 60 * 30, 
  });
};

export const useCategoryMutation = () => {
  const queryClient = useQueryClient();

  const createCategory = useMutation({
    mutationFn: async ({ name, parentId, order }) => {
      const { data } = await api.post('/categories', { name, parentId, order });
      return data;
    },
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', parentId] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-flat'] });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, parentId }) => {
      const { data } = await api.put(`/categories/${id}`, { name, parentId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] }); 
      queryClient.invalidateQueries({ queryKey: ['admin-categories-flat'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories-flat'] });
    },
  });

  const reorderCategories = useMutation({
    mutationFn: async ({ orderedCategories, parentId }) => {
      const { data } = await api.patch('/categories/reorder', { orderedCategories });
      return data;
    },
    onSuccess: (_, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories', parentId] });
    },
  });

  return { createCategory, updateCategory, deleteCategory, reorderCategories };
};


export const useCategoryMap = () => {
  return useQuery({
    queryKey: ['category-map'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/categories/all-nested');
        const map = { 'root': 'Root / General' }; 
        
        const buildMap = (categories) => {
          if (!categories || !Array.isArray(categories)) return;
          categories.forEach(cat => {
            if (cat && cat._id) {
              map[cat._id] = cat.name;
              if (cat.children) buildMap(cat.children);
            }
          });
        };
        
        const categoriesData = data.categories || data;
        buildMap(categoriesData);
        
        return map;
      } catch (err) {
        console.error("Failed to build category map:", err);
        return { 'root': 'Root / General' };
      }
    },
    staleTime: 1000 * 60 * 30, 
  });
};
