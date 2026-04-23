import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
import EditAnnouncementModal from '../../components/EditAnnouncementModal';
import { useAuth } from '../../context/AuthContext';

const AnnouncementCardMobile = ({ item, handleAnnEditClick, handleAnnouncementDelete }) => (
  <div className="card mb-3 border-0 rounded-lg">
    <div className="card-body">
      <div className="data-item fw-bold text-dark mb-1" data-label="Title">{item.title}</div>
      <div className="data-item mb-2" data-label="Status">
        <span className={`badge ${item.status === 'approved' ? 'bg-success' :
            item.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
          }`}>{item.status}</span>
      </div>
      <div className="data-item small text-muted mb-3" data-label="Date">
        {new Date(item.createdAt).toLocaleDateString()}
      </div>
      <div className="card-actions">
        <button
          className="btn btn-sm btn-warning me-2"
          onClick={() => handleAnnEditClick(item)}
          disabled={item.status !== 'pending'}
        >
          Edit
        </button>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => handleAnnouncementDelete(item._id)}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

export default function MyAnnouncements() {
  const { user } = useAuth();
  const [annTitle, setAnnTitle] = useState('');
  const [annLink, setAnnLink] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annLoading, setAnnLoading] = useState(false);
  const [myAnnouncements, setMyAnnouncements] = useState([]);
  const [loadingAnn, setLoadingAnn] = useState(true);
  const [isEditingAnn, setIsEditingAnn] = useState(false);
  const [currentAnn, setCurrentAnn] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyAnnouncements = async () => {
    setLoadingAnn(true);
    try {
      const { data } = await api.get('/announcements/my-requests');
      setMyAnnouncements(data.announcements);
    } catch (err) {
      setError('Failed to fetch your announcements.');
    }
    setLoadingAnn(false);
  };

  useEffect(() => {
    fetchMyAnnouncements();
  }, []);

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    setAnnLoading(true);
    setError(''); setSuccess('');
    try {
      await api.post('/announcements/request', {
        title: annTitle,
        content: annContent,
        redirectLink: annLink
      });
      setSuccess('Announcement request sent for approval!');
      setAnnTitle(''); setAnnContent(''); setAnnLink('');
      fetchMyAnnouncements();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request.');
    }
    setAnnLoading(false);
  };

  const handleAnnouncementDelete = async (id) => {
    if (!window.confirm('Delete this request?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchMyAnnouncements();
      setSuccess('Request deleted successfully.');
    } catch (err) {
      setError('Failed to delete request.');
    }
  };

  const handleAnnEditClick = (ann) => {
    setCurrentAnn(ann);
    setIsEditingAnn(true);
  };

  const handleUpdateAnn = (updatedItem) => {
    setMyAnnouncements(myAnnouncements.map(ann =>
      ann._id === updatedItem._id ? updatedItem : ann
    ));
    setSuccess('Announcement updated successfully.');
  };

  if (user?.role === 'superadmin') {
    return (
      <div className="alert alert-warning">
        SuperAdmins should use the <b>Manage All Announcements</b> tab.
      </div>
    );
  }

  return (
    <div className="container-fluid fade-in px-0 overflow-x-hidden">
      <h4 className="fw-bold text-primary mb-4">My Announcement Requests</h4>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="row g-4">
        {/* Request Form */}
        <div className="col-lg-4">
          <div className="card border-0 rounded-3">
            <div className="card-body p-4">
              <h5 className="fw-bold mb-3">Request New Announcement</h5>
              <p className="text-muted small">Your request will be visible to students after SuperAdmin approval.</p>

              <form onSubmit={handleAnnouncementSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter short title"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">Content</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Write announcement details..."
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Redirect Link (Optional)</label>
                  <div className="input-group input-group-sm shadow-sm">
                    <span className="input-group-text bg-light border-0"><i className="bi bi-link-45deg"></i></span>
                    <input
                      type="text"
                      className="form-control border-0"
                      placeholder="e.g., /materials or https://youtube.com"
                      value={annLink}
                      onChange={(e) => setAnnLink(e.target.value)}
                    />
                  </div>
                  <small className="text-muted extra-small">Leave blank to open the detail page by default.</small>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill" disabled={annLoading}>
                  {annLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                  ) : (
                    <><i className="bi bi-send-fill me-2"></i>Send Request</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* List of Requests */}
        <div className="col-lg-8">
          <div className="card border-0 rounded-3">
            <div className="card-header bg-white py-3">
              <h5 className="fw-bold mb-0">Request History</h5>
            </div>
            <div className="card-body p-0">
              {loadingAnn ? (
                <div className="p-5 text-center">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : myAnnouncements.length === 0 ? (
                <div className="p-5 text-center text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-3 opacity-25"></i>
                  No announcement requests found.
                </div>
              ) : (
                <>
                  <div className="table-responsive d-none d-lg-block">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4">Title</th>
                          <th>Status</th>
                          <th>Requested</th>
                          <th className="text-end pe-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myAnnouncements.map(item => (
                          <tr key={item._id}>
                            <td className="ps-4 fw-medium">{item.title}</td>
                            <td>
                              <span className={`badge rounded-pill ${item.status === 'approved' ? 'bg-success bg-opacity-10 text-success' :
                                  item.status === 'rejected' ? 'bg-danger bg-opacity-10 text-danger' : 'bg-warning bg-opacity-10 text-warning text-dark'
                                } px-3`}>{item.status}</span>
                            </td>
                            <td className="text-muted small">{new Date(item.createdAt).toLocaleDateString()}</td>
                            <td className="text-end pe-4">
                              <button
                                className="btn btn-sm btn-outline-warning me-2"
                                onClick={() => handleAnnEditClick(item)}
                                disabled={item.status !== 'pending'}
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleAnnouncementDelete(item._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-lg-none p-3">
                    {myAnnouncements.map(item => (
                      <AnnouncementCardMobile
                        key={item._id}
                        item={item}
                        handleAnnEditClick={handleAnnEditClick}
                        handleAnnouncementDelete={handleAnnouncementDelete}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
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
    </div>
  );
}
