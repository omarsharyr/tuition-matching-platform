// frontend/src/pages/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer
} from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [analytics] = useState({
    overview: {
      totalUsers: 1247,
      activeUsers: 892,
      totalPosts: 356,
      completedSessions: 1834,
      revenue: 125670,
      conversionRate: 12.5
    },
    userGrowth: [
      { date: '2024-01-01', students: 45, tutors: 23, total: 68 },
      { date: '2024-01-02', students: 52, tutors: 28, total: 80 },
      { date: '2024-01-03', students: 61, tutors: 31, total: 92 },
      { date: '2024-01-04', students: 58, tutors: 29, total: 87 },
      { date: '2024-01-05', students: 67, tutors: 34, total: 101 },
      { date: '2024-01-06', students: 73, tutors: 38, total: 111 },
      { date: '2024-01-07', students: 69, tutors: 36, total: 105 }
    ],
    topSubjects: [
      { name: 'Mathematics', sessions: 234, revenue: 45600, color: '#8884d8' },
      { name: 'Physics', sessions: 186, revenue: 38200, color: '#82ca9d' },
      { name: 'Chemistry', sessions: 154, revenue: 31800, color: '#ffc658' },
      { name: 'English', sessions: 142, revenue: 28400, color: '#ff7c7c' },
      { name: 'Biology', sessions: 98, revenue: 19600, color: '#8dd1e1' }
    ],
    revenueData: [
      { month: 'Jan', revenue: 18500, commission: 1850 },
      { month: 'Feb', revenue: 22300, commission: 2230 },
      { month: 'Mar', revenue: 19800, commission: 1980 },
      { month: 'Apr', revenue: 25600, commission: 2560 },
      { month: 'May', revenue: 28900, commission: 2890 },
      { month: 'Jun', revenue: 31200, commission: 3120 }
    ]
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [dateRange]);

  const formatCurrency = (amount) => `৳${amount.toLocaleString()}`;
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  if (loading) {
    return (
      <div className="analytics-container">
        <AdminSidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
        <div className={`analytics-content ${isSidebarCollapsed ? 'expanded' : 'normal'}`}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <h3>Loading Analytics...</h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <AdminSidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      
      <div className={`analytics-content ${isSidebarCollapsed ? 'expanded' : 'normal'}`}>
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h1>📊 Analytics Dashboard</h1>
            <p>Comprehensive insights and performance metrics</p>
          </div>
          <div className="header-right">
            <select 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
              className="date-range-selector"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="kpi-grid">
          <div className="kpi-card revenue">
            <div className="kpi-icon">💰</div>
            <div className="kpi-content">
              <h3>Total Revenue</h3>
              <div className="kpi-value">{formatCurrency(analytics.overview.revenue)}</div>
              <div className="kpi-change positive">+12.5% from last period</div>
            </div>
          </div>
          
          <div className="kpi-card users">
            <div className="kpi-icon">👥</div>
            <div className="kpi-content">
              <h3>Active Users</h3>
              <div className="kpi-value">{analytics.overview.activeUsers}</div>
              <div className="kpi-change positive">+8.3% from last period</div>
            </div>
          </div>
          
          <div className="kpi-card sessions">
            <div className="kpi-icon">📚</div>
            <div className="kpi-content">
              <h3>Completed Sessions</h3>
              <div className="kpi-value">{analytics.overview.completedSessions}</div>
              <div className="kpi-change positive">+15.2% from last period</div>
            </div>
          </div>
          
          <div className="kpi-card conversion">
            <div className="kpi-icon">🎯</div>
            <div className="kpi-content">
              <h3>Conversion Rate</h3>
              <div className="kpi-value">{analytics.overview.conversionRate}%</div>
              <div className="kpi-change negative">-2.1% from last period</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* User Growth Chart */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3>📈 User Growth Trends</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="tutors" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Subjects Pie Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>📚 Popular Subjects</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.topSubjects}
                    dataKey="sessions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.topSubjects.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Trends */}
          <div className="chart-card wide">
            <div className="chart-header">
              <h3>💵 Revenue & Commission Trends</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={3} />
                  <Line type="monotone" dataKey="commission" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="subjects-table-section">
          <h2>🏆 Subject Performance</h2>
          <div className="subjects-table">
            <div className="table-header">
              <div>Subject</div>
              <div>Sessions</div>
              <div>Revenue</div>
              <div>Avg per Session</div>
            </div>
            {analytics.topSubjects.map((subject, index) => (
              <div key={subject.name} className="table-row">
                <div className="subject-name">
                  <span 
                    className="subject-color" 
                    style={{ backgroundColor: subject.color }}
                  ></span>
                  {subject.name}
                </div>
                <div>{subject.sessions}</div>
                <div>{formatCurrency(subject.revenue)}</div>
                <div>{formatCurrency(Math.round(subject.revenue / subject.sessions))}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
