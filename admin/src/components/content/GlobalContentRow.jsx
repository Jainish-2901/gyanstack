import React, { memo } from 'react';

const GlobalContentRow = memo(({ item, categoryMap, isSelected, onToggle, onEdit, onDelete, SITE_URL }) => {
    return (
        <tr className={`align-middle transition-all ${isSelected ? 'table-primary bg-opacity-10' : ''}`}>
            <td className="ps-4">
                <input 
                    type="checkbox" 
                    className="form-check-input shadow-none cursor-pointer" 
                    checked={isSelected} 
                    onChange={() => onToggle(item._id)} 
                    style={{ width: '18px', height: '18px' }}
                />
            </td>
            <td>
                <div className="d-flex align-items-center">
                    <div className="bg-light rounded-2 p-2 me-3 text-primary d-none d-sm-block">
                        <i className={`bi ${item.type === 'note' ? 'bi-card-text' : item.type === 'link' ? 'bi-link-45deg' : 'bi-file-earmark-pdf'} fs-5`}></i>
                    </div>
                    <div>
                        <div className="fw-bold text-dark text-break" style={{ maxWidth: '300px' }}>{item.title}</div>
                        <div className="small mt-1 d-flex flex-wrap align-items-center gap-2">
                            <span className="text-muted">By:</span>
                            <span className={`badge rounded-pill ${item.uploadedBy?.isDeleted ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                <i className={`bi ${item.uploadedBy?.isDeleted ? 'bi-person-x' : 'bi-person-check'} me-1`}></i>
                                {item.uploadedBy?.username || 'Unknown'} {item.uploadedBy?.isDeleted && '(Deactivated)'}
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <span className="badge bg-light text-dark border fw-normal text-uppercase tracking-wider" style={{ fontSize: '0.65rem' }}>
                    {item.type}
                </span>
            </td>
            <td>
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-folder2 text-primary"></i>
                    <span className="text-muted small fw-medium">
                        {categoryMap[item.categoryId] || 'Resources'}
                    </span>
                </div>
            </td>
            <td className="pe-4 text-end">
                <div className="d-flex gap-2 justify-content-end">
                    <a 
                        href={`${SITE_URL}/content/${item._id}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-sm btn-outline-info rounded-circle d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '34px', height: '34px' }}
                        title="View Live"
                    >
                        <i className="bi bi-eye"></i>
                    </a>
                    <button 
                        className="btn btn-sm btn-outline-warning rounded-circle d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '34px', height: '34px' }} 
                        onClick={() => onEdit(item)}
                        title="Edit Details"
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>
                    <button 
                        className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center p-0" 
                        style={{ width: '34px', height: '34px' }} 
                        onClick={() => onDelete(item._id)}
                        title="Delete Permanently"
                    >
                        <i className="bi bi-trash3"></i>
                    </button>
                </div>
            </td>
        </tr>
    );
});

export default GlobalContentRow;
