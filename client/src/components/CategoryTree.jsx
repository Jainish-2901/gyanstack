import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function isDescendantActive(node, activeCategoryId) {
  if (node._id === activeCategoryId) return true;
  if (node.children) return node.children.some(c => isDescendantActive(c, activeCategoryId));
  return false;
}

const INDENT = 12;

const PROGRAM_ICONS = ['bi-mortarboard-fill', 'bi-journal-bookmark-fill', 'bi-briefcase-fill', 'bi-award-fill'];
const PROGRAM_COLORS = ['#6366f1', '#06b6d4', '#ec4899', '#10b981'];

function CategoryNode({ cat, depth, onSelect, activeCategoryId }) {
  const hasChildren = Boolean(cat.children && cat.children.length > 0);
  const isActive = activeCategoryId === cat._id;
  const hasActiveDescendant = !isActive && isDescendantActive(cat, activeCategoryId);

  const [open, setOpen] = useState(() => isDescendantActive(cat, activeCategoryId));

  useEffect(() => {
    if (isDescendantActive(cat, activeCategoryId)) setOpen(true);
  }, [activeCategoryId]);

  if (!hasChildren) {
    return (
      <button
        className="d-flex align-items-center w-100 text-start border-0 rounded-2 mb-1"
        onClick={() => onSelect(cat._id, cat.name)}
        style={{
          paddingLeft:  `${depth * INDENT + 12}px`,
          paddingTop: '7px',
          paddingBottom: '7px',
          paddingRight: '12px',
          background: isActive ? 'var(--primary)' : 'transparent',
          color: isActive ? '#fff' : 'var(--text-secondary)',
          cursor: 'pointer',
          transition: 'background 0.12s',
          fontSize: '0.83rem',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <i className="bi bi-file-earmark-text me-2" style={{ fontSize: '0.75rem', opacity: 0.6 }}></i>
        <span className="text-truncate">{cat.name}</span>
      </button>
    );
  }

  const isMid   = depth === 1;
  const isTop   = depth === 0;

  const colorIdx = Math.abs(cat.name.charCodeAt(0)) % PROGRAM_COLORS.length;
  const iconColor = isTop ? PROGRAM_COLORS[colorIdx] : (isMid ? '#f59e0b' : '#6366f1');
  const folderIcon = open
    ? (isTop ? PROGRAM_ICONS[colorIdx] : 'bi-folder2-open')
    : (isTop ? 'bi-book-fill' : 'bi-folder2');

  const bgActive = isActive
    ? 'rgba(99,102,241,0.15)'
    : (hasActiveDescendant ? 'rgba(99,102,241,0.06)' : 'transparent');
  const bgOpen = open && isTop ? 'rgba(99,102,241,0.08)' : open ? 'rgba(99,102,241,0.05)' : 'transparent';
  const bg = isActive || hasActiveDescendant ? bgActive : bgOpen;

  return (
    <div>
      <button
        className="d-flex align-items-center w-100 text-start border-0 rounded-2 mb-1"
        onClick={() => {
          onSelect(cat._id, cat.name);
          setOpen(o => !o);
        }}
        style={{
          paddingLeft:  `${depth * INDENT + 12}px`,
          paddingTop:   isTop ? '10px' : '7px',
          paddingBottom: isTop ? '10px' : '7px',
          paddingRight: '12px',
          background: bg,
          cursor: 'pointer',
          transition: 'background 0.12s',
          fontWeight: isTop ? 700 : isMid ? 600 : 500,
          fontSize: isTop ? '0.9rem' : '0.85rem',
          color: isActive ? 'var(--primary)' : 'var(--text-primary)',
          outline: isActive ? '1px solid rgba(99,102,241,0.3)' : 'none',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = isActive ? bgActive : 'rgba(99,102,241,0.07)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = bg; }}
      >
        {/* Expand chevron */}
        <i
          className={`bi bi-chevron-${open ? 'down' : 'right'} me-1 text-muted`}
          style={{ fontSize: '0.6rem', flexShrink: 0 }}
        ></i>
        {/* Folder / program icon */}
        <i
          className={`bi ${folderIcon} me-2`}
          style={{ fontSize: isTop ? '0.95rem' : '0.85rem', color: iconColor, flexShrink: 0 }}
        ></i>
        <span className="text-truncate flex-grow-1">{cat.name}</span>
        {/* Child count badge */}
        <span
          className="badge rounded-pill bg-light text-muted border ms-1 flex-shrink-0"
          style={{ fontSize: '0.6rem' }}
        >
          {cat.children.length}
        </span>
      </button>

      {/* Children — rendered recursively at depth+1 */}
      {open && (
        <div
          className="border-start border-2"
          style={{
            marginLeft: `${depth * INDENT + 20}px`,
            borderColor: 'rgba(99,102,241,0.15)',
          }}
        >
          {cat.children.map(child => (
            <CategoryNode
              key={child._id}
              cat={child}
              depth={depth + 1}
              onSelect={onSelect}
              activeCategoryId={activeCategoryId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryTree({ onCategorySelect, activeCategoryId, initialData = [], isLoading = false }) {
  const [cats, setCats] = useState(initialData);
  const [loading, setLoading] = useState(initialData.length === 0 && !isLoading);
  const fetched = useRef(false);

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setCats(initialData);
      setLoading(false);
    } else if (!isLoading && !fetched.current) {
      fetched.current = true;
      setLoading(true);
      api.get('/categories/all-nested')
        .then(({ data }) => setCats(data.categories || data))
        .catch(err => console.error('CategoryTree fetch error:', err))
        .finally(() => setLoading(false));
    }
  }, [initialData, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="py-2">
        {[80, 65, 50, 70, 55].map((w, i) => (
          <div key={i} className="d-flex align-items-center gap-2 mb-3 px-2">
            <div className="rounded bg-light flex-shrink-0" style={{ width: 16, height: 16 }}></div>
            <div className="rounded bg-light" style={{ width: `${w}%`, height: 13, opacity: 0.5 }}></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <nav>
      {/* "All Content" root button */}
      <button
        className="d-flex align-items-center w-100 text-start border-0 rounded-2 mb-2 fw-bold"
        onClick={() => onCategorySelect('root', 'All Content')}
        style={{
          padding: '10px 12px',
          background: !activeCategoryId || activeCategoryId === 'root' ? 'var(--primary)' : 'rgba(0,0,0,0.03)',
          color: !activeCategoryId || activeCategoryId === 'root' ? '#fff' : 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'background 0.12s',
        }}
      >
        <i className="bi bi-collection-fill me-2"></i>
        All Content
      </button>

      {cats.map(cat => (
        <CategoryNode
          key={cat._id}
          cat={cat}
          depth={0}
          onSelect={onCategorySelect}
          activeCategoryId={activeCategoryId || 'root'}
        />
      ))}
    </nav>
  );
}