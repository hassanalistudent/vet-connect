// frontend/src/pages/doctor/DoctorDashboard.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetDoctorDashboardQuery,
  useGetDoctorDashboardStatsQuery,
  useGetDoctorAppointmentTrendsQuery,
  useGetDoctorAlertsQuery,
  useRefreshDoctorDashboardMutation
} from "../../redux/api/dashboardApiSlice";
import { useGetProfileQuery } from "../../redux/api/userApiSlice";
import { 
  FaCalendarCheck, 
  FaStar, 
  FaUserMd, 
  FaClock, 
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaUsers,
  FaHome,
  FaVideo,
  FaClinicMedical,
  FaBell,
  FaChevronRight,
  FaPaw,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaRegClock,
  FaUserCircle,
  FaQuoteRight,
  FaStethoscope,
  FaMapMarkedAlt
} from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const DoctorDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading: isDashboardLoading, error: dashboardError } = useGetDoctorDashboardQuery();
  const { data: statsData, isLoading: isStatsLoading } = useGetDoctorDashboardStatsQuery();
  const { data: trendsData, isLoading: isTrendsLoading } = useGetDoctorAppointmentTrendsQuery({ period: selectedPeriod });
  const { data: alertsData, isLoading: isAlertsLoading } = useGetDoctorAlertsQuery();
  const { data: profileData, isLoading: isProfileLoading } = useGetProfileQuery();
  const [refreshDashboard, { isLoading: isRefreshing }] = useRefreshDoctorDashboardMutation();

  const dashboard = dashboardData?.data || {};
  const stats = statsData?.data || {};
  const trends = trendsData?.data || [];
  const alerts = alertsData?.data || [];
  const profile = profileData || {};

  const overview = dashboard.overview || {};
  const ratings = dashboard.ratings || {};
  const patients = dashboard.patients || {};
  const appointments = dashboard.appointments || {};
  const recentActivity = dashboard.recentActivity || [];

  // Get doctor profile from profile query
  const doctorProfile = profile?.doctorProfile || {};
  const user = profile || {};

  // Format clinic address
  const getClinicArea = () => {
    const clinic = doctorProfile?.clinicDetails;
    if (!clinic) return "Clinic location not set";
    return [clinic.clinicDistrict, clinic.clinicCity].filter(Boolean).join(", ");
  };

  // Chart data for appointment trends
  const trendsChartData = {
    labels: trends.map(d => d.day) || [],
    datasets: [
      {
        label: 'Appointments',
        data: trends.map(d => d.count) || [],
        borderColor: '#4361ee',
        backgroundColor: 'rgba(67, 97, 238, 0.1)',
        borderWidth: 3,
        pointBorderColor: '#4361ee',
        pointBackgroundColor: '#ffffff',
        pointHoverBackgroundColor: '#4361ee',
        pointHoverBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 4,
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Chart data for appointment types
  const appointmentTypesChartData = {
    labels: ['Home Visit', 'Video Call', 'On Clinic'],
    datasets: [
      {
        data: [
          appointments.types?.homeVisit || 0,
          appointments.types?.videoCall || 0,
          appointments.types?.onClinic || 0
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6'],
        borderColor: ['#059669', '#2563eb', '#7c3aed'],
        borderWidth: 2,
        hoverOffset: 8
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        padding: 12,
        cornerRadius: 8,
        displayColors: false
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
    cutout: '70%',
    radius: '90%'
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-700 border border-green-200";
      case "Cancelled": return "bg-red-100 text-red-700 border border-red-200";
      case "Accepted": return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Rescheduled": return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "Scheduled": return "bg-purple-100 text-purple-700 border border-purple-200";
      default: return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshDashboard().unwrap();
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    }
  };

  if (isDashboardLoading || isStatsLoading || isTrendsLoading || isAlertsLoading || isProfileLoading) {
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
        {/* Header with Gradient - Simplified */}
        <div className="bg-gradient-to-r from-navigray to-navigray-dark rounded-2xl shadow-lg mb-8 overflow-hidden">
          <div className="px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                {/* Profile Picture */}
                <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                  {doctorProfile?.image ? (
                    <img 
                      src={doctorProfile.image} 
                      alt={user?.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.fullName?.charAt(0) || "D"
                  )}
                </div>
                
                {/* Name and Clinic Area */}
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Dr. {user?.fullName || 'Doctor'}
                  </h1>
                  <p className="text-white/90 mt-2 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    {getClinicArea()}
                  </p>
                  <p className="text-white/70 mt-1 flex items-center text-sm">
                    <FaRegClock className="mr-2" />
                    {moment().format("dddd, MMMM Do YYYY")}
                  </p>
                </div>
              </div>
              
              {/* Action Buttons */}
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
                <Link
                  to="/doctor/profile"
                  className="px-4 py-2 bg-white text-navigray rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
                >
                  <FaUserCircle className="mr-2" />
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl p-4 flex items-start justify-between border ${
                  alert.type === 'error' ? 'bg-red-50 border-red-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 mt-0.5 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {alert.type === 'error' ? <FaTimesCircle className="w-5 h-5" /> :
                     alert.type === 'warning' ? <FaExclamationTriangle className="w-5 h-5" /> :
                     <FaBell className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${
                      alert.type === 'error' ? 'text-red-800' :
                      alert.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {alert.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      alert.type === 'error' ? 'text-red-700' :
                      alert.type === 'warning' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </div>
                {alert.action && (
                  <Link
                    to={alert.action}
                    className={`text-sm font-medium hover:underline flex items-center ${
                      alert.type === 'error' ? 'text-red-600' :
                      alert.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}
                  >
                    Take Action
                    <FaChevronRight className="ml-1 w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAppointments || 0}</p>
                <div className="flex items-center mt-3 text-xs">
                  <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <FaCheckCircle className="w-3 h-3 mr-1" />
                    {overview.completedAppointments || 0} completed
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-navigray/10 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="w-6 h-6 text-navigray" />
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Schedule</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.todayAppointments || 0}</p>
                <div className="flex items-center mt-3 text-xs">
                  <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <FaClock className="w-3 h-3 mr-1" />
                    {overview.pendingAction || 0} pending
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <FaClock className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Patients Served */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Patients Served</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{patients.unique || 0}</p>
                <div className="flex items-center mt-3 text-xs">
                  <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    <FaUsers className="w-3 h-3 mr-1" />
                    {patients.new || 0} new patients
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FaUsers className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                <div className="flex items-baseline mt-2">
                  <p className="text-3xl font-bold text-gray-900">{stats.rating?.toFixed(1) || "0.0"}</p>
                  <p className="text-sm text-gray-500 ml-1">/5</p>
                </div>
                <div className="flex items-center mt-3 text-xs">
                  <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    <FaStar className="w-3 h-3 mr-1" />
                    {stats.totalReviews || 0} reviews
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <FaStar className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Appointment Trends */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaChartLine className="mr-2 text-navigray" />
                Appointment Trends
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedPeriod("week")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedPeriod === "week"
                      ? "bg-navigray text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setSelectedPeriod("month")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedPeriod === "month"
                      ? "bg-navigray text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Month
                </button>
              </div>
            </div>
            <div className="h-72">
              {trends.length > 0 ? (
                <Line data={trendsChartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No appointment data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment Types */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaClinicMedical className="mr-2 text-navigray" />
              Appointment Types
            </h3>
            <div className="h-72 flex flex-col items-center justify-center">
              <div className="w-48 h-48 mb-4">
                <Doughnut data={appointmentTypesChartData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-3 gap-4 w-full mt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaHome className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-600">Home</p>
                  <p className="font-semibold text-gray-900">{appointments.types?.homeVisit || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaVideo className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-600">Video</p>
                  <p className="font-semibold text-gray-900">{appointments.types?.videoCall || 0}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <FaClinicMedical className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-600">Clinic</p>
                  <p className="font-semibold text-gray-900">{appointments.types?.onClinic || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Reviews */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaStar className="mr-2 text-yellow-500" />
                Recent Reviews
              </h3>
              <Link
                to="/doctor/reviews"
                className="text-sm text-navigray hover:text-navigray-dark font-medium flex items-center"
              >
                View All
                <FaChevronRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-4">
              {ratings.recent?.length > 0 ? (
                ratings.recent.map((review, index) => (
                  <div key={review.id || index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-navigray to-navigray-dark rounded-full flex items-center justify-center text-white font-semibold">
                            {review.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900">{review.name}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">{review.timeAgo}</p>
                        </div>
                      </div>
                      <FaQuoteRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaStar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/doctor/doctor-appointments"
                  className="block w-full px-4 py-3 bg-navigray text-white rounded-xl hover:bg-navigray-dark transition-colors text-center font-medium flex items-center justify-center"
                >
                  <FaCalendarCheck className="mr-2" />
                  Manage Appointments
                </Link>
                <Link
                  to="/doctor/profile"
                  className="block w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-center font-medium flex items-center justify-center"
                >
                  <FaUserMd className="mr-2" />
                  Update Profile
                </Link>
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Scheduled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.statusBreakdown?.scheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Accepted</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.statusBreakdown?.accepted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Rescheduled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.statusBreakdown?.rescheduled || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.statusBreakdown?.completed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    <span className="text-sm text-gray-600">Cancelled</span>
                  </div>
                  <span className="font-semibold text-gray-900">{appointments.statusBreakdown?.cancelled || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FaClock className="mr-2 text-navigray" />
              Recent Activity
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-navigray/20 to-navigray-dark/20 rounded-full flex items-center justify-center">
                      <FaPaw className="w-5 h-5 text-navigray" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{activity.petName}</p>
                    <p className="text-sm text-gray-600">{activity.ownerName}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">{activity.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;