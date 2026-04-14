import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
import ContentCard from '../../components/ContentCard';

export default function SavedContent() {
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSavedContent = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/content/saved');
        setSavedContent(data.content);
        
      } catch (error) {
        console.error("Error fetching saved content:", error);
      }
      setLoading(false);
    };

    fetchSavedContent();
  }, [user]);
  
  const handleGoBack = () => {
    navigate(-1); 
  };


  if (loading) {
    return <LoadingScreen text="Loading your saved content..." />;
  }

  return (
    <div className="container-fluid fade-in">
      
      <button onClick={handleGoBack} className="btn btn-outline-secondary mb-3 btn-sm rounded-pill px-3">
        <i className="bi bi-arrow-left me-2"></i>
        Go Back
      </button>
      
      <h3 className="fw-bold mb-4 text-primary">My Saved Content</h3>
      
      <div className="row g-4">
        {savedContent.length > 0 ? (
          savedContent.map(item => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <ContentCard item={item} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info border-0 shadow-sm rounded-4">
              <i className="bi bi-info-circle-fill me-2"></i>
              <p className="lead d-inline">You haven't saved any content yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
