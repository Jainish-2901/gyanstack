import React, { useState, useEffect } from 'react';
// Ab yeh MongoDB API se content fetch karega
import api from '../services/api'; // FIX: ../services/api
import ContentCard from './ContentCard'; // FIX: ./ContentCard (Same folder me)
import LoadingScreen from './LoadingScreen'; // FIX: ./LoadingScreen (Same folder me)

// NOTE: MERN mein content fetch karne ke liye humein CategoryId ko query parameter se bhejna padega
export default function ContentList({ categoryId, searchTerm }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        let url = '/content';
        const params = {};

        // --- FIX: Logic: Agar categoryId 'root' hai, to koi filter na lagayein ---
        if (categoryId && categoryId !== 'root') {
          // Agar koi specific category select ki gayi hai (not 'All Content')
          params.categoryId = categoryId;
        } else if (searchTerm) {
          // Search term hone par category filter hatayein
          params.search = searchTerm;
        }
        // --------------------------------------------------------------------------
        
        // API call to backend
        const { data } = await api.get(url, { params }); 

        setContent(data.content); // Backend se 'content' array aayega
      } catch (error) {
        console.error("Error fetching content:", error);
      }
      setLoading(false);
    };
    fetchContent();
  }, [categoryId, searchTerm]); // Jab bhi filter badlega, yeh dobara chalega

  if (loading) {
    return <LoadingScreen text="Loading content..." />;
  }

  if (content.length === 0) {
    return <p className="text-center text-muted">No content found for this selection.</p>;
  }

  return (
    <div className="row g-4">
      {content.map(item => (
        <div key={item._id} className="col-md-6 col-lg-4">
          <ContentCard item={item} />
        </div>
      ))}
    </div>
  );
}