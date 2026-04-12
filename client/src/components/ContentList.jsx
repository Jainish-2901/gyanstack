import React from 'react';
import { useContentList } from '../hooks/useContent';
import ContentCard from './ContentCard';
import { CardSkeleton } from './SkeletonLoaders';

export default function ContentList({ categoryId, searchTerm, uploaderName, sortBy, order }) {
  // Memoize params to prevent excessive re-renders if necessary, 
  // though React Query handles key changes efficiently.
  const params = {
    limit: 30,
    categoryId: (categoryId && categoryId !== 'root') ? categoryId.trim() : undefined,
    search: searchTerm || undefined,
    uploader: uploaderName || undefined,
    sortBy,
    order
  };
  
  const { data: content = [], isLoading: loading, error } = useContentList(params);
  
  if (error) {
    return (
      <div className="alert alert-danger rounded-4 py-4 text-center">
        <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <strong>Error reaching server:</strong> {error.response?.data?.message || 'Please check your connection.'}
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="col-md-6 col-lg-4">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return <p className="text-center text-muted">No content found for this selection.</p>;
  }

  return (
    <div className="row g-3 g-md-4">
      {content.map(item => (
        <div key={item._id} className="col-6 col-md-6 col-lg-4">
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
}