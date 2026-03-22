import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';

// --- MOBILE CARD: Designer Style with Glassmorphic details ---
const AnnouncementCardMobile = ({ ann, handleAnnouncementStatus, handleEditClick, handleAnnouncementDelete }) => {
  const statusColor = ann.status === 'approved' ? 'success' : ann.status === 'rejected' ? 'danger' : 'warning text-dark';
  const ctr = ann.sentCount > 0 ? ((ann.openCount / ann.sentCount) * 100).toFixed(1) : 0;

  return (
    <div className="card mb-3 border-0 rounded-4 shadow-sm overflow-hidden border-start border-4" style={{ borderColor: `var(--bs-${ann.status === 'approved' ? 'success' : 'primary'}) !important` }}>
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted extra-small fw-bold text-uppercase tracking-wider">
            <i className="bi bi-clock me-1"></i> {new Date(ann.createdAt).toLocaleDateString()}
          </span>
          <span className={`badge rounded-pill bg-${statusColor} bg-opacity-10 text-${statusColor === 'warning text-dark' ? 'warning' : statusColor} border border-${statusColor} border-opacity-25 px-3`}>
            {ann.status}
          </span>
        </div>

        <h6 className="fw-bold text-dark mb-1">{ann.title}</h6>
        <p className="text-muted small mb-3 text-truncate-2">{ann.content}</p>

        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="bg-light rounded-3 p-2 text-center border">
              <small className="d-block text-muted x-small">SENT</small>
              <span className="fw-bold text-primary small">{ann.sentCount || 0}</span>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light rounded-3 p-2 text-center border">
              <small className="d-block text-muted x-small">OPEN</small>
              <span className="fw-bold text-success small">{ann.openCount || 0}</span>
            </div>
          </div>
          <div className="col-4">
            <div className="bg-light rounded-3 p-2 text-center border">
              <small className="d-block text-muted x-small">CTR</small>
              <span className="fw-bold text-dark small">{ctr}%</span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 mb-2">
          <button className={`btn btn-sm flex-grow-1 fw-bold ${ann.status === 'approved' ? 'btn-light disabled' : 'btn-success shadow-sm'}`}
            onClick={() => handleAnnouncementStatus(ann._id, 'approved')}>
            <i className="bi bi-send-fill me-1"></i> Approve
          </button>
          <button className={`btn btn-sm flex-grow-1 fw-bold ${ann.status === 'rejected' ? 'btn-light disabled' : 'btn-outline-danger'}`}
            onClick={() => handleAnnouncementStatus(ann._id, 'rejected')}>
            <i className="bi bi-x-circle me-1"></i> Reject
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
          <small className="text-muted">By: <strong>{ann.requestedBy?.username || 'Admin'}</strong></small>
          <div className="d-flex gap-2">
            <button className="btn btn-icon-sm btn-outline-info" onClick={() => handleEditClick(ann)}><i className="bi bi-pencil"></i></button>
            <button className="btn btn-icon-sm btn-outline-danger" onClick={() => handleAnnouncementDelete(ann._id)}><i className="bi bi-trash3"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('all'); // NEW: Filter logic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);

  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);
  const [pulse, setPulse] = useState(null);

  const fetchAnnouncements = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [annRes, pulseRes] = await Promise.all([
        api.get('/announcements/all'),
        api.get('/stats/fcm-pulse')
      ]);
      setAnnouncements(annRes.data.announcements);
      setPulse(pulseRes.data);
    } catch (err) {
      setError('Failed to sync management data.');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(true);
  }, []);

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setError(''); setSuccess('');
    try {
      await api.post('/announcements/request', { title: annTitle, content: annContent });
      setSuccess('Blast broadcasted successfully!');
      setAnnTitle(''); setAnnContent('');
      fetchAnnouncements(false);
    } catch (err) {
      setError('Failed to push notification.');
    }
    setAnnLoading(false);
  };

  const handleAnnouncementStatus = async (id, newStatus) => {
    try {
      await api.put(`/announcements/${id}/status`, { status: newStatus });
      setAnnouncements(prev => prev.map(ann => ann._id === id ? { ...ann, status: newStatus } : ann));
      setSuccess(`Status flipped to ${newStatus}.`);
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('This action cannot be undone. Delete?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(ann => ann._id !== id));
      setSuccess("Announcement wiped.");
    } catch (err) {
      setError("Delete failed.");
    }
  };

  const handleEditClick = (announcement) => {
    setCurrentAnn(announcement);
    setIsEditingAnn(true);
  };

  const handleUpdateAnn = (updatedItem) => {
    setAnnouncements(prev => prev.map(ann => ann._id === updatedItem._id ? updatedItem : ann));
    setSuccess("Updated successfully.");
  };

  // Filtered Logic
  const filteredAnnouncements = announcements.filter(ann => filter === 'all' || ann.status === filter);

  if (loading) return <LoadingScreen text="Calibrating Announcement Hub..." />;

  return (
    <div className="container-fluid fade-in px-0 overflow-x-hidden pb-5">

      {/* HEADER SECTION */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 px-3 gap-3">
        <div>
          <h4 className="fw-bold text-dark mb-0">Broadcast Management</h4>
          <p className="text-muted extra-small mb-0">Control communication & track student engagement</p>
        </div>
        <button className="btn btn-sm btn-white border rounded-pill px-4 shadow-sm fw-bold text-primary" onClick={() => fetchAnnouncements(false)}>
          <i className="bi bi-arrow-repeat me-2"></i> Sync Stats
        </button>
      </div>

      {error && <div className="alert alert-danger mx-3 border-0 shadow-sm rounded-3 mb-4">{error}</div>}
      {success && <div className="alert alert-success mx-3 border-0 shadow-sm rounded-3 mb-4">{success}</div>}

      {/* --- PULSE ANALYTICS CARDS --- */}
      {pulse && (
        <div className="row g-3 mb-5 px-3">
          <div className="col-md-4">
            <div className="card border-0 rounded-4 shadow-sm bg-gradient-dark p-3 h-100 position-relative overflow-hidden">
              <div className="pulse-dot"></div>
              <p className="small text-white text-opacity-50 mb-1">External FCM Reach</p>
              <h2 className="fw-bold text-white mb-0">{pulse.firebaseConsole.opened} <span className="fs-6 fw-normal opacity-50">Clicks</span></h2>
              <div className="mt-3 text-white text-opacity-50 extra-small d-flex justify-content-between">
                <span>Total Sent: {pulse.firebaseConsole.sent}</span>
                <span>{((pulse.firebaseConsole.opened / pulse.firebaseConsole.sent) * 100 || 0).toFixed(1)}% CTR</span>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 rounded-4 shadow-sm p-3 h-100 bg-white border">
              <p className="small text-muted mb-1">Platform Engagement</p>
              <h2 className="fw-bold text-primary mb-0">{pulse.platform.opened} <span className="fs-6 fw-normal text-muted">Clicks</span></h2>
              <div className="mt-3 text-muted extra-small">Internal user interactions via Notification Bell</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 rounded-4 shadow-sm bg-primary text-white p-3 h-100">
              <p className="small text-white text-opacity-75 mb-1">Global Impact</p>
              <h2 className="fw-bold mb-0">{pulse.grandTotal.engagement} <span className="fs-6 fw-normal opacity-50">Total</span></h2>
              <div className="mt-3 text-white text-opacity-75 extra-small">
                <i className="bi bi-activity me-1"></i> Combined reach across all channels
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK BROADCAST COMMAND --- */}
      <div className="mx-3 mb-5">
        <div className="card border-0 rounded-4 shadow-sm overflow-hidden" style={{ background: '#f8f9ff' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="bg-primary bg-opacity-10 p-2 rounded-3">
                <i className="bi bi-megaphone-fill text-primary fs-4"></i>
              </div>
              <h5 className="fw-bold mb-0 text-dark">Instant Broadcast</h5>
            </div>
            <form onSubmit={handleAnnouncementSubmit} className="row g-3">
              <div className="col-lg-4">
                <label className="form-label extra-small fw-bold text-muted text-uppercase">Notification Title</label>
                <input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="e.g., Exam Schedule Updated" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
              </div>
              <div className="col-lg-6">
                <label className="form-label extra-small fw-bold text-muted text-uppercase">Push Message</label>
                <input type="text" className="form-control form-control-lg border-0 shadow-sm" placeholder="Type the main message for students..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} required />
              </div>
              <div className="col-lg-2 d-flex align-items-end">
                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm" disabled={annLoading}>
                  {annLoading ? 'PUSHING...' : 'BLAST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- HISTORY & MODERATION --- */}
      <div className="mx-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0"><i className="bi bi-journal-text me-2"></i>History & Status</h6>
          <div className="btn-group btn-group-sm rounded-pill shadow-sm overflow-hidden border">
            {['all', 'approved', 'pending', 'rejected'].map(s => (
              <button key={s} className={`btn btn-sm px-3 text-capitalize ${filter === s ? 'btn-primary' : 'btn-white'}`} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="card border-0 rounded-4 shadow-sm overflow-hidden bg-white">
          <div className="table-responsive d-none d-lg-block">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light bg-opacity-50">
                <tr className="extra-small text-uppercase text-muted">
                  <th className="ps-4 py-3">Announcement</th>
                  <th>Status</th>
                  <th>Engagement</th>
                  <th>Engagement Rate</th>
                  <th className="pe-4 text-end">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map(ann => (
                  <tr key={ann._id}>
                    <td className="ps-4 py-3">
                      <div className="fw-bold text-dark">{ann.title}</div>
                      <small className="text-muted d-flex align-items-center gap-2">
                        <i className="bi bi-person"></i> {ann.requestedBy?.username || 'Admin'}
                        <span className="opacity-25">|</span>
                        <i className="bi bi-calendar-event"></i> {new Date(ann.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <span className={`badge rounded-pill bg-${ann.status === 'approved' ? 'success' : 'warning'} bg-opacity-10 text-${ann.status === 'approved' ? 'success' : 'warning'} border border-${ann.status === 'approved' ? 'success' : 'warning'} border-opacity-25 px-3`}>
                        {ann.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div><i className="bi bi-send text-primary me-1"></i><strong>{ann.sentCount || 0}</strong></div>
                        <div><i className="bi bi-eye text-success me-1"></i><strong>{ann.openCount || 0}</strong></div>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">
                      {ann.sentCount > 0 ? ((ann.openCount / ann.sentCount) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="pe-4 text-end">
                      <div className="btn-group btn-group-sm rounded-3 shadow-sm border overflow-hidden">
                        <button className="btn btn-white" title="Approve" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}><i className="bi bi-check-lg text-success"></i></button>
                        <button className="btn btn-white" title="Reject" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}><i className="bi bi-x-lg text-danger"></i></button>
                        <button className="btn btn-white" title="Edit" onClick={() => handleEditClick(ann)}><i className="bi bi-pencil text-info"></i></button>
                        <button className="btn btn-white" title="Delete" onClick={() => handleAnnouncementDelete(ann._id)}><i className="bi bi-trash text-danger"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-lg-none p-2 bg-light bg-opacity-25">
            {filteredAnnouncements.map(ann => (
              <AnnouncementCardMobile key={ann._id} ann={ann} handleAnnouncementStatus={handleAnnouncementStatus} handleEditClick={handleEditClick} handleAnnouncementDelete={handleAnnouncementDelete} />
            ))}
          </div>
        </div>
      </div>

      {isEditingAnn && currentAnn && (
        <EditAnnouncementModal
          item={currentAnn}
          onClose={() => setIsEditingAnn(false)}
          onUpdate={handleUpdateAnn}
        />
      )}

      <style>{`
        .bg-gradient-dark { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
        .extra-small { font-size: 0.72rem; }
        .x-small { font-size: 0.65rem; }
        .tracking-wider { letter-spacing: 1px; }
        .btn-icon-sm { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; }
        .pulse-dot { position: absolute; top: 15px; right: 15px; width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </div>
  );
}