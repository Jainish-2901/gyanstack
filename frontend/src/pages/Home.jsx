import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import AnnouncementBanner from '../components/AnnouncementBanner'; 
import api from '../services/api'; 

// Mock stats for demonstration until actual data is loaded
const MOCK_STATS = {
  contentCount: '20+',
  studentCount: '50+',
  downloadCount: '100+'
};

// Feature Card Component (Styling ke liye)
const FeatureCard = ({ icon, title, text, color }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div className={`feature-card shadow-lg h-100 border-0 rounded-xl p-4 text-center hover-scale transition-all duration-300`} style={{ backgroundColor: '#ffffff' }}>
      <div className={`icon-circle mx-auto mb-3 text-white ${color}`}>
        <i className={`bi ${icon} fs-3`}></i>
      </div>
      <h5 className="fw-bold text-dark">{title}</h5>
      <p className="text-muted small">{text}</p>
    </div>
  </div>
);

export default function Home() {
  const { user } = useAuth();
  
  // Dynamic CTA (Call to Action) button based on login status
  const CTALink = user ? "/dashboard" : "/signup";
  const CTAText = user ? "Go to Dashboard" : "Get Started Now (Free)";
  
  return (
    <div className="fade-in">
      {/* 1. HERO SECTION (Stylish Gradient Header) */}
      <div className="hero-section text-white text-center py-5 rounded-3xl shadow-2xl mb-5">
        <div className="container" style={{maxWidth: '800px'}}>
          <h1 className="display-3 fw-bolder mb-3">
            GyanStack: Your College Study Partner
          </h1>
          <p className="lead fw-normal mb-5">
            BCA/MCA ke saare IMP notes, assignments, aur PYQs - seedhe aapke screen par. Padhai ko aasaan banao!
          </p>
          <div className='d-flex justify-content-center gap-3'>
            <Link className="btn cta-gradient btn-lg fw-bold px-5 py-3" to={CTALink} role="button">
              <i className={`bi ${user ? 'bi-grid-fill' : 'bi-person-plus-fill'} me-2`}></i>
              {CTAText}
            </Link>
            {/* --- SECONDARY CTA BUTTON --- */}
            <Link className="btn btn-outline-light btn-lg fw-bold px-5 py-3" to="/browse" role="button">
              Browse All Notes
            </Link>
            {/* --------------------------- */}
          </div>
          <p className="mt-3 small text-white-50">Already {MOCK_STATS.studentCount} students are using it.</p>
        </div>
      </div>

      {/* 2. WHY REGISTER / FEATURE SHOWCASE (Stylish Cards) */}
      <section className="container py-5">
        <AnnouncementBanner /> {/* Announcement banner yahaan dikhega */}
        <h2 className="display-6 fw-bold text-center mb-5" style={{ color: '#0056b3' }}>
          Why Students Choose GyanStack
        </h2>
        <div className="row justify-content-center">
          <FeatureCard
            icon="bi-lightning-charge-fill"
            title="Exam Time Saver"
            text="Sirf 'IMP' tags se filter karein. Last-minute revision ke liye perfect. Time waste karna band!"
            color="bg-warning-gradient"
          />
          <FeatureCard
            icon="bi-cloud-download-fill"
            title="Unlimited Downloads"
            text="Notes, eBooks, aur assignments ko seedhe download karein. Download count bhi track hota hai."
            color="bg-success-gradient"
          />
          <FeatureCard
            icon="bi-bookmark-star-fill"
            title="Save & Organize"
            text="Apne favourite topics ko 'Save' karke rakhein. Personal dashboard mein akele padhein."
            color="bg-primary-gradient"
          />
          <FeatureCard
            icon="bi-bell-fill"
            title="Instant Notifications"
            text="Jab naya IMP note ya announcement upload ho, to turant phone/laptop par notification paayein."
            color="bg-danger-gradient"
          />
        </div>
        <div className="text-center mt-4">
          <Link to="/browse" className='btn btn-outline-secondary'>
            <i className='bi bi-funnel-fill me-2'></i> Browse Content By Category
          </Link>
        </div>
      </section>
      
      {/* 3. HOW IT WORKS / 3-STEP PROCESS */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="display-6 fw-bold text-center mb-5 text-primary" style={{ color: '#343a40' }}>
            How It Works in 3 Simple Steps
          </h2>
          <div className="row text-center process-flow">
            <div className="col-lg-4 mb-4">
              <div className="process-step p-4 shadow-md rounded-lg bg-white h-100">
                <i className="bi bi-person-plus-fill fs-1 text-primary mb-3"></i>
                <h4 className="fw-bold">1. Register / Log In</h4>
                <p className="text-muted">Apna account 30 seconds mein banaayein ya existing account se login karein.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step p-4 shadow-md rounded-lg bg-white h-100">
                <i className="bi bi-search-heart-fill fs-1 text-success mb-3"></i>
                <h4 className="fw-bold">2. Find Your Topic</h4>
                <p className="text-muted">Advanced search, tags, ya category tree ka upyog karke zaroori content khojein.</p>
              </div>
            </div>
            <div className="col-lg-4 mb-4">
              <div className="process-step p-4 shadow-md rounded-lg bg-white h-100">
                <i className="bi bi-download fs-1 text-danger mb-3"></i>
                <h4 className="fw-bold">3. Save & Download</h4>
                <p className="text-muted">Content ko save karein, like karein, aur bina kisi limit ke download karein.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & STATS (Animated Counter Mock) */}
      <section className="py-5 trust-stats-section">
        <div className="container">
          <div className="row text-white text-center">
            <div className="col-md-4 mb-4">
              <div className="stat-box p-4 rounded-lg shadow-lg">
                <h2 className="display-4 fw-bolder mb-1">{MOCK_STATS.contentCount}</h2>
                <p className="lead">Notes & Resources Uploaded</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-box p-4 rounded-lg shadow-lg">
                <h2 className="display-4 fw-bolder mb-1">{MOCK_STATS.studentCount}</h2>
                <p className="lead">Satisfied Students</p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="stat-box p-4 rounded-lg shadow-lg">
                <h2 className="display-4 fw-bolder mb-1">{MOCK_STATS.downloadCount}</h2>
                <p className="lead">Total Downloads Completed</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* 5. FINAL CTA BLOCK (Bada, Final Call) */}
      <section className="py-5 text-center">
        <div className="container" style={{maxWidth: '700px'}}>
          <h2 className="display-5 fw-bold mb-3" style={{ color: '#007bff' }}>
            Ready to Ace Your Exams?
          </h2>
          <p className="lead mb-4 text-muted">
            Der mat kijiye. Aaj hi sign up karein aur BCA/MCA notes ke sabse bade library ka hissa banein.
          </p>
          <Link className="btn cta-gradient btn-lg fw-bold px-5 py-3" to="/signup" role="button">
            <i className="bi bi-person-plus-fill me-2"></i> SIGN UP FOR FREE ACCESS
          </Link>
        </div>
      </section>

    </div>
  );
}