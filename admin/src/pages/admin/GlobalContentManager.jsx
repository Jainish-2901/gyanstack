import React, { useState, useMemo, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useManageAllContent, useAdminContentMutation } from '../../hooks/useAdminContent';
import { useCategoryMap } from '../../hooks/useAdminCategories';
import { useAllUsers } from '../../hooks/useAdminUsers';
import LoadingScreen from '../../components/LoadingScreen';
import EditContentModal from '../../components/EditContentModal';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

// 🚀 HELPER: Mobile Content Card
const ContentCardMobile = memo(({ item, categoryMap, isSelected, onToggle, onEdit, onDelete, SITE_URL }) => {
    if (!item) return null;
    const uploader = item.uploadedBy || {};
    return (
        <div className={`card mb-3 border-0 rounded-4 shadow-sm overflow-hidden ${isSelected ? 'ring-2 ring-primary bg-primary bg-opacity-5' : 'bg-white'}`}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <input type="checkbox" className="form-check-input mt-0 border-2 border-primary shadow-sm" checked={!!isSelected} onChange={() => onToggle(item._id)} style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem' }} />
                        <span className="badge bg-light text-primary border text-uppercase" style={{ fontSize: '0.6rem' }}>{item.type}</span>
                    </div>
                    <div className="text-muted small">
                        {categoryMap[item.categoryId] || 'General'}
                    </div>
                </div>
                <h6 className="fw-bold text-dark mb-1 text-truncate">{item.title}</h6>
                <div className="small text-muted mb-3">
                    <i className="bi bi-person-circle me-1"></i>
                    {uploader.username || 'System'} {uploader.isDeleted && <span className="text-danger">(Deactivated)</span>}
                </div>
                <div className="d-flex gap-2">
                    <a href={`${SITE_URL}/content/${item._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info flex-grow-1 rounded-pill"><i className="bi bi-eye"></i> View</a>
                    <button className="btn btn-sm btn-outline-warning flex-grow-1 rounded-pill" onClick={() => onEdit(item)}><i className="bi bi-pencil"></i> Edit</button>
                    <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={() => onDelete(item._id)}><i className="bi bi-trash"></i></button>
                </div>
            </div>
        </div>
    );
});

// 🚀 HELPER: Desktop Table Row
const GlobalContentRow = memo(({ item, categoryMap, isSelected, onToggle, onEdit, onDelete, SITE_URL }) => {
    if (!item) return null;
    const uploader = item.uploadedBy || {};
    return (
        <tr className={`align-middle ${isSelected ? 'table-primary bg-opacity-10' : ''}`}>
            <td className="ps-4">
                <input type="checkbox" className="form-check-input border-2 border-primary shadow-sm" checked={!!isSelected} onChange={() => onToggle(item._id)} style={{ cursor: 'pointer', width: '1.2rem', height: '1.2rem' }} />
            </td>
            <td style={{ maxWidth: '260px' }}>
                <div className="d-flex align-items-start">
                    <div className="bg-light rounded-circle p-2 me-3 text-primary d-none d-sm-flex align-items-center justify-content-center flex-shrink-0 mt-1" style={{ width: '36px', height: '36px' }}>
                        <i className={`bi ${item.type === 'note' ? 'bi-card-text' : item.type === 'link' ? 'bi-link-45deg' : 'bi-file-earmark-pdf'}`}></i>
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div className="fw-bold text-dark" style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3' }}>{item.title}</div>
                        <div className="small text-muted" style={{ wordBreak: 'break-all' }}>
                            {uploader.username || 'Unknown'} {uploader.isDeleted && <span className="badge bg-danger bg-opacity-10 text-danger ms-1" style={{ fontSize: '0.65rem' }}>Inactive</span>}
                        </div>
                    </div>
                </div>
            </td>
            <td style={{ maxWidth: '80px' }}>
                <span className="badge bg-light text-dark border" style={{ wordBreak: 'break-word', whiteSpace: 'normal', maxWidth: '75px', display: 'inline-block' }}>{item.type}</span>
            </td>
            <td style={{ maxWidth: '120px' }}>
                <span className="text-muted small d-block" style={{ wordBreak: 'break-word', whiteSpace: 'normal' }}>{categoryMap[item.categoryId] || 'Uncategorized'}</span>
            </td>
            <td className="pe-4 text-end">
                <div className="d-flex gap-2 justify-content-end align-items-center">
                    <a href={`${SITE_URL}/content/${item._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}><i className="bi bi-eye"></i></a>
                    <button className="btn btn-sm btn-outline-warning rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }} onClick={() => onEdit(item)}><i className="bi bi-pencil-square"></i></button>
                    <button className="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }} onClick={() => onDelete(item._id)}><i className="bi bi-trash3"></i></button>
                </div>
            </td>
        </tr>
    );
});

// 🚀 HELPER: Handover Ownership Modal
const HandoverModal = ({ show, onClose, selectedIds, admins, onSuccess, onError }) => {
    const [targetId, setTargetId] = useState('');
    const { reassignContent } = useAdminContentMutation();

    if (!show) return null;

    const executeHandover = () => {
        if (!targetId) return;
        reassignContent.mutate({ contentIds: selectedIds, newUploaderId: targetId }, {
            onSuccess: (data) => {
                onSuccess(data.message);
                onClose();
            },
            onError: (err) => {
                onError(err.response?.data?.message || 'Handover failed.');
            }
        });
    };

    return (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 rounded-4 shadow-lg">
                    <div className="modal-header bg-primary text-white border-0 py-3">
                        <h5 className="modal-title fw-bold">Handover Platform Content</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={onClose} disabled={reassignContent.isPending}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        <div className="mb-4">
                            <i className="bi bi-arrow-left-right display-4 text-primary"></i>
                            <p className="mt-2 fw-bold">Reassigning {selectedIds?.length} Items</p>
                        </div>
                        <select className="form-select rounded-pill mb-3" value={targetId} onChange={(e) => setTargetId(e.target.value)} disabled={reassignContent.isPending}>
                            <option value="">Select Recipient Admin...</option>
                            {(admins || []).filter(u => u && !u.isDeleted).map(u => (
                                <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                            ))}
                        </select>
                        <p className="small text-muted bg-light p-2 rounded">Warning: This action transfers content management rights to the selected administrator.</p>
                    </div>
                    <div className="modal-footer border-0 p-4 pt-0 gap-2">
                        <button className="btn btn-light rounded-pill px-4 border flex-grow-1" onClick={onClose} disabled={reassignContent.isPending}>Cancel</button>
                        <button className="btn btn-primary rounded-pill px-4 fw-bold flex-grow-1 shadow-sm" onClick={executeHandover} disabled={!targetId || reassignContent.isPending}>
                            {reassignContent.isPending ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Transfer Ownership'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function GlobalContentManager() {
    const { user } = useAuth();

    // 1. Data Fetching Hooks
    const { data: content = [], isLoading: loading, refetch: refreshData } = useManageAllContent();
    const { data: categoryMap = {} } = useCategoryMap();
    const { data: users = [] } = useAllUsers();
    
    // Derived state
    const admins = useMemo(() => users.filter(u => u && u.role !== 'student'), [users]);
    
    const { deleteContent, bulkDeleteContent } = useAdminContentMutation();
    
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterUploader, setFilterUploader] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');

    const [alert, setAlert] = useState({ type: '', msg: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [showHandover, setShowHandover] = useState(false);

    // loadData is gone as TanStack Query handles it

    const filtered = useMemo(() => {
        return (content || []).filter(item => {
            if (!item) return false;
            const matchesSearch = !searchTerm || item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || (item.tags || []).some(t => t?.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesUploader = filterUploader === 'all' || item.uploadedBy?._id === filterUploader;
            const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
            return matchesSearch && matchesUploader && matchesCategory;
        });
    }, [content, searchTerm, filterUploader, filterCategory]);

    const handleEditStart = (item) => {
        if (!item) return;
        setCurrentItem({ ...item });
        setIsEditing(true);
    };

    const handleDeleteAction = (id) => {
        if (!window.confirm('Erase this resource permanently?')) return;
        deleteContent.mutate(id, {
            onSuccess: () => setAlert({ type: 'success', msg: 'Resource cleared from platform.' }),
            onError: () => setAlert({ type: 'danger', msg: 'Purge failed.' }),
        });
    };

    const handleBulkDelete = () => {
        if (!selectedIds.length) return;
        if (!window.confirm(`Permanently erase ${selectedIds.length} resources from the platform?`)) return;
        
        bulkDeleteContent.mutate(selectedIds, {
            onSuccess: () => {
                setAlert({ type: 'success', msg: `${selectedIds.length} resources cleared successfully.` });
                setSelectedIds([]);
            },
            onError: () => setAlert({ type: 'danger', msg: 'Bulk purge failed.' }),
        });
    };

    if (loading) return <LoadingScreen text="Syncing Global Library..." />;

    return (
        <div className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold text-primary mb-1">Global Platform Library</h1>
                    <p className="text-muted small mb-0">Total visibility and management of all uploaded resources.</p>
                </div>
                <button className="btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} onClick={() => refreshData()} title="Sync"><i className="bi bi-arrow-clockwise"></i></button>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} shadow-sm border-0 rounded-4 mb-4`} onClick={() => setAlert({ type: '', msg: '' })}>{alert.msg}</div>}

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 mb-4 bg-light bg-opacity-50">
                <div className="card-body p-3">
                    <div className="row g-2">
                        <div className="col-12 col-md-4">
                            <input type="text" className="form-control rounded-pill px-3" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="col-6 col-md-4">
                            <select className="form-select rounded-pill px-3" value={filterUploader} onChange={(e) => setFilterUploader(e.target.value)}>
                                <option value="all">Every Uploader</option>
                                {admins.map(u => <option key={u._id} value={u._id}>{u.username} {u.isDeleted ? '(Deactivated)' : ''}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-4">
                            <select className="form-select rounded-pill px-3" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="all">Every Category</option>
                                {Object.entries(categoryMap).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="bg-primary bg-opacity-10 p-3 rounded-4 mb-4 d-flex justify-content-between align-items-center animate-slideIn shadow-sm border border-primary border-opacity-10">
                    <div className="d-flex align-items-center gap-2 ps-2">
                        <span className="badge bg-primary rounded-pill px-3 py-2">{selectedIds.length} Selected</span>
                    </div>
                    <div className="d-flex gap-2 pe-2">
                        <button className="btn btn-warning btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }} onClick={() => setShowHandover(true)} title="Handover Ownership">
                            <i className="bi bi-arrow-left-right fs-5"></i>
                        </button>
                        <button className="btn btn-danger btn-sm rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px' }} onClick={handleBulkDelete} title="Bulk Delete">
                            <i className="bi bi-trash3 fs-5"></i>
                        </button>
                        <button className="btn btn-light btn-sm rounded-circle d-flex align-items-center justify-content-center border shadow-sm" style={{ width: '40px', height: '40px' }} onClick={() => setSelectedIds([])} title="Cancel Selection">
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>
            )}

            {/* Content List */}
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden flex-grow-1">
                <div className="table-responsive d-none d-lg-block" style={{ maxHeight: 'calc(100vh - 290px)', overflowY: 'auto' }}>
                    <table className="table table-hover align-middle mb-0 compact-table">
                        <thead className="bg-light sticky-top shadow-sm" style={{ zIndex: 10, backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th className="ps-4" style={{ width: '40px' }}>
                                    <input type="checkbox" className="form-check-input border-2 border-primary" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={() => {
                                        if (selectedIds.length === filtered.length) setSelectedIds([]);
                                        else setSelectedIds(filtered.map(i => i._id));
                                    }} />
                                </th>
                                <th>Resource Metadata</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th className="text-end pe-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(item => (
                                <GlobalContentRow key={item._id} item={item} categoryMap={categoryMap} isSelected={selectedIds.includes(item._id)} onToggle={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} onEdit={handleEditStart} onDelete={handleDeleteAction} SITE_URL={SITE_URL} />
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="d-lg-none p-3">
                    {filtered.map(item => (
                        <ContentCardMobile key={item._id} item={item} categoryMap={categoryMap} isSelected={selectedIds.includes(item._id)} onToggle={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} onEdit={handleEditStart} onDelete={handleDeleteAction} SITE_URL={SITE_URL} />
                    ))}
                </div>
                {filtered.length === 0 && <div className="p-5 text-center text-muted">No platform resources found matching criteria.</div>}
            </div>

            {/* Modals */}
            <HandoverModal show={showHandover} onClose={() => setShowHandover(false)} selectedIds={selectedIds} admins={admins} onSuccess={(m) => { setAlert({ type: 'success', msg: m }); setSelectedIds([]); }} onError={(e) => setAlert({ type: 'danger', msg: e })} />
            
            {isEditing && (
                <EditContentModal
                    item={currentItem}
                    onClose={() => setIsEditing(false)}
                    onUpdate={(u) => { setAlert({ type: 'success', msg: 'Updated successfully.' }); setIsEditing(false); }}
                    categories={categoryMap}
                />
            )}
        </div>
    );
}
