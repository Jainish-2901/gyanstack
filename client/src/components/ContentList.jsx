import React, { useState, useEffect } from 'react';
// Ab yeh MongoDB API se content fetch karega
import api from '../services/api'; // FIX: ../services/api
import ContentCard from './ContentCard'; // FIX: ./ContentCard (Same folder me)
import { CardSkeleton } from './SkeletonLoaders';

// NOTE: MERN mein content fetch karne ke liye humein CategoryId ko query parameter se bhejna padega
export default function ContentList({ categoryId, searchTerm, uploaderName }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchContent = async () => {
      setLoading(true);
      try {
        let url = '/content';
        const params = {
          limit: 30, // PERF: Limit initial fetch; prevents rendering 100+ cards at once
        };

        // --- FIX: Logic: Agar categoryId 'root' hai, to koi filter na lagayein ---
        if (categoryId && categoryId !== 'root') {
          params.categoryId = categoryId;
        }
        
        if (searchTerm) {
          params.search = searchTerm;
        }

        if (uploaderName) {
          params.uploader = uploaderName;
        }
        // --------------------------------------------------------------------------
        
        // API call to backend
        const { data } = await api.get(url, { params }); 

        if (active) {
          setContent(data.content); // Backend se 'content' array aayega
        }
      } catch (error) {
        if (active) {
          console.error("Error fetching content:", error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchContent();
    return () => { active = false; };
  }, [categoryId, searchTerm, uploaderName]); // Jab bhi filter badlega, yeh dobara chalega

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