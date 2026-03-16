import React, { useState, useEffect } from 'react';
import api from '../../services/api'; 
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';
// -------------------

const AnnouncementCardMobile = ({ ann, handleAnnouncementStatus, handleEditClick, handleAnnouncementDelete }) => {
    const statusColor = ann.status === 'approved' ? 'success' : ann.status === 'rejected' ? 'danger' : 'warning text-dark';
    
    return (
        <div className="card mb-3 border-0 rounded-lg">
            <div className="card-body">
                <div className="data-item fw-bold text-dark mb-1" data-label="Title">{ann.title}</div>
                <div className="data-item small mb-2" data-label="Requested By">{ann.requestedBy?.username || 'System'}</div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="data-item" data-label="Status">
                      <span className={`badge bg-${statusColor}`}>{ann.status}</span>
                  </div>
                  <div className="d-flex gap-2">
                    <span className="badge bg-light text-primary border sm">
                      <i className="bi bi-send-check me-1"></i> {ann.sentCount || 0}
                    </span>
                    <span className="badge bg-light text-success border sm">
                      <i className="bi bi-eye-fill me-1"></i> {ann.openCount || 0}
                    </span>
                  </div>
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
  
  // Quick Announcement States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);
  
  // --- NAYA: FCM Pulse State ---
  const [pulse, setPulse] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/announcements/all');
      setAnnouncements(data.announcements);
      
      // Fetch Pulse data
      const pulseRes = await api.get('/stats/fcm-pulse');
      setPulse(pulseRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to load management data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setError('');
    setSuccess('');
    try {
      // SuperAdmin request is auto-approved by backend logic
      await api.post('/announcements/request', { title: annTitle, content: annContent });
      setSuccess('Announcement published successfully to all students!');
      setAnnTitle('');
      setAnnContent('');
      fetchAnnouncements(); // List refresh karein
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement.');
    }
    setAnnLoading(false);
  };

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
    <div className="container-fluid fade-in px-0 overflow-x-hidden">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold text-danger mb-0">Manage All Announcements</h4>
        <button className="btn btn-sm btn-outline-primary" onClick={fetchAnnouncements}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger" onClick={() => setError('')}>{error}</div>}
      {success && <div className="alert alert-success" onClick={() => setSuccess('')}>{success}</div>}

      {/* --- NAYA: FIREBASE GLOBAL PULSE CARD --- */}
      {pulse && (
        <div className="row g-3 mb-4">
            <div className="col-md-4">
                <div className="card border-0 rounded-4 shadow-sm bg-dark text-white p-3">
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="small text-secondary mb-1">External Engagement</p>
                            <h3 className="fw-bold mb-0">{pulse.firebaseConsole.opened} <span className="fs-6 fw-normal text-secondary">Clicks</span></h3>
                        </div>
                        <div className="bg-primary bg-opacity-25 rounded-3 p-2 h-100">
                             <i className="bi bi-google fs-4 text-primary"></i>
                        </div>
                    </div>
                    <div className="mt-2 small text-secondary">
                        <i className="bi bi-activity me-1 text-success"></i> Console Pulse Active
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card border-0 rounded-4 shadow-sm p-3">
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="small text-muted mb-1">Platform Engagement</p>
                            <h3 className="fw-bold mb-0 text-dark">{pulse.platform.opened} <span className="fs-6 fw-normal text-muted">Clicks</span></h3>
                        </div>
                        <div className="bg-info bg-opacity-10 rounded-3 p-2 h-100">
                             <i className="bi bi-intersect fs-4 text-info"></i>
                        </div>
                    </div>
                    <div className="mt-2 small text-muted">
                        Total Sent: <span className="fw-bold">{pulse.platform.sent}</span>
                    </div>
                </div>
            </div>
            <div className="col-md-4">
                <div className="card border-0 rounded-4 shadow-sm bg-primary text-white p-3">
                    <div className="d-flex justify-content-between">
                        <div>
                            <p className="small text-white text-opacity-75 mb-1">Grand Engagement</p>
                            <h3 className="fw-bold mb-0">{pulse.grandTotal.engagement} <span className="fs-6 fw-normal text-white text-opacity-50">Combined</span></h3>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-3 p-2 h-100">
                             <i className="bi bi-lightning-charge-fill fs-4 text-white"></i>
                        </div>
                    </div>
                    <div className="mt-2 small text-white text-opacity-75">
                         Last interaction: {new Date(pulse.firebaseConsole.lastActivity).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- QUICK ANNOUNCEMENT SECTION (SHIFTED HERE) --- */}
      <div className="card border-0 rounded-4 mb-5 bg-primary bg-opacity-10">
        <div className="card-body p-4 p-md-4 text-center">
            <div className="mx-auto bg-white rounded-circle mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-megaphone-fill fs-3 text-primary"></i>
            </div>
            <h4 className="fw-bold text-dark mb-2">Quick Announcement</h4>
            <p className="text-muted small mb-4 mx-auto" style={{maxWidth: '500px'}}>
                Directly share updates, news, or alerts with all GyanStack users instantly.
            </p>
            
            <form onSubmit={handleAnnouncementSubmit} className="text-start bg-white p-4 rounded-4">
                <div className="row g-3">
                    <div className="col-md-5">
                        <div className="form-floating">
                            <input type="text" className="form-control" id="quickAnnTitle" placeholder="Title" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                            <label htmlFor="quickAnnTitle">Title</label>
                        </div>
                    </div>
                    <div className="col-md-7">
                       <div className="form-floating">
                            <textarea className="form-control" id="quickAnnContent" placeholder="Content..." style={{ height: '58px' }} value={annContent} onChange={(e) => setAnnContent(e.target.value)} required></textarea>
                            <label htmlFor="quickAnnContent">Short Message Content...</label>
                        </div>
                    </div>
                    <div className="col-12 mt-3">
                        <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-pill" disabled={annLoading}>
                            {annLoading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Publishing...</>
                            ) : (
                                <><i className="bi bi-send-fill me-2"></i>Publish New Announcement Now</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3 px-2">
        <h6 className="fw-bold text-secondary mb-0">Management History</h6>
      </div>
      <div className="card border-0 rounded-lg">
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
                      <th>Reach (Sent/Open)</th>
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
                          <div className="d-flex align-items-center gap-2">
                            <span className="badge bg-light text-primary border" title="Delivered to devices">
                              <i className="bi bi-send-check me-1"></i> {ann.sentCount || 0}
                            </span>
                            <span className="badge bg-light text-success border" title="Opened by students">
                              <i className="bi bi-eye-fill me-1"></i> {ann.openCount || 0}
                            </span>
                          </div>
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
    </div>
  );
}
