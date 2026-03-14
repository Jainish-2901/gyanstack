import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';
// -------------------

const AnnouncementCardMobile = ({ ann, handleAnnouncementStatus, handleEditClick, handleAnnouncementDelete }) => {
    const statusColor = ann.status === 'approved' ? 'success' : ann.status === 'rejected' ? 'danger' : 'warning text-dark';
    
    return (
        <div className="card shadow-sm mb-3 border-0 rounded-lg">
            <div className="card-body">
                <div className="data-item fw-bold text-dark mb-1" data-label="Title">{ann.title}</div>
                <div className="data-item small mb-2" data-label="Requested By">{ann.requestedBy?.username || 'System'}</div>
                <div className="data-item mb-3" data-label="Status">
                    <span className={`badge bg-${statusColor}`}>{ann.status}</span>
                </div>
                <div className="card-actions">
                    <div className="scroll-selection">
                        <button className="btn btn-sm btn-success" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}>Approve</button>
                        <button className="btn btn-sm btn-warning" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}>Reject</button>
                        <button className="btn btn-sm btn-info" onClick={() => handleEditClick(ann)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleAnnouncementDelete(ann._id)}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements/all');
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      setError('Failed to load announcements.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAnnouncementStatus = async (id, newStatus) => {
    try {
      await api.put(`/announcements/${id}/status`, { status: newStatus });
      fetchAnnouncements();
      setSuccess(`Announcement ${newStatus} successfully.`);
    } catch (err) {
      setError("Failed to update announcement status.");
    }
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements(); 
      setSuccess("Announcement deleted successfully.");
    } catch (err) {
      setError("Failed to delete announcement.");
    }
  };

  const handleEditClick = (announcement) => {
    setCurrentAnn(announcement);
    setIsEditingAnn(true);
  };
  
  const handleUpdateAnn = (updatedItem) => {
    setAnnouncements(announcements.map(ann => 
      ann._id === updatedItem._id ? updatedItem : ann
    ));
    setSuccess("Announcement updated successfully.");
  };

  if (loading) return <LoadingScreen text="Loading Announcements..." />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-danger mb-0">Manage All Announcements</h3>
        <button className="btn btn-sm btn-outline-primary" onClick={fetchAnnouncements}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      <div className="card shadow-lg border-0 rounded-lg">
        <div className="card-body p-0 responsive-card-view">
          {announcements.length === 0 ? (
            <p className='text-muted p-4 text-center'>No announcements found.</p>
          ) : (
            <>
              <div className="table-responsive d-none d-lg-block">
                <table className="table table-striped table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Requested By</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {announcements.map(ann => (
                      <tr key={ann._id}>
                        <td className="fw-bold">{ann.title}</td>
                        <td>{ann.requestedBy?.username || 'System'}</td>
                        <td>
                          <span className={`badge ${
                            ann.status === 'approved' ? 'bg-success' :
                            ann.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                          }`}>
                            {ann.status}
                          </span>
                        </td>
                        <td>
                          <div className="scroll-selection">
                            <button className="btn btn-sm btn-success" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}>Approve</button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}>Reject</button>
                            <button className="btn btn-sm btn-info" onClick={() => handleEditClick(ann)}>Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleAnnouncementDelete(ann._id)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="d-lg-none p-3">
                {announcements.map(ann => (
                    <AnnouncementCardMobile 
                        key={ann._id} 
                        ann={ann} 
                        handleAnnouncementStatus={handleAnnouncementStatus}
                        handleEditClick={handleEditClick}
                        handleAnnouncementDelete={handleAnnouncementDelete}
                    />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {isEditingAnn && currentAnn && (
        <EditAnnouncementModal
          item={currentAnn}
          onClose={() => setIsEditingAnn(false)}
          onUpdate={handleUpdateAnn}
        />
      )}
    </>
  );
}
