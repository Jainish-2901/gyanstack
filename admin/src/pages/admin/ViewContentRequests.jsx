import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import LoadingScreen from '../../components/LoadingScreen';
// -------------------

export default function ViewContentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/requests');
      setRequests(data.requests);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setError("Failed to load content requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.put(`/requests/${id}`, { status: newStatus });
      // Update local state
      setRequests(requests.map(req => 
        req._id === id ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status.");
    }
  };

  if (loading) return <LoadingScreen text="Fetching user requests..." />;

  return (
    <>
      <div className="container-fluid animate-fade-in">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-primary mb-1">Content Requests</h2>
            <p className="text-muted small">Manage and fulfill user requested topics</p>
          </div>
          <button onClick={fetchRequests} className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-danger border-0 shadow-sm rounded-4 d-flex align-items-center">
            <i className="bi bi-exclamation-octagon-fill fs-4 me-3"></i>
            <div>{error}</div>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="glass-panel p-5 text-center mt-4 border-0 shadow-sm rounded-4 bg-white">
            <i className="bi bi-chat-dots display-1 text-primary opacity-25 mb-4 d-block"></i>
            <h4 className="fw-bold">No Requests Found</h4>
            <p className="text-muted">Users haven't requested any specific content yet.</p>
          </div>
        )}

        {requests.length > 0 && (
          <div className="glass-panel p-0 border-0 shadow-sm overflow-hidden rounded-4 bg-white">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary bg-opacity-10">
                  <tr>
                    <th className="ps-4 py-3 border-0 text-primary small fw-bold text-uppercase">Requested By</th>
                    <th className="py-3 border-0 text-primary small fw-bold text-uppercase">Topic</th>
                    <th className="py-3 border-0 text-primary small fw-bold text-uppercase">Message</th>
                    <th className="py-3 border-0 text-primary small fw-bold text-uppercase">Status</th>
                    <th className="pe-4 py-3 border-0 text-primary small fw-bold text-uppercase text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id} className="transition-all">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                            <i className="bi bi-person-fill fs-5"></i>
                          </div>
                          <div>
                            <p className="mb-0 fw-bold">{req.requestedBy?.username || 'Unknown User'}</p>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{req.requestedBy?.email}</small>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{req.requestedBy?.phone || 'No Phone'}</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="fw-medium text-dark">{req.topic}</span>
                        <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                          Requested: {new Date(req.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td className="py-3">
                        <p className="mb-0 small text-muted" style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                          {req.message || <span className="fst-italic opacity-50">No message provided.</span>}
                        </p>
                      </td>
                      <td className="py-3">
                        <span className={`badge rounded-pill px-3 py-2 ${
                          req.status === 'fulfilled' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                        }`}>
                          {req.status === 'fulfilled' ? (
                            <><i className="bi bi-check-circle-fill me-1"></i> Fulfilled</>
                          ) : (
                            <><i className="bi bi-clock-history me-1"></i> Pending</>
                          )}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        {req.status === 'pending' ? (
                          <button 
                            onClick={() => updateStatus(req._id, 'fulfilled')}
                            className="btn btn-sm btn-primary rounded-pill px-3 py-1"
                          >
                            Mark Fulfilled
                          </button>
                        ) : (
                          <button 
                            onClick={() => updateStatus(req._id, 'pending')}
                            className="btn btn-sm btn-outline-warning rounded-pill px-3 py-1"
                          >
                            Reopen
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
