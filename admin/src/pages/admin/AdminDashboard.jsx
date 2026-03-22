import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
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
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Zaroori: plugin for counting on bars

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels // Registering the counting plugin
);

const MetricTile = ({ title, value, icon, color }) => (
  <div className="col-6 col-md-3">
    <div className="card border-0 shadow-sm rounded-4 h-100 transition-hover">
      <div className="card-body p-2 p-md-3 d-flex align-items-center">
        <div
          className={`rounded-circle bg-${color} bg-opacity-10 d-flex align-items-center justify-content-center text-${color} me-2 me-md-3`}
          style={{ width: '45px', height: '45px', minWidth: '45px' }}
        >
          <i className={`bi ${icon} fs-5`}></i>
        </div>
        <div className="flex-grow-1 overflow-hidden text-start">
          <h6 className="text-muted extra-small text-uppercase fw-bold mb-0 text-truncate">{title}</h6>
          <h4 className="fw-bold mb-0 text-dark">{value?.toLocaleString() || 0}</h4>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/admin/stats?period=${period}`);
        setStats(data);
      } catch (err) {
        setError('Connection failed. Please check server status.');
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, [period]);

  const engagementChart = useMemo(() => {
    if (!stats) return null;
    return {
      labels: ['Likes', 'Saves', 'Downloads', 'Views'],
      datasets: [{
        data: [stats.totalLikes || 0, stats.totalSaves || 0, stats.totalDownloads || 0, stats.totalViews || 0],
        backgroundColor: ['#FF6384', '#4BC0C0', '#FFCE56', '#36A2EB'],
        borderRadius: 8,
        barThickness: 40, // Increased thickness for wide view
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
          backgroundColor: ['#EA4335', '#0D6EFD'],
          borderWidth: 0,
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
          <h5 className="fw-bold text-dark mb-0">Platform Pulse</h5>
          <small className="text-muted extra-small">Real-time engagement tracking</small>
        </div>

        {/* UPDATED DROPDOWN STYLING */}
        <div className="d-flex align-items-center bg-white border border-light-subtle rounded-pill px-3 py-1 shadow-sm transition-hover"
          style={{ minWidth: '180px', transition: 'all 0.2s ease' }}>
          <i className="bi bi-calendar3 text-primary me-2 small"></i>
          <select
            className="form-select form-select-sm fw-bold text-dark shadow-none bg-transparent p-0"
            style={{ fontSize: '0.85rem', cursor: 'pointer', border: 'none', outline: 'none', backgroundImage: 'none' }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="all">Total Lifetime</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>
          <i className="bi bi-chevron-down small text-muted ms-1" style={{ fontSize: '0.7rem' }}></i>
        </div>
      </div>

      {/* METRIC TILES GRID */}
      <div className="row g-2 g-md-3 mb-4">
        <MetricTile title="Total Uploads" value={stats.totalUploads} icon="bi-cloud-arrow-up-fill" color="primary" />
        <MetricTile title="Total Users" value={stats.totalUsers} icon="bi-people-fill" color="success" />
        <MetricTile title="Google Sync" value={stats.googleUsersCount} icon="bi-google" color="danger" />
        <MetricTile title="Manual Entry" value={stats.manualUsersCount} icon="bi-person-badge-fill" color="dark" />
        <MetricTile title="Total Views" value={stats.totalViews} icon="bi-eye-fill" color="secondary" />
        <MetricTile title="Total Likes" value={stats.totalLikes} icon="bi-heart-fill" color="danger" />
        <MetricTile title="Total Saves" value={stats.totalSaves} icon="bi-bookmark-star-fill" color="success" />
        <MetricTile title="Downloads" value={stats.totalDownloads} icon="bi-download" color="warning" />
      </div>

      <div className="row g-3">
        {/* FULL WIDTH ACTION DISTRIBUTION CHART */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4">
              <h6 className="fw-bold mb-4 small text-uppercase text-muted">Action Distribution Analysis</h6>
              <div style={{ height: '350px' }}>
                <Bar
                  data={engagementChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      datalabels: { // Count display logic
                        anchor: 'end',
                        align: 'top',
                        formatter: (value) => value.toLocaleString(),
                        font: { weight: 'bold', size: 12 },
                        color: '#475569'
                      }
                    },
                    scales: {
                      y: { display: false }, // Hiding Y axis to make it cleaner since we have labels
                      x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LOGIN SOURCE */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <h6 className="fw-bold small text-uppercase text-muted mb-4">Traffic Channel</h6>
              <div style={{ height: '180px', position: 'relative' }}>
                <Doughnut
                  data={authDistribution.chartData}
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { display: false } } }}
                />
                <div className="chart-center-label text-center">
                  <h3 className="fw-bold mb-0 text-dark">{authDistribution.percentage}%</h3>
                  <small className="text-muted extra-small fw-bold">GOOGLE</small>
                </div>
              </div>
              <div className="mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-bold text-muted extra-small"><i className="bi bi-circle-fill text-danger me-1"></i> Google</small>
                  <small className="fw-bold">{stats.googleUsersCount}</small>
                </div>
                <div className="d-flex justify-content-between">
                  <small className="fw-bold text-muted extra-small"><i className="bi bi-circle-fill text-primary me-1"></i> Manual</small>
                  <small className="fw-bold">{stats.manualUsersCount}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SYSTEM VITALITY */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h6 className="fw-bold small text-uppercase text-muted mb-0">System Vitality</h6>
                <span className="badge bg-success bg-opacity-10 text-success extra-small rounded-pill">OPTIMIZED</span>
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
                      <small className="extra-small fw-bold text-dark">{item.label}</small>
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
      </div>

      <style>{`
        .extra-small { font-size: 0.65rem; letter-spacing: 0.3px; }
        .chart-center-label { position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); }
        .transition-hover:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
      `}</style>
    </div>
  );
}