import React, { useState, useMemo, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useManageAllContent, useAdminContentMutation } from '../../hooks/useAdminContent';
import { useCategoryMap } from '../../hooks/useAdminCategories';
import { useAllUsers } from '../../hooks/useAdminUsers';
import LoadingScreen from '../../components/LoadingScreen';
import EditContentModal from '../../components/EditContentModal';

const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';

// ── Humanize file type ────────────────────────────────────────────
const getTypeInfo = (type = '') => {
  const t = type.toLowerCase();
  if (t === 'note' || t === 'text/plain')                           return { label: 'Note',  icon: 'bi-card-text',          color: '#6366f1' };
  if (t === 'link' || t.startsWith('http'))                        return { label: 'Link',  icon: 'bi-link-45deg',         color: '#06b6d4' };
  if (t.includes('pdf'))                                           return { label: 'PDF',   icon: 'bi-file-earmark-pdf',   color: '#ef4444' };
  if (t.includes('word') || t.includes('document'))                return { label: 'DOCX',  icon: 'bi-file-earmark-word',  color: '#3b82f6' };
  if (t.includes('presentation') || t.includes('powerpoint'))     return { label: 'PPTX',  icon: 'bi-file-earmark-slides',color: '#f97316' };
  if (t.includes('sheet') || t.includes('excel'))                  return { label: 'XLSX',  icon: 'bi-file-earmark-excel', color: '#10b981' };
  if (t.includes('image') || t.includes('png') || t.includes('jpg')) return { label: 'Image', icon: 'bi-file-earmark-image', color: '#8b5cf6' };
  if (t.includes('zip') || t.includes('rar'))                      return { label: 'ZIP',   icon: 'bi-file-earmark-zip',   color: '#64748b' };
  return { label: (type.split('/').pop() || 'File').toUpperCase().slice(0, 6), icon: 'bi-file-earmark', color: '#94a3b8' };
};

const ContentCardMobile = memo(({ item, categoryMap, isSelected, onToggle, onEdit, onDelete, SITE_URL }) => {
    if (!item) return null;
    const uploader = item.uploadedBy || {};
    const { label, icon, color } = getTypeInfo(item.type);
    return (
        <div className="mb-3 rounded-4 overflow-hidden"
            style={{
                background: 'var(--glass-bg, #fff)',
                border: `1px solid ${isSelected ? color : 'var(--glass-border, #e5e7eb)'}`,
                borderLeft: `4px solid ${color}`,
                boxShadow: isSelected ? `0 0 0 2px ${color}30` : '0 2px 10px rgba(0,0,0,0.06)',
            }}>
            <div className="p-3">
                {/* Top Row: checkbox + type badge + category */}
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                        <input type="checkbox" className="form-check-input mt-0" checked={!!isSelected}
                            onChange={() => onToggle(item._id)}
                            style={{ cursor: 'pointer', width: '1.1rem', height: '1.1rem', accentColor: color }} />
                        <span className="badge rounded-pill d-flex align-items-center gap-1 fw-semibold"
                            style={{ background: color + '18', color, border: `1px solid ${color}30`, fontSize: '0.65rem' }}>
                            <i className={`bi ${icon}`} />{label}
                        </span>
                    </div>
                    <span className="text-muted rounded-pill px-2 py-1"
                        style={{ background: 'rgba(0,0,0,0.04)', fontSize: '0.65rem', border: '1px solid rgba(0,0,0,0.06)' }}>
                        {categoryMap[item.categoryId] || 'General'}
                    </span>
                </div>

                {/* Title */}
                <h6 className="fw-bold mb-1 text-truncate" style={{ color: 'var(--text-primary)', lineHeight: 1.3 }}>{item.title}</h6>

                {/* Uploader */}
                <div className="d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.72rem', color: 'var(--text-muted, #6b7280)' }}>
                    <i className="bi bi-person-circle" />
                    <span>{uploader.username || 'System'}</span>
                    {uploader.isDeleted && <span className="badge bg-danger bg-opacity-10 text-danger ms-1" style={{ fontSize: '0.58rem' }}>Deactivated</span>}
                </div>

                {/* Stats Row */}
                <div className="d-flex gap-2 mb-3">
                    {[
                        { icon: 'bi-eye',        val: item.viewsCount     || 0, label: 'Views' },
                        { icon: 'bi-heart',      val: item.likesCount     || 0, label: 'Likes' },
                        { icon: 'bi-bookmark',   val: item.savesCount     || 0, label: 'Saves' },
                        { icon: 'bi-download',   val: item.downloadsCount || 0, label: 'DLs'   },
                    ].map(s => (
                        <div key={s.label} className="flex-fill rounded-3 text-center py-1"
                            style={{ background: 'var(--glass-bg, rgba(0,0,0,0.03))', border: '1px solid var(--glass-border, rgba(0,0,0,0.07))' }}>
                            <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--text-primary, #1f2937)' }}>{s.val}</div>
                            <div className="text-muted" style={{ fontSize: '0.58rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="d-flex gap-2">
                    <a href={`${SITE_URL}/content/${item._id}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-info flex-grow-1 rounded-pill fw-semibold"
                        style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-eye me-1" />View
                    </a>
                    <button className="btn btn-sm btn-outline-warning flex-grow-1 rounded-pill fw-semibold"
                        style={{ fontSize: '0.75rem' }} onClick={() => onEdit(item)}>
                        <i className="bi bi-pencil me-1" />Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 34, height: 34 }} onClick={() => onDelete(item._id)}>
                        <i className="bi bi-trash3-fill" style={{ fontSize: '0.75rem' }} />
                    </button>
                </div>
            </div>
        </div>
    );
});

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
                        <div className="fw-bold" style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.3', color: 'var(--text-primary)' }}>{item.title}</div>
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
                <div className="modal-content border-0 rounded-4 shadow-lg" style={{ background: 'var(--surface-color)' }}>
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

    const { data: content = [], isLoading: loading, refetch: refreshData } = useManageAllContent();
    const { data: categoryMap = {} } = useCategoryMap();
    const { data: users = [] } = useAllUsers();
    
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

    // ── Stats counts (reflects active filter) ───────────────────────────
    const totalCount = filtered.length;
    const noteCount  = filtered.filter(c => getTypeInfo(c.type).label === 'Note').length;
    const fileCount  = filtered.filter(c => !['Note','Link'].includes(getTypeInfo(c.type).label)).length;
    const linkCount  = filtered.filter(c => getTypeInfo(c.type).label === 'Link').length;

    return (
        <div className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        <i className="bi bi-collection text-primary me-2"></i>Global Platform Library
                    </h4>
                    <p className="text-muted small mb-0">Total visibility and management of all uploaded resources.</p>
                </div>
                <button className="btn btn-primary rounded-circle shadow-sm d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px' }} onClick={() => refreshData()} title="Sync"><i className="bi bi-arrow-clockwise"></i></button>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} shadow-sm border-0 rounded-4 mb-3`} onClick={() => setAlert({ type: '', msg: '' })}>{alert.msg}</div>}

            {/* ── Stats Strip ────────────────────────────────────────── */}
            {content.length > 0 && (
                <div className="d-flex gap-2 mb-3 flex-wrap">
                    {[
                        { label: 'Total',  value: totalCount, color: '#6366f1', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.18)' },
                        { label: 'Files',  value: fileCount,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.18)'  },
                        { label: 'Notes',  value: noteCount,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.18)' },
                        { label: 'Links',  value: linkCount,  color: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   border: 'rgba(6,182,212,0.18)'  },
                    ].map(s => (
                        <div key={s.label} className="rounded-3 px-3 py-2 flex-fill text-center"
                            style={{ background: s.bg, border: `1px solid ${s.border}`, minWidth: '60px' }}>
                            <div className="fw-bold" style={{ fontSize: '1.05rem', color: s.color }}>{s.value}</div>
                            <div className="text-muted" style={{ fontSize: '0.63rem' }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="glass-card mb-4" style={{ background: 'var(--surface-elevated)', opacity: 0.9 }}>
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
            <div className="glass-card border-0 overflow-hidden flex-grow-1">
                <div className="table-responsive d-none d-lg-block" style={{ maxHeight: 'calc(100vh - 290px)', overflowY: 'auto' }}>
                    <table className="table table-hover align-middle mb-0 compact-table border-0 shadow-none">
                        <thead className="sticky-top shadow-sm" style={{ zIndex: 10 }}>
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
