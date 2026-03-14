import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import api from '../../services/api';
import ContentCard from '../../components/ContentCard';
import { StatsSkeleton, CardSkeleton, ListSkeleton } from '../../components/SkeletonLoaders';
// Feature Card Component (Styling ke liye)
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

// --- CATEGORIZED CONTENT COMPONENT ---
// REFACTORED: Now shows a list of items instead of cards, limited to 5 per category.
const CategorizedContent = ({ setGlobalStats }) => {
  const [categories, setCategories] = useState([]);
  const [contentList, setContentList] = useState([]);
  const [stats, setStats] = useState({
    contentCount: '...',
    studentCount: '...',
    viewsCount: '...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, contentRes, statsRes] = await Promise.all([
          api.get('/categories/all-nested'),
          api.get('/content'),
          api.get('/auth/stats')
        ]);

        // Flatten categories to array for flexible lookup
        const flattenCats = (cats, acc = []) => {
          if (!cats) return acc;
          cats.forEach(c => {
            acc.push({ _id: c._id, name: c.name, parentId: c.parentId });
            if (c.children) flattenCats(c.children, acc);
          });
          return acc;
        };

        const catArray = flattenCats(catRes.data.categories);
        setCategories(catArray);
        setContentList(contentRes.data.content);
        setStats(statsRes.data);
        if (setGlobalStats) setGlobalStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch categorized content", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5">
        <div className="row g-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-lg-4 col-md-6 mb-3">
              <ListSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group content by only the immediate leaf category
  const grouped = contentList.reduce((acc, item) => {
    // Sirf item ki apni category find karein (Last sub-category)
    const cat = categories.find(c => c._id === item.categoryId);
    const catName = cat ? cat.name : 'Other Resources';
    const catId = cat ? cat._id : 'other';

    if (!acc[catName]) {
      acc[catName] = {
        id: catId,
        items: []
      };
    }

    // Check for duplicates (safety)
    if (!acc[catName].items.find(i => i._id === item._id)) {
      acc[catName].items.push(item);
    }

    return acc;
  }, {});

  const categoryEntries = Object.entries(grouped);
  if (categoryEntries.length === 0) return null;

  // Helper to get icon for list items
  const getSmallIcon = (type) => {
    if (type?.includes('pdf')) return 'bi-file-earmark-pdf text-danger';
    if (type?.includes('video')) return 'bi-play-circle text-info';
    if (type?.includes('image')) return 'bi-image text-success';
    if (type === 'link') return 'bi-link-45deg text-primary';
    if (type === 'note') return 'bi-sticky text-warning';
    return 'bi-file-earmark text-secondary';
  };

  return (
    <section className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-end mb-5 fade-in gap-4">
        <div className="text-center text-md-start">
          <h6 className="text-primary fw-bold text-uppercase tracking-wider">Explore Hub</h6>
          <h2 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Quick Access By Category</h2>
          <p className="text-muted mb-0">Browse the most recent 5 uploads across all our sections.</p>
        </div>
        <div className="flex-shrink-0">
          <Link to="/browse" className='btn btn-light btn-lg glass-card px-4 border-0 shadow-sm text-primary fw-bold rounded-pill'>
            <i className='bi bi-funnel-fill me-2'></i> Browse All
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {categoryEntries.map(([catName, data]) => (
          <div key={catName} className="col-lg-4 col-md-6 mb-3 fade-in">
            <div className="glass-card h-100 p-4 border-0 shadow-sm transition-hover">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 text-dark d-flex align-items-center">
                  <span className="p-2 bg-primary bg-opacity-10 rounded me-2">
                    <i className="bi bi-folder2-open text-primary"></i>
                  </span>
                  {catName}
                </h5>
                <span className="badge bg-light text-muted fw-normal">{data.items.length} items</span>
              </div>

              <div className="content-list-simple">
                {data.items.slice(0, 5).map(item => (
                  <Link
                    key={item._id}
                    to={`/content/${item._id}`}
                    className="d-flex align-items-center mb-2 text-decoration-none py-2 px-1 rounded hover-bg-light transition-all"
                  >
                    <i className={`bi ${getSmallIcon(item.type)} me-3 fs-5`}></i>
                    <span className="text-muted small text-truncate fw-medium" style={{ maxWidth: '100%' }}>
                      {item.title}
                    </span>
                  </Link>
                ))}
              </div>

              {data.items.length > 0 ? (
                <div className="mt-3 pt-3 border-top border-light">
                  <Link
                    to={`/browse?category=${data.id !== 'other' ? data.id : ''}`}
                    className="btn btn-sm btn-outline-primary rounded-pill w-100 fw-bold"
                  >
                    View All Resources <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                </div>
              ) : (
                <p className="text-muted small mt-2">No items found.</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Moving the Stats Section here to access the live state
const StatsSection = ({ stats }) => {
  const isLoading = stats.contentCount === '...';

  const StatItem = ({ value, label, icon, color }) => (
    <div className="col-md-4 mb-4 mb-md-0 px-lg-5">
      <div className="d-flex flex-column align-items-center">
        <div className={`d-flex align-items-center justify-content-center rounded-circle bg-${color} bg-opacity-10 mb-3 shadow-sm`}
          style={{ width: '75px', height: '75px', border: `2px dashed rgba(var(--bs-${color}-rgb), 0.5)` }}>
          <i className={`bi ${icon} text-${color} fs-1`}></i>
        </div>
        <h2 className="display-5 fw-bold mb-1 text-white">{value}</h2>
        <p className="text-white-50 fw-medium text-uppercase tracking-wider small mb-0">{label}</p>
      </div>
    </div>
  );

  return (
    <section className="py-5 overflow-hidden">
      <div className="container px-4 px-md-0">
        <div className="position-relative d-flex align-items-center justify-content-center rounded-5 overflow-hidden shadow-lg p-5"
          style={{
            background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
            minHeight: '350px'
          }}>

          {/* Decorative Glow elements */}
          <div className="position-absolute top-0 end-0 bg-primary bg-opacity-20 rounded-circle" style={{ width: '300px', height: '300px', filter: 'blur(80px)', marginTop: '-150px', marginRight: '-150px' }}></div>
          <div className="position-absolute bottom-0 start-0 bg-info bg-opacity-10 rounded-circle" style={{ width: '400px', height: '400px', filter: 'blur(100px)', marginBottom: '-200px', marginLeft: '-200px' }}></div>

          {/* Content Layer */}
          <div className="position-relative w-100" style={{ zIndex: 5 }}>
            {isLoading ? (
              <div className="w-100">
                <StatsSkeleton />
              </div>
            ) : (
              <div className="row w-100 text-center align-items-center">
                <StatItem value={stats.contentCount} label="Premium Resources" icon="bi-journal-bookmark-fill" color="info" />
                <StatItem value={stats.studentCount} label="Active Students" icon="bi-people-fill" color="success" />
                <StatItem value={stats.viewsCount} label="Total Views" icon="bi-eye-fill" color="warning" />
              </div>
            )}
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
              <div className="text-center h-100 p-3 transition-all hover-translate-y">
                <div className="position-relative d-inline-block mb-3">
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
                <h6 className="fw-bold mb-1 text-truncate px-2">{uploader.username}</h6>
                <p className="text-muted extra-small mb-3">{uploader.count} Uploads</p>
                <Link
                  to={`/uploader/${uploader._id}`}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 small"
                >
                  Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ contentCount: '...', studentCount: '...', viewsCount: '...' });
  const [uploaders, setUploaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [statsRes, uploadersRes] = await Promise.all([
          api.get('/auth/stats'),
          api.get('/auth/top-uploaders')
        ]);
        setStats(statsRes.data);
        setUploaders(uploadersRes.data.uploaders);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // Dynamic CTA (Call to Action) button based on login status
  const CTALink = user ? "/dashboard" : "/signup";
  const CTAText = user ? "Go to Dashboard" : "Get Started Now";

  return (
    <div className="fade-in">
      <div className="container mt-3">
        <AnnouncementBanner />
      </div>

      {/* 1. HERO SECTION (Stylish Gradient Header) */}
      <div className="container mb-5">
        <div className="hero-section text-white text-center">
          <div className="container" style={{ maxWidth: '850px' }}>
            <div className="badge border border-light text-primary px-3 py-2 rounded-pill mb-4 fade-in glass-panel fw-bold">🚀 The Ultimate College Resource Hub</div>
            <h1 className="hero-title">
              Master Your Semesters with GyanStack
            </h1>
            <p className="lead fw-normal mb-5 opacity-75 mx-auto" style={{ maxWidth: '600px' }}>
              Get access to premium BCA/MCA notes, most essential assignments, and previous year question papers instantly. Don't study hard, study smartly.
            </p>
            <div className='d-flex justify-content-center gap-3 flex-wrap fade-in'>
              <Link className="btn cta-gradient btn-lg px-5 py-3 rounded-pill" to={CTALink} role="button">
                <i className={`bi ${user ? 'bi-grid-fill' : 'bi-lightning-fill'} me-2`}></i>
                {CTAText}
              </Link>
              <Link className="btn btn-light text-primary btn-lg fw-bold px-5 py-3 rounded-pill glass-panel shadow-sm" to="/browse" role="button">
                Explore Content
              </Link>
            </div>
            <p className="mt-4 small text-white-50 fade-in">Join {stats.studentCount || '...'} students scoring top grades.</p>
          </div>
        </div>
      </div>

      {/* 2. WHY REGISTER / FEATURE SHOWCASE (Stylish Cards) */}
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
          <p className="text-muted mx-auto" style={{maxWidth: '600px'}}>Join our community to access these exclusive member-only features designed for high-performance learning.</p>
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
            text="Join 1000+ BCA/MCA students sharing and helping each other grow together."
            colorClass="bg-gradient-3"
          />
        </div>
      </section>

      {/* --- NEW SECTION: Categorized Content --- */}
      <CategorizedContent setGlobalStats={setStats} />
      {/* -------------------------------------- */}

      {/* 3. HOW IT WORKS / 3-STEP PROCESS */}
      <section className="py-5 position-relative">
        <div className="container">
          <div className="text-center mb-5">
            <h6 className="text-primary fw-bold text-uppercase">Workflow</h6>
            <h2 className="display-6 fw-bold">
              3 Simple Steps to Success
            </h2>
          </div>
          <div className="row text-center">
            <div className="col-lg-4 mb-4">
              <div className="process-step h-100">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-person-plus-fill display-5 text-primary"></i>
                </div>
                <h4 className="fw-bold">1. Join Community</h4>
                <p className="text-muted">Create your account in 30 seconds and join our growing student network.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step h-100">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-search-heart-fill display-5 text-success"></i>
                </div>
                <h4 className="fw-bold">2. Find Topics</h4>
                <p className="text-muted">Use smart search, tags or category tree to locate exactly what you need.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step h-100">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: '100px', height: '100px' }}>
                  <i className="bi bi-cloud-arrow-down-fill display-5 text-danger"></i>
                </div>
                <h4 className="fw-bold">3. Access Always</h4>
                <p className="text-muted">View online, save for later, or download offline. Ad-free forever.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & STATS (Glassmorphic) */}
      <StatsSection stats={stats} />

      {/* 5. TOP CONTRIBUTORS SECTION */}
      <ContributorSection uploaders={uploaders} />

      {/* 6. APP PROMOTION SECTION */}
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

      {/* 5. FINAL CTA BLOCK */}
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
