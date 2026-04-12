import React from 'react';
import { useContentList } from '../hooks/useContent';
import ContentCard from './ContentCard';
import { CardSkeleton } from './SkeletonLoaders';

export default function ContentList({ categoryId, searchTerm, uploaderName, sortBy, order }) {
  // Memoize params to prevent excessive re-renders if necessary, 
  // though React Query handles key changes efficiently.
  const params = {
    limit: 30,
    categoryId: categoryId !== 'root' ? categoryId : undefined,
    search: searchTerm || undefined,
    uploader: uploaderName || undefined,
    sortBy,
    order
  };

  const { data: content = [], isLoading: loading } = useContentList(params);

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