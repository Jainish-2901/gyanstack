import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';

const AnnouncementCardMobile = ({ ann, handleAnnouncementStatus, handleEditClick, handleAnnouncementDelete }) => {
  const statusColor = ann.status === 'approved' ? 'success' : ann.status === 'rejected' ? 'danger' : 'warning text-dark';
  const ctr = ann.sentCount > 0 ? ((ann.openCount / ann.sentCount) * 100).toFixed(1) : 0;

  return (
    <div className="card mb-3 border-0 rounded-4 shadow-sm overflow-hidden border-start border-4" style={{ borderColor: `var(--bs-${ann.status === 'approved' ? 'success' : 'primary'}) !important` }}>
      <div className="card-body p-3 text-start">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="text-muted extra-small fw-bold text-uppercase tracking-wider">
            <i className="bi bi-clock me-1"></i> {new Date(ann.createdAt).toLocaleDateString()}
          </span>
          <span className={`badge rounded-pill bg-${statusColor} bg-opacity-10 text-${statusColor === 'warning text-dark' ? 'warning' : statusColor} border border-${statusColor} border-opacity-25 px-3`}>
            {ann.status}
          </span>
        </div>

        <h6 className="fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{ann.title}</h6>
        <p className="text-muted small mb-3 text-truncate-2">{ann.content}</p>

        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="rounded-3 p-2 text-center bg-light border">
              <small className="d-block text-muted x-small tracking-wider">SENT</small>
              <span className="fw-bold small">{ann.sentCount || 0}</span>
            </div>
          </div>
          <div className="col-4">
            <div className="rounded-3 p-2 text-center bg-light border">
              <small className="d-block text-muted x-small tracking-wider">OPEN</small>
              <span className="fw-bold small">{ann.openCount || 0}</span>
            </div>
          </div>
          <div className="col-4">
            <div className="rounded-3 p-2 text-center bg-light border">
              <small className="d-block text-muted x-small tracking-wider">CTR</small>
              <span className="fw-bold small">{ctr}%</span>
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
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annLink, setAnnLink] = useState('');
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
      const { data } = await api.post('/announcements/request', {
        title: annTitle,
        content: annContent,
        redirectLink: annLink
      });
      const count = data.announcement?.sentCount || 0;
      setSuccess(`🚀 Blast broadcasted successfully to ${count} students!`);
      setAnnTitle(''); setAnnContent(''); setAnnLink('');
      fetchAnnouncements(false);
    } catch (err) {
      setError('Failed to push notification.');
    }
    setAnnLoading(false);
  };

  const handleAnnouncementStatus = async (id, newStatus) => {
    try {
      const { data } = await api.put(`/announcements/${id}/status`, { status: newStatus });
      setAnnouncements(prev => prev.map(ann => ann._id === id ? { ...ann, ...data.announcement } : ann));
      if (newStatus === 'approved') {
        const count = data.announcement?.sentCount || 0;
        setSuccess(`✅ Approved & Dispatched! Notification sent to ${count} students.`);
      } else {
        setSuccess(`Status flipped to ${newStatus}.`);
      }
      fetchAnnouncements(false);
    } catch (err) {
      setError("Failed to update status.");
    }
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(ann => ann._id !== id));
      setSuccess("Announcement wiped.");
    } catch (err) { setError("Delete failed."); }
  };

  const handleEditClick = (announcement) => {
    setCurrentAnn(announcement);
    setIsEditingAnn(true);
  };

  const handleUpdateAnn = (updatedItem) => {
    setAnnouncements(prev => prev.map(ann => ann._id === updatedItem._id ? updatedItem : ann));
    setSuccess("Updated successfully.");
  };

  const filteredAnnouncements = announcements.filter(ann => filter === 'all' || ann.status === filter);

  if (loading) return <LoadingScreen text="Calibrating Announcement Hub..." />;

  return (
    <div className="container-fluid fade-in px-0 overflow-x-hidden pb-5">
      {/* HEADER SECTION */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 px-3 gap-3 pt-3">
        <div className="text-start">
          <h4 className="fw-bold mb-0 text-dark">
            <i className="bi bi-broadcast text-primary me-2"></i>Broadcast Management
          </h4>
          <p className="text-muted extra-small mb-0">Control communication & track student engagement</p>
        </div>
        <button className="btn btn-sm btn-outline-primary border rounded-pill px-4 shadow-sm fw-bold bg-white" onClick={() => fetchAnnouncements(false)}>
          <i className="bi bi-arrow-repeat me-2"></i> Sync Stats
        </button>
      </div>

      {error && <div className="alert alert-danger mx-3 border-0 shadow-sm rounded-4 mb-4">{error}</div>}
      {success && <div className="alert alert-success mx-3 border-0 shadow-sm rounded-4 mb-4">{success}</div>}

      <div className="row g-4 px-3 mb-5">
        {/* LEFT SIDE: STATS & HEALTH */}
        <div className="col-lg-5 order-2 order-lg-1">
          <div className="row g-3">
            {/* FCM REACH CARD */}
            <div className="col-12 text-start">
              <div className="card border-0 rounded-4 shadow-sm bg-gradient-dark p-4 position-relative overflow-hidden h-100">
                <div className="pulse-dot"></div>
                <p className="small text-white text-opacity-50 mb-1">External FCM Reach</p>
                <h2 className="fw-bold text-white mb-0">
                  {pulse?.firebaseConsole?.opened || 0} <span className="fs-6 fw-normal opacity-50">Clicks</span>
                </h2>
                <div className="mt-4 text-white text-opacity-50 extra-small d-flex justify-content-between border-top border-secondary pt-3">
                  <span>Total Sent: {pulse?.firebaseConsole?.sent || 0}</span>
                  <span>{((pulse?.firebaseConsole?.opened / pulse?.firebaseConsole?.sent) * 100 || 0).toFixed(1)}% CTR</span>
                </div>
              </div>
            </div>

            {/* PLATFORM ENGAGEMENT */}
            <div className="col-md-6 text-start">
              <div className="card border-0 rounded-4 shadow-sm p-3 h-100 border bg-white">
                <p className="small text-muted mb-1">Platform Clicks</p>
                <h3 className="fw-bold text-primary mb-0">{pulse?.platform?.opened || 0}</h3>
                <div className="mt-2 text-muted x-small">Via Internal Notification Bell</div>
              </div>
            </div>

            {/* GLOBAL IMPACT */}
            <div className="col-md-6 text-start">
              <div className="card border-0 rounded-4 shadow-sm bg-primary text-white p-3 h-100">
                <p className="small text-white text-opacity-75 mb-1">Global Impact</p>
                <h3 className="fw-bold mb-0">{pulse?.grandTotal?.engagement || 0}</h3>
                <div className="mt-2 text-white text-opacity-75 x-small">Combined Reach</div>
              </div>
            </div>

            {/* SYSTEM HEALTH CARD (NEW) */}
            <div className="col-12 text-start">
              <div className="card border-0 rounded-4 shadow-sm p-4 bg-white border h-100">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <i className="bi bi-shield-check text-success me-2 fs-5"></i> System Health
                </h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">FCM Engine (v1)</span>
                    <span className="badge bg-success-subtle text-success border border-success border-opacity-25">Operational</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Push Delivery Rate</span>
                    <span className="fw-bold text-dark small">99.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: INSTANT BROADCAST FORM */}
        <div className="col-lg-7 order-1 order-lg-2">
          <div className="card border-0 rounded-4 shadow-lg overflow-hidden bg-white h-100">
            <div className="p-4 bg-primary bg-opacity-10 border-bottom border-primary border-opacity-10 d-flex align-items-center gap-3 text-start">
              <div className="bg-primary p-2 rounded-3 shadow-sm">
                <i className="bi bi-megaphone-fill text-white fs-4"></i>
              </div>
              <div>
                <h5 className="fw-bold text-dark mb-0">Instant Broadcast</h5>
                <p className="text-muted extra-small mb-0">Push real-time updates to all registered devices</p>
              </div>
            </div>

            <div className="card-body p-4 p-md-5 text-start">
              <form onSubmit={handleAnnouncementSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Notification Title</label>
                  <input type="text" className="form-control form-control-lg border shadow-none rounded-3 fs-6 bg-light bg-opacity-50" placeholder="e.g., Exam Schedule Updated" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} required />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Push Message</label>
                  <textarea className="form-control border shadow-none rounded-3 fs-6 bg-light bg-opacity-50" rows="4" placeholder="Type the main message for students..." value={annContent} onChange={(e) => setAnnContent(e.target.value)} required></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small text-uppercase tracking-wider">Redirect Route (Optional)</label>
                  <div className="input-group border rounded-3 overflow-hidden shadow-none bg-light bg-opacity-50">
                    <span className="input-group-text bg-transparent border-0 text-muted"><i className="bi bi-link-45deg fs-5"></i></span>
                    <input type="text" className="form-control border-0 fs-6 shadow-none bg-transparent" placeholder="e.g., /materials or https://..." value={annLink} onChange={(e) => setAnnLink(e.target.value)} />
                  </div>
                  <div className="form-text extra-small mt-2 opacity-75">Leave blank to redirect to the announcement detail page.</div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-pill shadow-sm py-3 mt-3 transition-all" disabled={annLoading} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', letterSpacing: '1px' }}>
                  {annLoading ? <><span className="spinner-border spinner-border-sm me-2"></span>DISPATCHING...</> : <><i className="bi bi-lightning-charge-fill me-2"></i> BLAST NOW</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORY TABLE SECTION */}
      <div className="mx-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0 text-dark"><i className="bi bi-journal-text text-primary me-2"></i>History &amp; Status</h6>
          <div className="btn-group btn-group-sm rounded-pill shadow-sm overflow-hidden border">
            {['all', 'approved', 'pending', 'rejected'].map(s => (
              <button key={s} className={`btn btn-sm px-3 text-capitalize ${filter === s ? 'btn-primary' : 'btn-white'}`} onClick={() => setFilter(s)}>{s}</button>
            ))}
          </div>
        </div>

        <div className="glass-card border-0 overflow-hidden shadow-sm bg-white rounded-4">
          <div className="table-responsive d-none d-lg-block">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-primary bg-opacity-5">
                <tr className="extra-small text-uppercase text-muted">
                  <th className="ps-4 py-3 text-start">Announcement</th>
                  <th className="text-start">Status</th>
                  <th className="text-start">Engagement</th>
                  <th className="text-start">Engagement Rate</th>
                  <th className="pe-4 text-end">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnnouncements.map(ann => (
                  <tr key={ann._id}>
                    <td className="ps-4 py-3 text-start">
                      <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{ann.title}</div>
                      <small className="text-muted d-flex align-items-center gap-2">
                        <i className="bi bi-person"></i> {ann.requestedBy?.username || 'Admin'}
                        <span className="opacity-25">|</span>
                        <i className="bi bi-calendar-event"></i> {new Date(ann.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td className="text-start">
                      <span className={`badge rounded-pill bg-${ann.status === 'approved' ? 'success' : 'warning'} bg-opacity-10 text-${ann.status === 'approved' ? 'success' : 'warning'} border border-${ann.status === 'approved' ? 'success' : 'warning'} border-opacity-25 px-3`}>
                        {ann.status}
                      </span>
                    </td>
                    <td className="text-start">
                      <div className="d-flex align-items-center gap-3">
                        <div><i className="bi bi-send text-primary me-1"></i><strong>{ann.sentCount || 0}</strong></div>
                        <div><i className="bi bi-eye text-success me-1"></i><strong>{ann.openCount || 0}</strong></div>
                      </div>
                    </td>
                    <td className="fw-bold text-start" style={{ color: 'var(--text-primary)' }}>
                      {ann.sentCount > 0 ? ((ann.openCount / ann.sentCount) * 100).toFixed(1) : 0}%
                    </td>
                    <td className="pe-4 text-end">
                      <div className="btn-group btn-group-sm rounded-3 shadow-sm border border-opacity-10 overflow-hidden">
                        <button className="btn btn-outline-success border-0" title="Approve" onClick={() => handleAnnouncementStatus(ann._id, 'approved')} disabled={ann.status === 'approved'}><i className="bi bi-check-lg"></i></button>
                        <button className="btn btn-outline-danger border-0" title="Reject" onClick={() => handleAnnouncementStatus(ann._id, 'rejected')} disabled={ann.status === 'rejected'}><i className="bi bi-x-lg"></i></button>
                        <button className="btn btn-outline-info border-0" title="Edit" onClick={() => handleEditClick(ann)}><i className="bi bi-pencil"></i></button>
                        <button className="btn btn-outline-danger border-0" title="Delete" onClick={() => handleAnnouncementDelete(ann._id)}><i className="bi bi-trash"></i></button>
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
        <EditAnnouncementModal item={currentAnn} onClose={() => setIsEditingAnn(false)} onUpdate={handleUpdateAnn} />
      )}

      <style>{`
        .bg-gradient-dark { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
        .extra-small { font-size: 0.72rem; }
        .x-small { font-size: 0.65rem; }
        .tracking-wider { letter-spacing: 1px; }
        .btn-icon-sm { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; }
        .pulse-dot { position: absolute; top: 20px; right: 20px; width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .bg-success-subtle { background-color: #d1fae5; }
      `}</style>
    </div>
  );
}