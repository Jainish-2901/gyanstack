import React, { useState } from 'react';
import api from '../../services/api';

const HandoverModal = ({ show, onClose, selectedIds, admins, onSuccess, onError }) => {
    const [newUploaderId, setNewUploaderId] = useState('');
    const [loading, setLoading] = useState(false);

    if (!show) return null;

    const handleConfirm = async () => {
        if (!newUploaderId) return;
        setLoading(true);
        try {
            const { data } = await api.post('/content/reassign', {
                contentIds: selectedIds,
                newUploaderId: newUploaderId
            });
            onSuccess(data.message);
            onClose();
        } catch (err) {
            console.error("Handover Error:", err);
            onError(err.response?.data?.message || 'Content handover failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden animate-zoom-in">
                    <div className="modal-header bg-primary text-white border-0 py-3">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-person-gear me-2"></i>Handover Content
                        </h5>
                        <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} disabled={loading}></button>
                    </div>
                    
                    <div className="modal-body p-4">
                        <div className="p-3 bg-light rounded-3 mb-4 text-center">
                            <div className="display-6 text-primary mb-2">
                                <i className="bi bi-stack"></i>
                            </div>
                            <p className="mb-0 fw-bold text-dark">
                                Reassigning <span className="text-primary">{selectedIds.length}</span> Content Items
                            </p>
                            <small className="text-muted">Transfer ownership to another administrator</small>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold small text-muted text-uppercase tracking-wider">Select Recipient Admin</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill ps-3">
                                    <i className="bi bi-person-check text-primary"></i>
                                </span>
                                <select 
                                    className="form-select border-start-0 rounded-end-pill px-3 shadow-none fw-medium" 
                                    value={newUploaderId} 
                                    onChange={(e) => setNewUploaderId(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">Select an administrator...</option>
                                    {admins && admins.filter(u => !u.isDeleted).map(admin => (
                                        <option key={admin._id} value={admin._id}>
                                            {admin.username} ({admin.role === 'superadmin' ? 'Super Admin' : 'Admin'})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="alert alert-warning border-0 rounded-3 small d-flex align-items-center gap-3 mb-0">
                            <i className="bi bi-exclamation-triangle-fill fs-4 flex-shrink-0"></i>
                            <div>
                                <strong>Safety Notice:</strong> This action permanently transfers management rights. The uploader's name on files will remain the same for historical accuracy.
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-0 p-4 pt-0 gap-2">
                        <button 
                            type="button" 
                            className="btn btn-light rounded-pill px-4 fw-bold text-muted border flex-grow-1" 
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary rounded-pill px-4 fw-bold flex-grow-1 shadow-sm" 
                            disabled={!newUploaderId || loading} 
                            onClick={handleConfirm}
                        >
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Transferring...</>
                            ) : (
                                <><i className="bi bi-check-circle-fill me-2"></i>Confirm Handover</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HandoverModal;
