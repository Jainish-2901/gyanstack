import React from 'react';
import { useContentList } from '../hooks/useContent';
import ContentCard from './ContentCard';
import { CardSkeleton } from './SkeletonLoaders';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../utils/animations';

export default function ContentList({ categoryId, searchTerm, uploaderName, sortBy, order }) {
  const [skip, setSkip] = React.useState(0);
  const [allContent, setAllContent] = React.useState([]);
  const limit = 20;

  const params = React.useMemo(() => ({
    limit,
    skip,
    categoryId: (categoryId && categoryId !== 'root') ? categoryId.trim() : undefined,
    search: searchTerm || undefined,
    uploader: uploaderName || undefined,
    sortBy,
    order
  }), [categoryId, searchTerm, uploaderName, sortBy, order, skip]);
  
  const { data, isLoading, error } = useContentList(params);

  React.useEffect(() => {
    setSkip(0);
    setAllContent([]);
  }, [categoryId, searchTerm, uploaderName, sortBy, order]);

  React.useEffect(() => {
    if (data?.content) {
      if (skip === 0) {
        setAllContent(data.content);
      } else {
        setAllContent(prev => {
          const newIds = new Set(data.content.map(i => i._id));
          const filteredPrev = prev.filter(i => !newIds.has(i._id));
          return [...filteredPrev, ...data.content];
        });
      }
    }
  }, [data, skip]);
  
  if (error) {
    return (
      <div className="alert alert-danger rounded-4 py-4 text-center">
        <i className="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
        <strong>Error reaching server:</strong> {error.response?.data?.message || 'Please check your connection.'}
      </div>
    );
  }
  
  if (isLoading && allContent.length === 0) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="col-6 col-md-6 col-lg-4">
            <CardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (allContent.length === 0 && !isLoading) {
    return (
      <div className="text-center py-5 glass-panel rounded-5">
        <i className="bi bi-inbox display-1 text-muted opacity-25 d-block mb-3"></i>
        <h5 className="text-muted">No content found for this selection.</h5>
      </div>
    );
  }

  const handleLoadMore = () => {
    setSkip(prev => prev + limit);
  };

  return (
    <div className="pb-5">
      <motion.div 
        className="row g-3 g-md-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {allContent.map(item => (
          <motion.div key={item._id} className="col-6 col-md-6 col-lg-4" variants={fadeInUp}>
            <ContentCard item={item} />
          </motion.div>
        ))}
      </motion.div>

      {data?.hasMore && (
        <div className="text-center mt-5">
          <button 
            className="btn btn-primary rounded-pill px-5 py-2 shadow-sm"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-plus-circle me-2"></i>
            )}
            Load More Resource
          </button>
          <div className="mt-2 text-muted small">
            Showing {allContent.length} of {data.total} items
          </div>
        </div>
      )}
    </div>
  );
}