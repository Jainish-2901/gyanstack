import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import { useStats, useTopUploaders } from '../../hooks/useStats';
import { useNestedCategories } from '../../hooks/useCategories';
import { useCategoryContent } from '../../hooks/useContent';
import ContentCard from '../../components/ContentCard';
import { StatsSkeleton, CardSkeleton, ListSkeleton } from '../../components/SkeletonLoaders';
import SEOHead from '../../components/SEOHead';
const FeatureCard = ({ icon, title, text, colorClass }) => (
  <div className="col-lg-3 col-md-6 mb-4 fade-in">
    <div className={`feature-card d-flex flex-column h-100`}>
      <div className={`icon-wrapper ${colorClass}`}>
        <i className={`bi ${icon}`}></i>
      </div>
      <h5 className="fw-bold mb-3 card-title">{title}</h5>
      <p className="text-muted small mb-0">{text}</p>
    </div>
  </div>
);

const getSmallIcon = (type) => {
  if (type?.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
  if (type?.includes('video')) return 'bi-play-circle text-info';
  if (type?.includes('image')) return 'bi-image text-success';
  if (type === 'link') return 'bi-link-45deg text-primary';
  if (type === 'note') return 'bi-sticky text-warning';
  return 'bi-file-earmark text-secondary';
};


const BRANCH_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ec4899'];

const HomeTreeNode = ({ cat, depth = 0 }) => {
  const hasChildren = Boolean(cat.children && cat.children.length > 0);

  
  const [open, setOpen] = React.useState(false);
  
  
  const { data: items, isLoading: loading, refetch } = useCategoryContent(cat._id, false);
  const [hasRefetched, setHasRefetched] = React.useState(false);

  const toggleLeaf = async () => {
    const next = !open;
    setOpen(next);
    if (next && !hasRefetched) {
      setHasRefetched(true);
      refetch();
    }
  };

  const indent = depth * 12;

  if (!hasChildren) {
    return (
      <div className="cat-leaf">
        <button
          className="d-flex align-items-center w-100 text-start border-0 rounded-2 cat-leaf-btn"
          onClick={toggleLeaf}
          style={{ paddingLeft: `${indent + 8}px`, padding: `7px 8px 7px ${indent + 8}px`, background: open ? 'rgba(99,102,241,0.07)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
        >
          <i className={`bi bi-chevron-${open ? 'down' : 'right'} me-2 text-muted`} style={{ fontSize: '0.65rem' }}></i>
          <i className="bi bi-folder2 me-2 text-primary" style={{ fontSize: '0.82rem' }}></i>
          <span className="small fw-semibold text-dark flex-grow-1">{cat.name}</span>
          {items !== undefined && <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary ms-1" style={{ fontSize: '0.62rem' }}>{items?.length || 0}</span>}
        </button>

        {open && (
          <div style={{ paddingLeft: `${indent + 20}px` }} className="pb-1">
            {loading && <div className="py-2"><span className="spinner-border spinner-border-sm text-primary me-2"></span><small className="text-muted">Loading...</small></div>}
            {!loading && items?.length === 0 && <p className="text-muted small mb-2">No content yet.</p>}
            {!loading && items?.map(item => (
              <Link key={item._id} to={`/content/${item._id}`} className="d-flex align-items-center text-decoration-none py-1 px-2 rounded-2 mb-1 content-link-row">
                <i className={`bi ${getSmallIcon(item.type)} me-2`} style={{ fontSize: '0.82rem' }}></i>
                <span className="text-muted small text-truncate">{item.title}</span>
              </Link>
            ))}
            {!loading && items?.length > 0 && (
              <Link to={`/browse?category=${cat._id}`} className="d-flex align-items-center text-decoration-none py-1 px-2 rounded-2 mb-1">
                <i className="bi bi-arrow-right-circle me-2 text-primary" style={{ fontSize: '0.82rem' }}></i>
                <span className="small text-primary fw-bold">View all in {cat.name}</span>
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  const iconColor = BRANCH_COLORS[depth % BRANCH_COLORS.length];
  const folderIcon = open ? 'bi-folder2-open' : 'bi-folder2';

  return (
    <div>
      <button
        className="d-flex align-items-center w-100 text-start border-0 rounded-2"
        onClick={() => setOpen(o => !o)}
        style={{ paddingLeft: `${indent + 8}px`, padding: `8px 8px 8px ${indent + 8}px`, background: open ? 'rgba(99,102,241,0.06)' : 'transparent', cursor: 'pointer', transition: 'background 0.15s' }}
      >
        <i className={`bi bi-chevron-${open ? 'down' : 'right'} me-1 text-muted`} style={{ fontSize: '0.65rem' }}></i>
        <i className={`bi ${folderIcon} me-2`} style={{ fontSize: '0.88rem', color: iconColor }}></i>
        <span className="small fw-bold text-dark flex-grow-1">{cat.name}</span>
        <span className="badge rounded-pill bg-light text-muted border ms-1" style={{ fontSize: '0.62rem' }}>{cat.children.length}</span>
      </button>
      {open && (
        <div className="border-start border-2 ms-3" style={{ marginLeft: `${indent + 20}px`, borderColor: 'rgba(99,102,241,0.15)' }}>
          {cat.children.map(child => (
            <HomeTreeNode key={child._id} cat={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryTree = ({ cat }) => {
  const [open, setOpen] = React.useState(false);
  const hasChildren = Boolean(cat.children && cat.children.length > 0);

  const gradients = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
    'linear-gradient(135deg,#ec4899,#f43f5e)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
  ];
  const grad = gradients[Math.abs(cat.name.charCodeAt(0)) % gradients.length];

  return (
    <div className="glass-card overflow-hidden border-0 shadow-sm" style={{ borderRadius: '1rem' }}>
      <button
        className="d-flex align-items-center w-100 text-start p-4 border-0"
        onClick={() => setOpen(o => !o)}
        style={{ background: 'transparent', cursor: 'pointer' }}
      >
        <div className="rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0"
          style={{ width: '44px', height: '44px', background: grad }}>
          <i className="bi bi-journal-bookmark-fill text-white fs-5"></i>
        </div>
        <div className="flex-grow-1 text-start">
          <h5 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontSize: '1.05rem' }}>{cat.name}</h5>
          <small className="text-muted">
            {hasChildren ? `${cat.children.length} section${cat.children.length > 1 ? 's' : ''}` : 'Open to browse'}
          </small>
        </div>
        <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
          style={{ width: '32px', height: '32px', background: open ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'} text-primary`} style={{ fontSize: '0.8rem' }}></i>
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-top" style={{ borderColor: 'var(--glass-border)' }}>
          {hasChildren
            ? cat.children.map(child => <HomeTreeNode key={child._id} cat={child} depth={0} />)
            : <HomeTreeNode cat={cat} depth={0} />
          }
        </div>
      )}
    </div>
  );
};

const CategorizedContent = ({ nestedCategories }) => {
  if (!nestedCategories) {
    return (
      <div className="container py-5">
        <div className="row g-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-lg-4 col-md-6">
              <ListSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topLevel = nestedCategories;
  if (!topLevel || topLevel.length === 0) return null;

  const colClass =
    topLevel.length === 1 ? 'col-12 col-md-8 mx-auto' :
      topLevel.length === 2 ? 'col-md-6' :
        'col-lg-4 col-md-6';

  return (
    <section className="container py-5">
      <style>{`
        .content-link-row { transition: background 0.15s; }
        .content-link-row:hover { background: rgba(99,102,241,0.07); }
        .cat-leaf-btn:hover { background: rgba(99,102,241,0.07) !important; }
      `}</style>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-5 fade-in gap-4">
        <div className="text-center text-md-start">
          <h6 className="text-primary fw-bold text-uppercase tracking-wider">Explore Hub</h6>
          <h2 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Quick Access By Category</h2>
          <p className="text-muted mb-0">Expand any program → semester → subject to browse resources instantly.</p>
        </div>
        <div className="flex-shrink-0">
          <Link to="/browse" className="btn btn-light btn-lg glass-card px-4 border-0 shadow-sm text-primary fw-bold rounded-pill">
            <i className="bi bi-funnel-fill me-2"></i>Browse All
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {topLevel.map(cat => (
          <div key={cat._id} className={`${colClass} fade-in`}>
            <CategoryTree cat={cat} />
          </div>
        ))}
      </div>
    </section>
  );
};

const StatsSection = ({ stats }) => {
  const isLoading = stats.contentCount === '...';

  const StatItem = ({ value, label, icon, color }) => (
    <div className="col-md-4 mb-4 mb-md-0 px-lg-5">
      <div className="d-flex flex-column align-items-center">
        <div className={`d-flex align-items-center justify-content-center rounded-circle bg-${color} bg-opacity-10 mb-3 shadow-sm`}
          style={{ width: '75px', height: '75px', border: `2px dashed rgba(var(--bs-${color}-rgb), 0.5)` }}>
          <i className={`bi ${icon} text-${color} fs-1`}></i>
        </div>
        <h2 className="display-5 fw-bold mb-1" style={{ color: 'var(--text-primary)' }}>{value}</h2>
        <p className="text-white-50 fw-medium text-uppercase tracking-wider small mb-0">{label}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <section className="py-5">
        <div className="container px-4 px-md-0">
          <StatsSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="py-5 overflow-hidden">
      <div className="container px-4 px-md-0">
        <div className="position-relative d-flex align-items-center justify-content-center rounded-5 overflow-hidden shadow-lg p-5"
          style={{
            background: 'var(--surface-color)',
            border: '1px solid var(--glass-border)',
            minHeight: '350px'
          }}>

          {/* Decorative Glow elements */}
          <div className="position-absolute top-0 end-0 bg-primary bg-opacity-20 rounded-circle" style={{ width: '300px', height: '300px', filter: 'blur(80px)', marginTop: '-150px', marginRight: '-150px' }}></div>
          <div className="position-absolute bottom-0 start-0 bg-info bg-opacity-10 rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(100px)', marginBottom: '-200px', marginLeft: '-200px' }}></div>

          {/* Content Layer */}
          <div className="position-relative w-100" style={{ zIndex: 5 }}>
            <div className="row w-100 text-center align-items-center">
              <StatItem value={stats.contentCount} label="Premium Resources" icon="bi-journal-bookmark-fill" color="primary" />
              <StatItem value={stats.studentCount} label="Active Students" icon="bi-people-fill" color="success" />
              <StatItem value={stats.viewsCount} label="Total Views" icon="bi-eye-fill" color="warning" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Contributors/Uploaders Section
const ContributorSection = ({ uploaders }) => {
  if (!uploaders || uploaders.length === 0) return null;

  return (
    <section className="py-5 bg-light bg-opacity-50">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Our Top <span className="text-primary">Contributors</span></h2>
          <p className="text-muted">Passionate minds sharing knowledge with the community</p>
        </div>

        <div className="row g-4 justify-content-center">
          {uploaders.map((uploader) => (
            <div key={uploader._id} className="col-6 col-md-4 col-lg-2">
              <Link to={`/uploader/${uploader._id}`} className="text-decoration-none">
                <div className="uploader-card text-center d-flex flex-column align-items-center">
                  <div className="avatar-container position-relative d-inline-block mb-3">
                    <div className="rounded-circle overflow-hidden border border-4 border-white shadow-sm" style={{ width: '100px', height: '100px' }}>
                      {uploader.profileImage ? (
                        <img src={uploader.profileImage} alt={uploader.username} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <div className="w-100 h-100 bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                          <i className="bi bi-person-fill text-primary fs-1"></i>
                        </div>
                      )}
                    </div>
                    <div className="position-absolute bottom-0 end-0 bg-success border border-white border-2 rounded-circle" style={{ width: '15px', height: '15px' }}></div>
                  </div>
                  <h6 className="fw-bold mb-1 text-truncate px-2 text-dark">{uploader.username}</h6>
                  <p className="text-muted extra-small mb-3">{uploader.count} Uploads</p>
                  <div className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 small mt-auto">
                    View Profile
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  
  // Use TanStack Query hooks
  const { data: statsData, isLoading: statsLoading } = useStats();
  const { data: uploaders, isLoading: uploadersLoading } = useTopUploaders();
  const { data: nestedCategories, isLoading: categoriesLoading } = useNestedCategories();

  const stats = statsData || { contentCount: '...', studentCount: '...', viewsCount: '...' };
  const loading = statsLoading || uploadersLoading || categoriesLoading;

  // Dynamic CTA (Call to Action) button based on login status
  const CTALink = user ? "/dashboard" : "/signup";
  const CTAText = user ? "Go to Dashboard" : "Get Started Now";

  return (
    <div className="fade-in">
      <SEOHead isHomePage={true} />
      <div className="container mt-0">
        <AnnouncementBanner />
      </div>

      <div className="container-fluid mb-5 p-0 px-lg-3">
        <div className="hero-section text-center mesh-gradient rounded-bottom-5 py-5 py-md-5 overflow-hidden position-relative animate-fade-in">
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-black bg-opacity-10 d-dark-none"></div>
          <div className="container position-relative py-5" style={{ maxWidth: '900px', zIndex: 2 }}>
            <div className="badge border border-primary border-opacity-25 text-primary px-3 py-2 rounded-pill mb-4 animate-float glass-panel fw-bold shadow-sm" style={{ backgroundColor: 'var(--brand-50)' }}>
               🚀 The Ultimate College Resource Hub
            </div>
            <h1 className="hero-title gradient-text mb-4">
              Master Your Semesters <br className="d-none d-md-block" /> with GyanStack
            </h1>
            <p className="lead fw-medium mb-5 mx-auto" style={{ maxWidth: '650px', color: 'var(--text-secondary)' }}>
              Access premium study notes, essential assignments, and previous year question papers
              across all academic fields instantly. Don't study hard, study smartly.
            </p>
            <div className='d-flex justify-content-center gap-3 flex-wrap animate-float-slow'>
              <Link className="btn cta-gradient btn-lg px-5 py-3 rounded-pill fw-bold" to={CTALink} role="button">
                <i className={`bi ${user ? 'bi-grid-fill' : 'bi-lightning-fill'} me-2`}></i>
                {CTAText}
              </Link>
              <Link className="btn btn-white text-primary btn-lg fw-bold px-5 py-3 rounded-pill glass-panel shadow-sm border-0" to="/browse" role="button">
                Explore Content
              </Link>
            </div>
            <p className="mt-4 small text-muted fw-bold">Join {stats.studentCount || '...'} students scoring top grades.</p>
          </div>
        </div>
      </div>

      <section className="container py-5">
        <div className="text-center mb-5 fade-in">
          <h6 className="text-primary fw-bold text-uppercase tracking-wider">Features</h6>
          <h2 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>
            Why Students Choose GyanStack
          </h2>
          <p className="text-muted">High-quality resources tailored for BCA & MCA excellence.</p>
        </div>

        {/* Type 1: Core Platform Excellence */}
        <div className="row justify-content-center mb-5">
          <FeatureCard
            icon="bi-lightning-charge-fill"
            title="Exam Time Saver"
            text="Filter by 'IMP' tags. Perfect for last-minute revision. Stop wasting time finding notes!"
            colorClass="bg-gradient-1"
          />
          <FeatureCard
            icon="bi-cloud-download-fill"
            title="Unlimited Downloads"
            text="Directly download PDFs, eBooks, and assignments with zero restrictions."
            colorClass="bg-gradient-2"
          />
          <FeatureCard
            icon="bi-shield-check"
            title="Quality Verified"
            text="Every note and assignment is reviewed by our top contributors for accuracy and relevance."
            colorClass="bg-gradient-4"
          />
          <FeatureCard
            icon="bi-megaphone-fill"
            title="Ad-Free Forever"
            text="Focus entirely on your studies. No annoying popups or video ads to distract you from success."
            colorClass="bg-gradient-2"
          />
        </div>

        {/* Type 2: Premium Account Benefits */}
        <div className="text-center mb-5 mt-5 fade-in">
          <h4 className="fw-bold mb-3"><span className="text-primary"><i className="bi bi-star-fill me-2"></i></span>Unlock Premium Benefits</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>Join our community to access these exclusive member-only features designed for high-performance learning.</p>
        </div>

        <div className="row justify-content-center">
          <FeatureCard
            icon="bi-bookmark-star-fill"
            title="Save & Organize"
            text="Bookmark your favorite topics into your personalized dashboard for easy access."
            colorClass="bg-gradient-3"
          />
          <FeatureCard
            icon="bi-robot"
            title="Smart AI Assistant"
            text="Get instant study suggestions and document help from our specialized GyanStack AI."
            colorClass="bg-gradient-3"
          />
          <FeatureCard
            icon="bi-bell-fill"
            title="Instant Alerts"
            text="Get notified on your device immediately when new important notes are uploaded."
            colorClass="bg-gradient-1"
          />
          <FeatureCard
            icon="bi-people-fill"
            title="Community Powered"
            text="Join 1000+ students sharing and helping each other grow together."
            colorClass="bg-gradient-3"
          />
        </div>
      </section>

      <CategorizedContent nestedCategories={nestedCategories} />

      <section className="py-5 position-relative">
        <div className="container">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider mb-2">Workflow</h6>
            <h2 className="display-5 fw-bold gradient-text">
              3 Simple Steps to Success
            </h2>
          </div>
          <div className="row text-center">
            <div className="col-lg-4 mb-4">
              <div className="process-step glass-card h-100 p-4 p-md-5">
                <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm animate-pulse-glow" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-person-plus-fill fs-2 text-white"></i>
                </div>
                <h4 className="fw-bold mb-3">1. Join Community</h4>
                <p className="text-muted small">Create your account in 30 seconds and join our growing student network.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step glass-card h-100 p-4 p-md-5">
                <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm animate-pulse-glow" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-search-heart-fill fs-2 text-white"></i>
                </div>
                <h4 className="fw-bold mb-3">2. Find Topics</h4>
                <p className="text-muted small">Use smart search, tags or category tree to locate exactly what you need.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step glass-card h-100 p-4 p-md-5">
                <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm animate-pulse-glow" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-cloud-arrow-down-fill fs-2 text-white"></i>
                </div>
                <h4 className="fw-bold mb-3">3. Access Always</h4>
                <p className="text-muted small">View online, save for later, or download offline. Ad-free forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StatsSection stats={stats} />

      <ContributorSection uploaders={uploaders} />

      <section className="py-5 bg-primary bg-opacity-10 border-top border-bottom border-primary border-opacity-10">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <div className="badge bg-primary px-3 py-2 rounded-pill mb-3 fw-bold">📱 NEW: Application ACCESS</div>
              <h2 className="display-5 fw-bold mb-4">Study Anywhere with our <span className="text-primary">Native App</span></h2>
              <p className="lead text-muted mb-4">
                Don't let poor internet slow you down. Install our Web App on your Phone or Desktop to access your saved notes, even when you're offline!
              </p>
              <div className="row g-4 mb-5">
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-lightning-charge-fill fs-2 text-warning"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Faster Speed</h6>
                      <small className="text-muted">Loads instantly</small>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-globe2 fs-2 text-info"></i>
                    <div>
                      <h6 className="fw-bold mb-0">Stay Updated</h6>
                      <small className="text-muted">Internet is required</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="alert glass-panel border-primary border-opacity-25 p-4 text-start">
                <h6 className="fw-bold mb-3"><i className="bi bi-info-circle-fill me-2 text-primary"></i>How to Install:</h6>
                <ul className="small text-muted mb-0 ps-3">
                  <li className="mb-2"><b>On Desktop:</b> Look for the <b>"Install" icon</b> <i>(computer with arrow)</i> in the right side of your address bar.</li>
                  <li className="mb-2"><b>On Mobile:</b> Tap the <b>"Install App"</b> prompt or "Add to Home Screen" in your browser menu.</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative d-flex justify-content-center">
                {/* Decorative backgrounds */}
                <div className="position-absolute top-50 start-50 translate-middle bg-primary rounded-circle opacity-10" style={{ width: '400px', height: '400px', filter: 'blur(50px)' }}></div>

                {/* Mockup or App Icon Display */}
                <div className="glass-panel p-5 shadow-lg border-primary border-opacity-25 floating" style={{ maxWidth: '300px' }}>
                  <div className="text-center">
                    <div className="rounded-4 overflow-hidden mb-4 shadow-sm mx-auto" style={{ width: '120px', height: '120px' }}>
                      <img src="/logo.png" alt="GyanStack" className="w-100 h-100 object-fit-cover" />
                    </div>
                    <h4 className="fw-bold mb-1">GyanStack App</h4>
                    <p className="small text-muted mb-4">Your pocket study library</p>
                    <div className="d-flex justify-content-center gap-2">
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                    </div>
                    <hr className="my-4 opacity-10" />
                    <button
                      className="btn btn-primary w-100 rounded-pill py-2 shadow-sm"
                      onClick={() => window.dispatchEvent(new Event('trigger-pwa-install'))}
                    >
                      Get App Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 text-center fade-in">
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 className="display-5 fw-bold mb-3">
            Ready to Ace Your Exams?
          </h2>
          <p className="lead mb-5 text-muted">
            Don't delay. Sign up today and become part of the biggest library for BCA/MCA notes.
          </p>
          <Link className="btn cta-gradient btn-lg fw-bold px-5 py-4 rounded-pill fs-5 shadow-lg" to="/signup" role="button">
            <i className="bi bi-rocket-takeoff-fill me-2"></i> GET FREE ACCESS NOW
          </Link>
        </div>
      </section>

    </div>
  );
}
