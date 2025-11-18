import React, { useState, useEffect } from 'react';
import api from '../services/api'; // FIX: Absolute path (assuming src root)
import LoadingScreen from '../components/LoadingScreen'; // FIX: Absolute path
import DashboardLayout from '../components/DashboardLayout'; // <-- Layout Import
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

// Chart.js components ko register karein (ZAROORI)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chhota helper component (Stat Card)
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="col-md-4 col-sm-6">
    <div className="card shadow-lg border-0 h-100 rounded-lg">
      <div className="card-body d-flex align-items-center">
        <div className={`fs-1 ${colorClass} me-3`}>
          <i className={`bi ${icon}`}></i>
        </div>
        <div>
          <h5 className="card-title text-muted mb-1">{title}</h5>
          <p className="card-text h2 fw-bold mb-0">{value}</p>
        </div>
      </div>
    </div>
  </div>
);


export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // --- NAYA STATE: Time Filter ---
  const [period, setPeriod] = useState('all'); // FIX: Default 'all' rakhte hain
  // -----------------------------

  // Chart data ke liye state
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // API call: Period ko API call me bhejein
        const { data } = await api.get(`/admin/stats?period=${period}`);
        
        setStats(data);
        
        // Chart ka label period ke hisaab se update karein
        const label = period === 'all' ? 'All Time Engagement' : `Engagement (Last ${period})`;

        // Chart ka data prepare karein
        setChartData({
          labels: ['Likes', 'Saves', 'Downloads', 'Views'],
          datasets: [
            {
              label: label, 
              data: [
                data.totalLikes,
                data.totalSaves,
                data.totalDownloads,
                data.totalViews,
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.8)', // Red (Likes)
                'rgba(75, 192, 192, 0.8)', // Green (Saves)
                'rgba(255, 206, 86, 0.8)', // Yellow (Downloads)
                'rgba(54, 162, 235, 0.8)', 	// Blue (Views)
              ],
            },
          ],
        });
        
      } catch (err) {
        setError('Failed to load dashboard data. Check API/Server logs.');
        console.error(err);
      }
      setLoading(false);
    };
    fetchStats();
  // Dependency array me 'period' add karein
  }, [period]); 

  if (loading) {
    return <LoadingScreen text="Loading dashboard analytics..." />;
  }

  if (error) {
    return (
      <div className="container">
        <h1 className="display-5 fw-bold mb-4">Admin Dashboard</h1>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!stats) return null;

  // --- DASHBOARD LAYOUT MEIN WRAP KAREIN ---
  return (
    <DashboardLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="display-5 fw-bold" style={{color: '#0056b3'}}>
          Analytics Dashboard
        </h1>
        
        {/* --- NAYA FILTER DROPDOWN --- */}
        <div className="filter-select">
          <select 
            className="form-select form-select-sm" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            style={{minWidth: '150px'}}
          >
            {/* --- NAYA OPTION ADD HUA --- */}
            <option value="all">All Over (Total)</option>
            {/* --------------------------- */}
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="year">Past Year</option>
          </select>
        </div>
        {/* ---------------------------- */}
      </div>
      
      {/* Stat Cards */}
      <div className="row g-4 mb-4">
        {/* Note: Total Uploads aur Total Users hamesha All Time data hi dikhayenge, isliye yahaan date filter ka impact kam hai. */}
        <StatCard title="Total Uploads" value={stats.totalUploads} icon="bi-cloud-arrow-up-fill" colorClass="text-primary" />
        <StatCard title="Total Users" value={stats.totalUsers} icon="bi-people-fill" colorClass="text-success" />
        {/* Views, Likes, Saves, Downloads filter ke hisaab se update honge */}
        <StatCard title="Views" value={stats.totalViews} icon="bi-eye-fill" colorClass="text-info" />
        <StatCard title="Likes" value={stats.totalLikes} icon="bi-heart-fill" colorClass="text-danger" />
        <StatCard title="Saves" value={stats.totalSaves} icon="bi-bookmark-fill" colorClass="text-success" />
        <StatCard title="Downloads" value={stats.totalDownloads} icon="bi-download" colorClass="text-warning" />
      </div>
      
      {/* Charts */}
      {chartData && (
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body">
                <h5 className="card-title">{chartData.datasets[0].label}</h5>
                <Bar 
                  data={chartData} 
                  options={{ responsive: true, plugins: { legend: { display: false } } }} 
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            {/* Doughnut Chart ke liye naya data object banaayein */}
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body">
                <h5 className="card-title">Engagement Split (Excluding Views)</h5>
                <Doughnut 
                  data={{
                    labels: ['Likes', 'Saves', 'Downloads'],
                    datasets: [
                      {
                        label: 'Total Engagement',
                        data: [stats.totalLikes, stats.totalSaves, stats.totalDownloads],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.9)', 
                            'rgba(75, 192, 192, 0.9)', 
                            'rgba(255, 206, 86, 0.9)',
                        ],
                        hoverOffset: 4
                      }
                    ]
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}