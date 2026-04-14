import React, { useState, useMemo } from 'react';
import { useAdminStats } from '../../hooks/useAdminStats';
import LoadingScreen from '../../components/LoadingScreen';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, metricVariants } from '../../utils/animations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const MetricTile = ({ title, value, icon, color }) => (
  <motion.div className="col-6 col-md-3" variants={metricVariants}>
    <div className="glass-card shadow-sm h-100 transition-hover">
      <div className="card-body p-2 p-md-3 d-flex align-items-center">
        <div
          className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center text-${color} me-2 me-md-3 shadow-sm`}
          style={{ width: '45px', height: '45px', minWidth: '45px' }}
        >
          <i className={`bi ${icon} fs-5`}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden text-start">
          <h6 className="text-muted extra-small text-uppercase fw-bold mb-1 text-truncate tracking-wider">{title}</h6>
          <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{value?.toLocaleString() || 0}</h4>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const [period, setPeriod] = useState('all');
  
  const { 
    data: stats, 
    isLoading: loading, 
    error: fetchError 
  } = useAdminStats(period);

  const error = fetchError ? 'Connection failed. Please check server status.' : '';

  const engagementChart = useMemo(() => {
    if (!stats) return null;
    return {
      labels: ['Likes', 'Saves', 'Downloads', 'Views'],
      datasets: [{
        data: [stats.totalLikes || 0, stats.totalSaves || 0, stats.totalDownloads || 0, stats.totalViews || 0],
        backgroundColor: ['#14b8a6', '#10b981', '#34d399', '#0ea5e9'],
        hoverBackgroundColor: ['#0d9488', '#059669', '#10b981', '#0284c7'],
        borderRadius: 8,
        barThickness: 35,
      }]
    };
  }, [stats]);

  const authDistribution = useMemo(() => {
    if (!stats) return null;
    const google = stats.googleUsersCount || 0;
    const manual = stats.manualUsersCount || 0;
    const total = google + manual || 1;
    return {
      percentage: ((google / total) * 100).toFixed(0),
      chartData: {
        labels: ['Google Sync', 'Manual Entry'],
        datasets: [{
          data: [google, manual],
          backgroundColor: ['#10b981', '#14b8a6'],
          borderWidth: 0,
          weight: 0.5,
          cutout: '75%',
        }]
      }
    };
  }, [stats]);

  if (loading) return <LoadingScreen text="Analyzing Platform Data..." />;
  if (error) return <div className="alert alert-danger m-4 rounded-4">{error}</div>;
  if (!stats) return null;

  return (
    <div className="container-fluid py-3 px-2 overflow-x-hidden">

      {/* HEADER SECTION */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-1">
        <div>
          <h4 className="fw-bold mb-0" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            <i className="bi bi-activity text-primary me-2"></i>Platform Pulse
          </h4>
          <small className="text-muted extra-small tracking-wider text-uppercase">Real-time engagement tracking</small>
        </div>

        <div className="d-flex align-items-center glass-panel rounded-pill px-3 py-1 shadow-sm transition-hover border"
          style={{ minWidth: '180px', transition: 'all 0.2s ease' }}>
          <i className="bi bi-calendar3 text-primary me-2 small"></i>
          <select
            className="form-select form-select-sm fw-bold shadow-none bg-transparent p-0 border-0"
            style={{ fontSize: '0.85rem', cursor: 'pointer', outline: 'none', backgroundImage: 'none', color: 'var(--text-primary)' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all" className={period === 'all' ? 'text-primary' : ''}>Total Lifetime</option>
            <option value="week" className={period === 'week' ? 'text-primary' : ''}>Past Week</option>
            <option value="month" className={period === 'month' ? 'text-primary' : ''}>Past Month</option>
          </select>
          <i className="bi bi-chevron-down small text-muted ms-1" style={{ fontSize: '0.7rem' }}></i>
        </div>
      </div>

      {/* METRIC TILES GRID */}
      <motion.div 
        className="row g-2 g-md-3 mb-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <MetricTile title="Total Uploads" value={stats.totalUploads} icon="bi-cloud-arrow-up-fill" color="primary" />
        <MetricTile title="Total Users" value={stats.totalUsers} icon="bi-people-fill" color="success" />
        <MetricTile title="Google Sync" value={stats.googleUsersCount} icon="bi-google" color="danger" />
        <MetricTile title="Manual Entry" value={stats.manualUsersCount} icon="bi-person-badge-fill" color="dark" />
        <MetricTile title="Total Views" value={stats.totalViews} icon="bi-eye-fill" color="secondary" />
        <MetricTile title="Total Likes" value={stats.totalLikes} icon="bi-heart-fill" color="danger" />
        <MetricTile title="Total Saves" value={stats.totalSaves} icon="bi-bookmark-star-fill" color="success" />
        <MetricTile title="Downloads" value={stats.totalDownloads} icon="bi-download" color="warning" />
      </motion.div>

      <motion.div className="row g-3" variants={fadeInUp} initial="initial" animate="animate">
        {/* FULL WIDTH ACTION DISTRIBUTION CHART */}
        <div className="col-12">
          <div className="glass-card shadow-sm border-0">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4 small text-uppercase text-muted tracking-wider">Action Distribution Analysis</h6>
              <div style={{ height: '360px' }}>
                <Bar
                  data={engagementChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      datalabels: {
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => value.toLocaleString(),
                        font: { weight: 'bold', size: 12 },
                        color: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#94a3b8' : '#475569'
                      }
                    },
                    scales: {
                      y: { 
                        display: false, 
                        grace: '15%'
                      },
                      x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="glass-card shadow-sm h-100 border-0">
            <div className="card-body p-4">
              <h6 className="fw-bold small text-uppercase text-muted mb-4 tracking-wider">Traffic Channel</h6>
              <div style={{ height: '180px', position: 'relative' }}>
                <Doughnut
                  data={authDistribution.chartData}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { display: false } } }}
                />
                <div className="chart-center-label text-center">
                  <h3 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{authDistribution.percentage}%</h3>
                  <small className="text-muted extra-small fw-bold">GOOGLE</small>
                </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-bold text-muted extra-small"><i className="bi bi-circle-fill text-danger me-1" style={{ color: '#10b981 !important' }}></i> Google Sync</small>
                  <small className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.googleUsersCount}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="fw-bold text-muted extra-small"><i className="bi bi-circle-fill text-primary me-1" style={{ color: '#14b8a6 !important' }}></i> Manual Entry</small>
                  <small className="fw-bold" style={{ color: 'var(--text-primary)' }}>{stats.manualUsersCount}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="glass-card shadow-sm h-100 border-0">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold small text-uppercase text-muted mb-0 tracking-wider">System Vitality</h6>
                <span className="badge bg-primary bg-opacity-10 text-primary extra-small rounded-pill px-3">OPTIMIZED</span>
              </div>
              <div className="row g-4">
                {[
                  { label: 'Interaction Rate', color: 'danger', val: stats.totalViews > 0 ? (stats.totalLikes / stats.totalViews) * 100 : 0 },
                  { label: 'Retention Power', color: 'success', val: stats.totalViews > 0 ? (stats.totalSaves / stats.totalViews) * 100 : 0 },
                  { label: 'Platform Reach', color: 'primary', val: stats.totalUsers > 0 ? (stats.totalViews / stats.totalUsers) * 10 : 0 },
                  { label: 'Cloud Stability', color: 'info', val: 100 }
                ].map((item, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="d-flex align-items-center mb-2">
                      <small className="extra-small fw-bold" style={{ color: 'var(--text-primary)' }}>{item.label}</small>
                      <span className="ms-auto extra-small fw-bold text-muted">{item.val.toFixed(1)}%</span>
                    </div>
                    <div className="progress rounded-pill mb-1" style={{ height: '6px' }}>
                      <div className={`progress-bar progress-bar-striped progress-bar-animated bg-${item.color}`} style={{ width: `${item.val > 100 ? 100 : item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .extra-small { font-size: 0.65rem; letter-spacing: 0.3px; }
        .chart-center-label { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
      `}</style>
    </div>
  );
}