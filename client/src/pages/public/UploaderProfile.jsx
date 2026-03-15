import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ContentCard from '../../components/ContentCard';
import LoadingScreen from '../../components/LoadingScreen';

export default function UploaderProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [allContents, setAllContents] = useState([]);   // flat list for search
  const [groupedContents, setGroupedContents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, catRes] = await Promise.all([
          api.get(`/auth/uploader/${id}`),
          api.get('/categories/all-nested'),
        ]);

        const contents = profileRes.data.contents;
        setTotalCount(contents.length);

        // Flatten category tree into a name map { _id: name }
        const catMap = {};
        const flatten = (cats) => {
          if (!cats) return;
          cats.forEach(c => {
            catMap[c._id] = c.name;
            if (c.children) flatten(c.children);
          });
        };
        flatten(catRes.data.categories);

        // Group contents by category
        const groups = {};
        contents.forEach(item => {
          const catName = catMap[item.categoryId] || 'Uncategorised';
          if (!groups[catName]) groups[catName] = [];
          groups[catName].push(item);
        });

        // Convert to sorted array (most items first)
        const sortedGroups = Object.entries(groups)
          .sort((a, b) => b[1].length - a[1].length)
          .map(([name, items]) => ({ name, items }));

        setGroupedContents(sortedGroups);
        setAllContents(contents);
        if (sortedGroups.length > 0) setActiveCategory(sortedGroups[0].name);
        setProfile(profileRes.data.user);

      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Uploader profile not found.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  // ✅ All hooks MUST be called before any early returns (Rules of Hooks)
  const activeGroup = groupedContents.find(g => g.name === activeCategory);

  // Real-time search across all content (title + tags)
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase();
    return allContents.filter(item =>
      item.title?.toLowerCase().includes(q) ||
      (item.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [searchTerm, allContents]);

  const isSearchActive = searchTerm.trim().length > 0;

  // Early returns AFTER all hooks
  if (loading) return <LoadingScreen text="Loading profile..." />;
  if (error) {
    return (
      <div className="container text-center my-5">
        <div className="glass-panel p-5">
          <i className="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
          <h2 className="fw-bold">{error}</h2>
          <Link to="/" className="btn btn-primary mt-4 px-4 py-2 rounded-pill">Explore Library</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 fade-in">
      <div className="row g-4">

        {/* ---- SIDEBAR: Profile Info ---- */}
        <div className="col-lg-3">
          <div className="glass-panel p-4 text-center" style={{ position: 'sticky', top: '6rem' }}>
            {/* Avatar */}
            <div className="mb-4">
              <div
                className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center border border-primary border-3 shadow overflow-hidden"
                style={{ width: '120px', height: '120px' }}
              >
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.username} className="w-100 h-100 object-fit-cover" />
                ) : (
                  <span className="text-white fw-bold" style={{ fontSize: '3rem' }}>
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <h4 className="fw-bold mb-1">{profile.username}</h4>

            {/* Stats */}
            <div className="d-flex justify-content-center gap-3 mb-4">
              <div className="text-center">
                <div className="fw-bold fs-5 text-primary">{totalCount}</div>
                <small className="text-muted">Uploads</small>
              </div>
              <div className="vr opacity-25"></div>
              <div className="text-center">
                <div className="fw-bold fs-5 text-primary">{groupedContents.length}</div>
                <small className="text-muted">Categories</small>
              </div>
            </div>

            <div className="border-top pt-3 text-start">
              {profile.email && (
                <div className="mb-2 d-flex align-items-center gap-2 p-2 rounded-3 hover-bg-light">
                  <i className="bi bi-envelope-fill text-primary"></i>
                  <a href={`mailto:${profile.email}`} className="small fw-medium text-primary text-decoration-none text-truncate">
                    {profile.email}
                  </a>
                </div>
              )}
              {profile.phone && (
                <div className="d-flex align-items-center gap-2 p-2 rounded-3 hover-bg-light">
                  <i className="bi bi-telephone-fill text-primary"></i>
                  <a href={`tel:${profile.phone}`} className="small fw-medium text-primary text-decoration-none">
                    {profile.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---- MAIN CONTENT: Categorised ---- */}
        <div className="col-lg-9">
          {/* Header Row */}
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom border-light flex-wrap gap-2">
            <h4 className="fw-bold mb-0">
              <i className="bi bi-cloud-arrow-up-fill text-primary me-2"></i>
              Contributions
              <span className="text-muted fw-normal ms-2 fs-6">({totalCount} items)</span>
            </h4>
          </div>

          {/* Search Bar */}
          <div className="fancy-search d-flex align-items-center mb-4">
            <i className="bi bi-search ms-4 text-muted fs-5"></i>
            <input
              type="search"
              className="form-control flex-grow-1"
              placeholder={`Search in ${profile?.username}'s uploads...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {isSearchActive && (
              <button
                className="btn btn-link text-muted pe-3"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>

          {groupedContents.length === 0 ? (
            <div className="text-center py-5">
              <div className="glass-card p-5">
                <i className="bi bi-folder-x display-4 text-muted mb-3"></i>
                <p className="lead text-muted">This user hasn't uploaded any content yet.</p>
              </div>
            </div>

          ) : isSearchActive ? (
            /* ---- SEARCH RESULTS VIEW ---- */
            <>
              <div className="d-flex align-items-center mb-3 gap-2">
                <i className="bi bi-search text-primary fs-5"></i>
                <h5 className="fw-bold mb-0">Search Results</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                  {searchResults.length} found
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-5 glass-card">
                  <i className="bi bi-search display-4 text-muted mb-3 d-block"></i>
                  <p className="lead text-muted">No content matched "<strong>{searchTerm}</strong>"</p>
                  <button className="btn btn-outline-primary rounded-pill mt-2" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="row g-3">
                  {searchResults.map(item => (
                    <div key={item._id} className="col-12 col-md-6 col-lg-4">
                      <ContentCard item={item} />
                    </div>
                  ))}
                </div>
              )}
            </>

          ) : (
            /* ---- CATEGORY TAB VIEW ---- */
            <>
              {/* Category Tab Pills — with 'View All' first */}
              <div className="d-flex flex-wrap gap-2 mb-4">

                {/* View All pill */}
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-2 ${activeCategory === null ? 'btn-primary shadow-sm' : 'btn-light'}`}
                >
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                  View All
                  <span
                    className={`badge rounded-pill ${activeCategory === null ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {totalCount}
                  </span>
                </button>

                {groupedContents.map(group => (
                  <button
                    key={group.name}
                    onClick={() => setActiveCategory(group.name)}
                    className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold d-flex align-items-center gap-2 ${activeCategory === group.name ? 'btn-primary shadow-sm' : 'btn-light'}`}
                  >
                    <i className="bi bi-folder2-open"></i>
                    {group.name}
                    <span
                      className={`badge rounded-pill ${activeCategory === group.name ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {group.items.length}
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Category Header + Grid */}
              {activeCategory === null ? (
                /* View All Mode */
                <>
                  <div className="d-flex align-items-center mb-3 gap-2">
                    <i className="bi bi-grid-3x3-gap-fill text-primary fs-5"></i>
                    <h5 className="fw-bold mb-0">All Contributions</h5>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                      {totalCount} items
                    </span>
                  </div>
                  <div className="row g-3">
                    {allContents.map(item => (
                      <div key={item._id} className="col-12 col-md-6 col-lg-4">
                        <ContentCard item={item} />
                      </div>
                    ))}
                  </div>
                </>
              ) : activeGroup ? (
                /* Single Category Mode */
                <>
                  <div className="d-flex align-items-center mb-3 gap-2">
                    <i className="bi bi-folder-fill text-primary fs-5"></i>
                    <h5 className="fw-bold mb-0">{activeGroup.name}</h5>
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">
                      {activeGroup.items.length} items
                    </span>
                  </div>
                  <div className="row g-3">
                    {activeGroup.items.map(item => (
                      <div key={item._id} className="col-12 col-md-6 col-lg-4">
                        <ContentCard item={item} />
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
