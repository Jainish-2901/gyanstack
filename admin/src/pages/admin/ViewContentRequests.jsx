import React from 'react';
import { useContentRequests, useRequestMutation } from '../../hooks/useAdminRequests';
import LoadingScreen from '../../components/LoadingScreen';

// 🚀 HELPER: Mobile Request Card
const RequestCardMobile = ({ req, handleUpdateStatus, handleDelete }) => (
    <div className="card mb-3 border-0 rounded-4 shadow-sm overflow-hidden bg-white mx-1">
        <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                    <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                        <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="overflow-hidden">
                        <div className="fw-bold small text-dark text-truncate" style={{ maxWidth: '120px' }}>{req.requestedBy?.username || 'Unknown'}</div>
                        <div className="text-muted extra-small" style={{ fontSize: '0.65rem' }}>{req.requestedBy?.email}</div>
                    </div>
                </div>
                <span className={`badge rounded-pill ${req.status === 'fulfilled' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'}`} style={{ fontSize: '0.6rem' }}>
                    {req.status.toUpperCase()}
                </span>
            </div>
            
            <div className="bg-light p-2 rounded-3 mb-2">
                <div className="fw-bold small mb-1">{req.topic}</div>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>{req.message || 'No additional details.'}</div>
            </div>

            <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted" style={{ fontSize: '0.65rem' }}>{new Date(req.createdAt).toLocaleDateString()}</small>
                <div className="d-flex gap-2">
                    <button onClick={() => handleUpdateStatus(req._id, req.status === 'pending' ? 'fulfilled' : 'pending')} className="btn btn-sm btn-primary rounded-pill px-3 py-1 extra-small" style={{ fontSize: '0.7rem' }}>
                        {req.status === 'pending' ? 'Fulfill' : 'Reopen'}
                    </button>
                    <button onClick={() => handleDelete(req._id)} className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1 extra-small">
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default function ViewContentRequests() {
  const { data: requests = [], isLoading: loading, error: fetchError, refetch: refreshRequests } = useContentRequests();
  const { updateStatus: mutateStatus, deleteRequest: mutateDelete } = useRequestMutation();

  const handleUpdateStatus = (id, newStatus) => {
    mutateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to PERMANENTLY delete this request?")) return;
    mutateDelete.mutate(id);
  };

  if (loading) return <LoadingScreen text="Fetching user requests..." />;

  return (
    <div className="container-fluid fade-in px-1 px-md-3 overflow-x-hidden" style={{ overflowX: 'hidden' }}>
      <div className="d-flex justify-content-between align-items-center mb-3 px-1">
        <div>
          <h5 className="fw-bold text-primary mb-0">Content Requests</h5>
          <p className="text-muted d-none d-md-block small mb-0">Manage and fulfill user requested topics</p>
        </div>
        <button onClick={() => refreshRequests()} className="btn btn-outline-primary btn-sm rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
          <i className="bi bi-arrow-clockwise fs-5"></i>
        </button>
      </div>

        {fetchError && (
          <div className="alert alert-danger border-0 rounded-4 d-flex align-items-center mx-1">
            <i className="bi bi-exclamation-octagon-fill me-2"></i>
            <div className="small">Failed to load content requests.</div>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div className="p-5 text-center mt-4 border-0 rounded-4 bg-white mx-1">
            <i className="bi bi-chat-dots display-1 text-primary opacity-25 mb-4 d-block"></i>
            <h5 className="fw-bold">No Requests Found</h5>
            <p className="text-muted small">Users haven't requested any specific content yet.</p>
          </div>
        )}

        {requests.length > 0 && (
          <div className="p-0 border-0 overflow-hidden rounded-4">
            {/* DESKTOP VIEW: Table */}
            <div className="table-responsive d-none d-lg-block bg-white shadow-sm rounded-4">
              <table className="table table-hover align-middle mb-0">
                <thead className="bg-primary bg-opacity-10 border-0">
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
                          {req.status === 'fulfilled' ? 'Fulfilled' : 'Pending'}
                        </span>
                      </td>
                      <td className="pe-4 py-3 text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button 
                            onClick={() => handleUpdateStatus(req._id, req.status === 'pending' ? 'fulfilled' : 'pending')}
                            className={`btn btn-sm rounded-pill px-3 py-1 ${req.status === 'pending' ? 'btn-primary' : 'btn-outline-warning'}`}
                          >
                            {req.status === 'pending' ? 'Mark Fulfilled' : 'Reopen'}
                          </button>
                          <button 
                            onClick={() => handleDelete(req._id)}
                            className="btn btn-sm btn-outline-danger rounded-pill px-2 py-1"
                            title="Delete Request"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE VIEW: Cards */}
            <div className="d-lg-none px-1 pb-4">
              {requests.map((req) => (
                <RequestCardMobile key={req._id} req={req} handleUpdateStatus={handleUpdateStatus} handleDelete={handleDelete} />
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
