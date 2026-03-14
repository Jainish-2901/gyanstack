import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ContentCard from '../../components/ContentCard';
import LoadingScreen from '../../components/LoadingScreen';
import { CardSkeleton } from '../../components/SkeletonLoaders';

export default function UploaderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/auth/uploader/${id}`);
        setProfile(data.user);
        setContents(data.contents);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Uploader profile not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingScreen text="Loading profile..." />;
  if (error) {
    return (
      <div className="container text-center my-5">
        <div className="glass-panel p-5">
            <i className="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
            <h2 className="fw-bold">{error}</h2>
            <Link to="/" className="btn btn-primary mt-4 px-4 py-2 rounded-pill">Explore Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in">
      <div className="row g-4">
        {/* Sidebar: Profile Info */}
        <div className="col-lg-4">
          <div className="glass-panel p-4 h-100 text-center">
            <div className="mb-4">
              <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border border-primary border-3 shadow-md overflow-hidden" style={{ width: '150px', height: '150px' }}>
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.username} className="w-100 h-100 object-fit-cover" />
                ) : (
                  <span className="text-white fw-bold" style={{ fontSize: '4rem' }}>{profile.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
            
            <h2 className="fw-bold mb-4">{profile.username}</h2>

            <div className="text-start mt-4 border-top pt-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center">
                <i className="bi bi-info-circle-fill text-primary me-2"></i> Contact Info
              </h5>
              
              <div className="mb-3 d-flex align-items-center p-3 rounded-3 bg-light bg-opacity-50 transition-all hover-bg-light">
                <i className="bi bi-envelope-fill text-primary me-3 fs-5"></i>
                <div className="overflow-hidden">
                  <small className="text-muted d-block">Email Address</small>
                  <a href={`mailto:${profile.email}`} className="fw-medium text-primary text-decoration-none text-break">
                    {profile.email}
                  </a>
                </div>
              </div>

              <div className="mb-3 d-flex align-items-center p-3 rounded-3 bg-light bg-opacity-50 transition-all hover-bg-light">
                <i className="bi bi-telephone-fill text-primary me-3 fs-5"></i>
                <div>
                  <small className="text-muted d-block">Phone Number</small>
                  <a href={`tel:${profile.phone}`} className="fw-medium text-primary text-decoration-none">
                    {profile.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Uploaded Items */}
        <div className="col-lg-8">
          <div className="d-flex align-items-center justify-content-between mb-4 pb-2 border-bottom border-light">
            <h3 className="fw-bold mb-0">
              <i className="bi bi-cloud-arrow-up-fill text-primary me-2"></i>
              Contributions <span className="text-muted fw-normal ms-2">({contents.length})</span>
            </h3>
          </div>

          <div className="row g-4">
            {contents.length > 0 ? (
              contents.map(item => (
                <div key={item._id} className="col-6 col-md-6 col-lg-4">
                  <ContentCard item={item} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <div className="glass-card p-5">
                  <i className="bi bi-folder-x display-4 text-muted mb-3"></i>
                  <p className="lead text-muted">This user hasn't uploaded any content yet.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
