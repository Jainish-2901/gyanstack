import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import AnnouncementBanner from '../../components/AnnouncementBanner'; 
import api from '../../services/api'; 
import ContentCard from '../../components/ContentCard';
// Mock stats for demonstration until actual data is loaded
const MOCK_STATS = {
  contentCount: '20+',
  studentCount: '50+',
  downloadCount: '100+'
};

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
const CategorizedContent = () => {
  const [categories, setCategories] = useState({});
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, contentRes] = await Promise.all([
          api.get('/categories/all-nested'),
          api.get('/content')
        ]);
        
        // Flatten categories to mapping for easy lookup
        const flattenCats = (cats, acc = {}) => {
            if(!cats) return acc;
            cats.forEach(c => {
                acc[c._id] = c.name;
                if(c.children) flattenCats(c.children, acc);
            });
            return acc;
        };
        
        const catMap = flattenCats(catRes.data.categories);
        setCategories(catMap);
        setContentList(contentRes.data.content);
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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading content...</span>
        </div>
      </div>
    );
  }

  // Group content by categoryId
  const grouped = contentList.reduce((acc, item) => {
    const catName = categories[item.categoryId] || 'Other Resources';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  // Remove empty categories (just in case)
  const categoryEntries = Object.entries(grouped);
  if (categoryEntries.length === 0) return null;

  return (
    <section className="container py-5">
      <div className="text-center mb-5 fade-in">
        <h6 className="text-primary fw-bold text-uppercase tracking-wider">Explore Hub</h6>
        <h2 className="display-6 fw-bold" style={{ color: 'var(--text-primary)' }}>Recent Uploads By Category</h2>
      </div>

      {categoryEntries.map(([catName, items]) => (
        <div key={catName} className="mb-5 fade-in">
          <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
            <h4 className="fw-bold mb-0" style={{ color: 'var(--primary)' }}>
              <i className="bi bi-folder2-open me-2"></i>
              {catName}
            </h4>
            <Link to="/browse" className="btn btn-link text-decoration-none fw-bold p-0">
              View All <i className="bi bi-arrow-right-short ms-1"></i>
            </Link>
          </div>
          
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-4 g-3 g-md-4">
            {items.slice(0, 4).map(item => (
              <div key={item._id} className="col d-flex">
                <ContentCard item={item} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default function Home() {
  const { user } = useAuth();
  
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
          <div className="container" style={{maxWidth: '850px'}}>
            <div className="badge border border-light text-primary px-3 py-2 rounded-pill mb-4 fade-in glass-panel fw-bold">🚀 The Ultimate College Resource Hub</div>
            <h1 className="hero-title">
              Master Your Semesters with GyanStack
            </h1>
            <p className="lead fw-normal mb-5 opacity-75 mx-auto" style={{maxWidth: '600px'}}>
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
            <p className="mt-4 small text-white-50 fade-in">Join {MOCK_STATS.studentCount} students scoring top grades.</p>
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
        </div>
        <div className="row justify-content-center">
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
            icon="bi-bookmark-star-fill"
            title="Save & Organize"
            text="Bookmark your favorite topics into your personalized dashboard for easy access."
            colorClass="bg-gradient-3"
          />
          <FeatureCard
            icon="bi-bell-fill"
            title="Instant Alerts"
            text="Get notified on your device immediately when new important notes are uploaded."
            colorClass="bg-gradient-4"
          />
        </div>
        <div className="text-center mt-5 fade-in">
          <Link to="/browse" className='btn btn-light btn-lg glass-card px-5 border-0 shadow-sm text-primary fw-bold rounded-pill'>
            <i className='bi bi-funnel-fill me-2'></i> Browse By Category
          </Link>
        </div>
      </section>

      {/* --- NEW SECTION: Categorized Content --- */}
      <CategorizedContent />
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
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-4 mb-4">
                  <i className="bi bi-person-plus-fill display-5 text-primary"></i>
                </div>
                <h4 className="fw-bold">1. Join Community</h4>
                <p className="text-muted">Create your account in 30 seconds and join our growing student network.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step h-100">
                <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex p-4 mb-4">
                  <i className="bi bi-search-heart-fill display-5 text-success"></i>
                </div>
                <h4 className="fw-bold">2. Find Topics</h4>
                <p className="text-muted">Use smart search, tags or category tree to locate exactly what you need.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step h-100">
                <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex p-4 mb-4">
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
      <section className="py-5">
        <div className="container">
          <div className="glass-panel p-5 text-center position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,27,75,0.9) 100%)' }}>
            <div className="row text-white position-relative" style={{ zIndex: 2 }}>
              <div className="col-md-4 mb-4 mb-md-0">
                <div className="p-3">
                  <h2 className="display-3 fw-bolder mb-2 text-info">{MOCK_STATS.contentCount}</h2>
                  <p className="lead opacity-75">Resources Uploaded</p>
                </div>
              </div>
              <div className="col-md-4 mb-4 mb-md-0 border-start border-end border-light border-opacity-25">
                <div className="p-3">
                  <h2 className="display-3 fw-bolder mb-2 text-success">{MOCK_STATS.studentCount}</h2>
                  <p className="lead opacity-75">Satisfied Students</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3">
                  <h2 className="display-3 fw-bolder mb-2 text-warning">{MOCK_STATS.downloadCount}</h2>
                  <p className="lead opacity-75">Total Downloads</p>
                </div>
              </div>
            </div>
            {/* Background glowing orb */}
            <div className="position-absolute top-50 start-50 translate-middle rounded-circle bg-primary" style={{ width: '400px', height: '400px', filter: 'blur(100px)', opacity: '0.3', zIndex: 1 }}></div>
          </div>
        </div>
      </section>
      
      {/* 5. FINAL CTA BLOCK */}
      <section className="py-5 text-center fade-in">
        <div className="container" style={{maxWidth: '700px'}}>
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
