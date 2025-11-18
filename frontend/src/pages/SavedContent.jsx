import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Paths को 'src' root मानकर absolute किया गया है
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; 
import LoadingScreen from '../components/LoadingScreen';
import ContentCard from '../components/ContentCard';

export default function SavedContent() {
  const { user } = useAuth();
  const [savedContent, setSavedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <-- Hook initialize kiya

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
  
  // Back button function
  const handleGoBack = () => {
    navigate(-1); // History mein ek step peeche jaao
  };


  if (loading) {
    return <LoadingScreen text="Loading your saved content..." />;
  }

  return (
    <div className="container fade-in">
      
      {/* --- BACK BUTTON --- */}
      <button onClick={handleGoBack} className="btn btn-outline-secondary mb-3">
        <i className="bi bi-arrow-left me-2"></i>
        Go Back
      </button>
      {/* ------------------- */}
      
      <h1 className="display-5 fw-bold mb-4">My Saved Content</h1>
      
      <div className="row g-4">
        {savedContent.length > 0 ? (
          savedContent.map(item => (
            <div key={item._id} className="col-md-6 col-lg-4">
              <ContentCard item={item} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              <p className="lead d-inline">You haven't saved any content yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}