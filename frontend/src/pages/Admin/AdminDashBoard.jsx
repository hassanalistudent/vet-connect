// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, lazy, Suspense } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetAdminDashboardQuery,
  useGetVerificationQueueQuery,
  useGetTopDoctorsQuery,
  useRefreshAdminDashboardMutation
} from "../../redux/api/dashboardApiSlice";
import { 
  FaUsers, 
  FaUserMd, 
  FaPaw, 
  FaCalendarCheck, 
  FaStar, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBell,
  FaChevronRight,
  FaChartLine,
  FaRegClock,
  FaUserCircle,
  FaIdCard,
  FaShieldAlt,
  FaMoneyBill,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaQuoteRight,
  FaHome,
  FaVideo,
  FaClinicMedical
} from "react-icons/fa";

// Lazy load chart components
const Line = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Line })));
const Doughnut = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));

// Chart.js registration
const registerChartJS = async () => {
  const {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
  } = await import('chart.js');
  
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
  );
};

// Chart loader component
const ChartLoader = () => (
  <div className="h-64 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-navigray/30 border-t-navigray rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">Loading chart...</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [chartsReady, setChartsReady] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetAdminDashboardQuery({period:selectedPeriod});
  const { data: verificationData, isLoading: isVerificationLoading } = useGetVerificationQueueQuery({ page: 1, limit: 5 });
  const { data: topDoctorsData, isLoading: isTopDoctorsLoading } = useGetTopDoctorsQuery({ limit: 5 });
  const [refreshDashboard, { isLoading: isRefreshing }] = useRefreshAdminDashboardMutation();

  // Register Chart.js
  useEffect(() => {
    registerChartJS().then(() => setChartsReady(true));
  }, []);

  const dashboard = dashboardData?.data || {};
  const overview = dashboard.overview || {};
  const appointments = dashboard.appointments || {};
  const ratings = dashboard.ratings || {};
  const growth = dashboard.growth || {};
  const verification = dashboard.verification || {};
  const systemHealth = dashboard.systemHealth || {};

  const verificationQueue = verificationData?.data || [];
  const topDoctors = topDoctorsData?.data || [];

  
  // Chart data for user growth
  const userGrowthChartData = {
    labels: growth.userTrends?.map(d => d.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Doctors',
        data: growth.userTrends?.map(d => d.doctors) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      },
      {
        label: 'Pet Owners',
        data: growth.userTrends?.map(d => d.owners) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for appointment trends
  const appointmentTrendsChartData = {
    labels: appointments.trends?.map(d => d.date) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: appointments.trends?.map(d => d.count) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        borderWidth: 3,
        pointBorderColor: '#8b5cf6',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: '#8b5cf6',
        pointHoverBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for appointment status distribution
  const statusChartData = {
    labels: ['Scheduled', 'Accepted', 'Rescheduled', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          appointments.byStatus?.scheduled || 0,
          appointments.byStatus?.accepted || 0,
          appointments.byStatus?.rescheduled || 0,
          appointments.byStatus?.completed || 0,
          appointments.byStatus?.cancelled || 0
        ],
        backgroundColor: ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 8
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12, family: "'Inter', sans-serif" },
          color: '#4b5563'
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        padding: 12,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
          drawBorder: false
        },
        ticks: {
          stepSize: 1,
          color: '#6b7280'
        }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 15,
          font: { size: 12, family: "'Inter', sans-serif" },
          color: '#4b5563'
        }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        padding: 12,
        cornerRadius: 8
      }
    },
    cutout: '65%',
    radius: '90%'
  };

  const handleRefresh = async () => {
    try {
      await refreshDashboard().unwrap();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  };

  const getVerificationBadge = (status) => {
    switch(status) {
      case "Approved": return "bg-green-100 text-green-700 border border-green-200";
      case "Rejected": return "bg-red-100 text-red-700 border border-red-200";
      case "Pending": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  if (isDashboardLoading || isVerificationLoading || isTopDoctorsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Message variant="danger">
            {dashboardError?.data?.message || "Failed to load dashboard"}
          </Message>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Admin Menu */}
          <div className="lg:w-1/4">
            
            {/* Quick Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <FaShieldAlt className="mr-2 text-navigray" />
                System Health
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified Users</span>
                  <span className="font-semibold text-green-600">{systemHealth.verifiedUsers || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pending Verification</span>
                  <span className="font-semibold text-yellow-600">{systemHealth.pendingVerifications || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Doctors</span>
                  <span className="font-semibold text-blue-600">{systemHealth.activeDoctors || 0}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Today's Appointments</span>
                    <span className="font-semibold text-gray-900">{systemHealth.todayAppointments || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg mb-8 overflow-hidden">
              <div className="px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold">
                      {userInfo?.fullName?.charAt(0) || "A"}
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Welcome back, {userInfo?.fullName?.split(' ')[0] || 'Admin'}!
                      </h1>
                      <p className="text-white/90 mt-2 flex items-center">
                        <FaRegClock className="mr-2" />
                        {moment().format("dddd, MMMM Do YYYY")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center space-x-3">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors flex items-center backdrop-blur-sm"
                    >
                      <svg className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <div className="flex space-x-6">
                <button
                  onClick={() => setSelectedTab("overview")}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                    selectedTab === "overview"
                      ? "text-navigray border-b-2 border-navigray"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setSelectedTab("doctors")}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                    selectedTab === "doctors"
                      ? "text-navigray border-b-2 border-navigray"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Doctors
                </button>
                <button
                  onClick={() => setSelectedTab("appointments")}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                    selectedTab === "appointments"
                      ? "text-navigray border-b-2 border-navigray"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Appointments
                </button>
                <button
                  onClick={() => setSelectedTab("verification")}
                  className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                    selectedTab === "verification"
                      ? "text-navigray border-b-2 border-navigray"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Verification
                </button>
              </div>
            </div>

            {/* Overview Tab */}
            {selectedTab === "overview" && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Users */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalUsers || 0}</p>
                        <div className="flex items-center mt-3 text-xs">
                          <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <FaUserMd className="w-3 h-3 mr-1" />
                            {overview.totalDoctors || 0} doctors
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FaUsers className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* Total Appointments */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{appointments.total || 0}</p>
                        <div className="flex items-center mt-3 text-xs">
                          <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            {appointments.byStatus?.completed || 0} completed
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                        <FaCalendarCheck className="w-6 h-6 text-purple-500" />
                      </div>
                    </div>
                  </div>

                  {/* Platform Rating */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Platform Rating</p>
                        <div className="flex items-baseline mt-2">
                          <p className="text-3xl font-bold text-gray-900">{ratings.platformAverage || "0.0"}</p>
                          <p className="text-sm text-gray-500 ml-1">/5</p>
                        </div>
                        <div className="flex items-center mt-3 text-xs">
                          <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                            <FaStar className="w-3 h-3 mr-1" />
                            {ratings.totalDoctorsWithReviews || 0} doctors rated
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <FaStar className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  {/* Growth */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">New Users (30d)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{growth.newUsersLast30Days || 0}</p>
                        <div className="flex items-center mt-3 text-xs">
                          <span className={`flex items-center px-2 py-1 rounded-full ${
                            growth.appointmentGrowth > 0 
                              ? 'bg-green-50 text-green-600' 
                              : 'bg-red-50 text-red-600'
                          }`}>
                            <FaChartLine className="w-3 h-3 mr-1" />
                            {growth.appointmentGrowth || 0}% appointments
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <FaChartLine className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                {chartsReady && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Growth Chart */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <FaUsers className="mr-2 text-navigray" />
                          User Growth
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedPeriod("week")}
                            className={`px-3 py-1 text-xs rounded-lg ${
                              selectedPeriod === "week"
                                ? "bg-navigray text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Week
                          </button>
                          <button
                            onClick={() => setSelectedPeriod("month")}
                            className={`px-3 py-1 text-xs rounded-lg ${
                              selectedPeriod === "month"
                                ? "bg-navigray text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            Month
                          </button>
                        </div>
                      </div>
                      <div className="h-64">
                        <Suspense fallback={<ChartLoader />}>
                          <Line data={userGrowthChartData} options={lineChartOptions} />
                        </Suspense>
                      </div>
                    </div>

                    {/* Appointment Status Distribution */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <FaCalendarCheck className="mr-2 text-navigray" />
                        Appointment Status
                      </h3>
                      <div className="h-64 flex items-center justify-center">
                        <div className="w-48 h-48">
                          <Suspense fallback={<ChartLoader />}>
                            <Doughnut data={statusChartData} options={doughnutOptions} />
                          </Suspense>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Activity & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Rated Doctors */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FaStar className="mr-2 text-yellow-500" />
                        Top Rated Doctors
                      </h3>
                      <Link
                        to="/admin/userslist"
                        className="text-sm text-navigray hover:text-navigray-dark font-medium flex items-center"
                      >
                        View All
                        <FaChevronRight className="ml-1 w-3 h-3" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {topDoctors.length > 0 ? (
                        topDoctors.map((doctor, index) => (
                          <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {doctor.image ? (
                                  <img
                                    src={doctor.image}
                                    alt={doctor.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-gradient-to-br from-navigray to-navigray-dark rounded-full flex items-center justify-center text-white font-semibold">
                                    {doctor.name?.charAt(0) || 'D'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                                <p className="text-xs text-gray-500">{doctor.specialization || 'Veterinarian'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center">
                                <span className="font-semibold text-gray-900 mr-1">{doctor.rating}</span>
                                <FaStar className="w-3 h-3 text-yellow-500" />
                              </div>
                              <p className="text-xs text-gray-500">{doctor.reviews} reviews</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600">No doctors with reviews yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                      <FaBell className="mr-2 text-navigray" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to="/admin/userslist"
                        className="block w-full px-4 py-3 bg-navigray text-white rounded-xl hover:bg-navigray-dark transition-colors text-center font-medium flex items-center justify-center"
                      >
                        <FaUsers className="mr-2" />
                        Manage Users
                      </Link>
                      <Link
                        to="/admin/allappointments"
                        className="block w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-center font-medium flex items-center justify-center"
                      >
                        <FaCalendarCheck className="mr-2" />
                        View All Appointments
                      </Link>
                      <Link
                        to="/admin/allappointments"
                        className="block w-full px-4 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors text-center font-medium flex items-center justify-center"
                      >
                        <FaIdCard className="mr-2" />
                        Review Verification
                        {verification.queueCount > 0 && (
                          <span className="ml-2 bg-white text-yellow-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {verification.queueCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Doctors Tab */}
            {selectedTab === "doctors" && (
              <div className="space-y-6">
                {/* Doctor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.totalDoctors || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <FaUserMd className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Doctors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.approvedDoctors || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <FaCheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{overview.pendingDoctors || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Doctors Full List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">All Doctors Performance</h3>
                  <div className="space-y-4">
                    {topDoctors.length > 0 ? (
                      topDoctors.map((doctor, index) => (
                        <div key={doctor.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-navigray/20 to-navigray-dark/20 rounded-full flex items-center justify-center text-navigray font-bold">
                                #{index + 1}
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Dr. {doctor.name}</p>
                              <p className="text-sm text-gray-600">{doctor.specialization || 'Veterinarian'} • {doctor.experience || 0} years exp.</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="flex items-center">
                                <span className="text-xl font-bold text-gray-900 mr-1">{doctor.rating}</span>
                                <FaStar className="w-4 h-4 text-yellow-500" />
                              </div>
                              <p className="text-xs text-gray-500">{doctor.reviews} reviews</p>
                            </div>
                            <Link
                              to={`${doctor.id}`}
                              className="px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors text-sm"
                            >
                              View Profile
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No doctor data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Appointments Tab */}
            {selectedTab === "appointments" && (
              <div className="space-y-6">
                {/* Appointment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.total || 0}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.today || 0}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Paid</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.payment?.paid || 0}</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <p className="text-sm font-medium text-gray-600">Unpaid</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{appointments.payment?.unpaid || 0}</p>
                  </div>
                </div>

                {/* Appointment Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaHome className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Home Visits</p>
                          <p className="text-2xl font-bold text-gray-900">{appointments.byType?.homeVisit || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaVideo className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Video Calls</p>
                          <p className="text-2xl font-bold text-gray-900">{appointments.byType?.videoCall || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FaClinicMedical className="w-5 h-5 text-purple-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-600">Clinic Visits</p>
                          <p className="text-2xl font-bold text-gray-900">{appointments.byType?.onClinic || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Tab */}
            {selectedTab === "verification" && (
              <div className="space-y-6">
                {/* Verification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">{verification.queueCount || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                        <FaClock className="w-6 h-6 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{verification.approvedCount || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                        <FaCheckCircle className="w-6 h-6 text-green-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Rejected</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">{verification.rejectedCount || 0}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                        <FaTimesCircle className="w-6 h-6 text-red-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Queue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <FaIdCard className="mr-2 text-navigray" />
                      Verification Queue
                    </h3>
                    <Link
                      to="/admin/userslist"
                      className="text-sm text-navigray hover:text-navigray-dark font-medium flex items-center"
                    >
                      View All
                      <FaChevronRight className="ml-1 w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {verificationQueue.length > 0 ? (
                      verificationQueue.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-navigray/20 to-navigray-dark/20 rounded-full flex items-center justify-center">
                                <FaUserMd className="w-6 h-6 text-navigray" />
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Dr. {item.doctorName}</p>
                              <div className="flex items-center mt-1 space-x-3">
                                <span className="text-xs text-gray-500 flex items-center">
                                  <FaEnvelope className="mr-1 w-3 h-3" />
                                  {item.email}
                                </span>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <FaPhone className="mr-1 w-3 h-3" />
                                  {item.phone}
                                </span>
                              </div>
                              <div className="flex items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getVerificationBadge('Pending')}`}>
                                  Pending Review
                                </span>
                                <span className="text-xs text-gray-500 ml-3">
                                  Submitted {item.timeAgo}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/${item.id}`}
                            className="px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors text-sm"
                          >
                            Review
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FaCheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <p className="text-gray-600">No pending verifications</p>
                        <p className="text-sm text-gray-500 mt-2">All caught up! Great job!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;