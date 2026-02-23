import { Link } from "react-router-dom";
import moment from "moment";
import {
  useGetAppointmentsQuery,
} from "../../redux/api/appointmentApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";
import { 
  FaCalendar, 
  FaClock, 
  FaStethoscope, 
  FaUser, 
  FaPaw, 
  FaMoneyBill, 
  FaEye,
  FaEdit,
  FaBell,
  FaSearch,
  FaFilter,
  FaTimes,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle
} from "react-icons/fa";
import { useState, useMemo } from "react";

const AdminAllAppointments = () => {
  const { data, isLoading, isError } = useGetAppointmentsQuery();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("urgent");

  const appointments = data?.appointments || [];

  // Get unique statuses for filter dropdown
  const statuses = useMemo(() => {
    const statusSet = new Set(appointments.map(app => app.status));
    return ["all", ...Array.from(statusSet)];
  }, [appointments]);

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(appt => 
        appt.petId?.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.petId?.petType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.doctorId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.ownerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt._id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(appt => appt.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(appt => appt.appointmentType === typeFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = moment(a.appointmentDate);
      const dateB = moment(b.appointmentDate);
      const now = moment();
      
      switch (sortOrder) {
        case "urgent":
         // For urgent: Show active appointments first, then completed/cancelled at the bottom
         const aIsActive = !["Completed", "Cancelled"].includes(a.status);
         const bIsActive = !["Completed", "Cancelled"].includes(b.status);
         
         if (aIsActive && !bIsActive) return -1;
         if (!aIsActive && bIsActive) return 1;
         
         // If both are active, sort by closest date
         if (aIsActive && bIsActive) {
           const diffA = Math.abs(dateA.diff(now));
           const diffB = Math.abs(dateB.diff(now));
           return diffA - diffB;
         }
         
         // If both are completed/cancelled, sort by newest first
         return dateB - dateA;
         
        case "oldest":
         return dateA - dateB;
         
        case "newest":
         return dateB - dateA;
         
        default:
         return 0;
      }
    });
    
    return filtered;
  }, [appointments, searchTerm, statusFilter, typeFilter, sortOrder]);

  const getStatusColor = (status) => {
    switch(status) {
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "Accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rescheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Scheduled": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Completed": return "✓";
      case "Cancelled": return "✗";
      case "Accepted": return "✓";
      case "Rescheduled": return "↻";
      case "Scheduled": return "📅";
      default: return "•";
    }
  };

  const getUrgencyBadge = (appointmentDate, status) => {
    // Don't show urgency badges for completed or cancelled appointments
    if (status === "Completed" || status === "Cancelled") {
      return null;
    }
    
    const today = moment().startOf('day');
    const appDate = moment(appointmentDate).startOf('day');
    const diffDays = appDate.diff(today, 'days');
    
    if (diffDays < 0) {
      return (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center">
          <FaExclamationTriangle className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    } else if (diffDays === 0) {
      return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Tomorrow</span>;
    } else if (diffDays <= 3) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">This week</span>;
    }
    return null;
  };

  const formatLocalTime = (timeString) => {
    if (!timeString) return "";
    return moment(`1970-01-01T${timeString}`).format("hh:mm A");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Appointments</h3>
            <p className="text-gray-600 mb-6">Unable to load appointment information. Please try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">All Appointments</h1>
                  <p className="text-gray-600 mt-2">
                    Total: <span className="font-semibold">{filteredAndSortedAppointments.length} appointments</span>
                    {appointments.length !== filteredAndSortedAppointments.length && (
                      <span className="text-sm text-gray-500 ml-2">
                        (filtered from {appointments.length})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative md:col-span-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by pet, doctor, owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FaTimes className="text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div className="relative md:col-span-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFilter className="text-gray-400" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status === "all" ? "All Statuses" : status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="relative md:col-span-1">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                  >
                    <option value="all">All Types</option>
                    <option value="On Clinic">Clinic Visit</option>
                    <option value="Video Call">Video Call</option>
                    <option value="Home Visit">Home Visit</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="relative md:col-span-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {sortOrder === "urgent" ? (
                      <FaExclamationTriangle className="text-orange-400" />
                    ) : sortOrder === "newest" ? (
                      <FaSortAmountDown className="text-gray-400" />
                    ) : (
                      <FaSortAmountUp className="text-gray-400" />
                    )}
                  </div>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray appearance-none"
                  >
                    <option value="urgent">Urgent First</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appointment Cards */}
            {filteredAndSortedAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCalendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Appointments Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "Try adjusting your search or filters" 
                    : "No appointments have been scheduled yet"}
                </p>
                {(searchTerm || statusFilter !== "all" || typeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                    }}
                    className="mt-4 text-navigray hover:text-navigray-dark font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedAppointments.map((appt) => (
                  <div key={appt._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header with Status and Date */}
                    <div className={`px-6 py-4 border-b ${getStatusColor(appt.status).split(' ')[0]}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(appt.status)}`}>
                            <span className="mr-1">{getStatusIcon(appt.status)}</span>
                            {appt.status}
                          </span>
                          {getUrgencyBadge(appt.appointmentDate, appt.status)}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {moment(appt.appointmentDate).format("MMM D, YYYY")}
                          </span>
                          {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                            <span className="text-xs text-gray-400">
                              ({moment(appt.appointmentDate).fromNow()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start space-x-4 mb-6">
                        {/* Pet Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={appt.petId?.petImages || "/images/default-pet.png"}
                            alt={appt.petId?.petName || "Pet"}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                          />
                        </div>

                        {/* Pet & Appointment Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appt.petId?.petName || appt.petId?.petType || "Pet"}
                          </h3>
                          
                          {/* Appointment Date - Full Format */}
                          <div className="mt-1 flex items-center text-sm font-medium text-navigray">
                            <FaCalendar className="w-4 h-4 mr-1" />
                            {moment(appt.appointmentDate).format("dddd, MMMM Do YYYY")}
                          </div>
                          
                          {/* Time & Type */}
                          <div className="mt-1 flex items-center text-sm text-gray-700">
                            <FaClock className="w-4 h-4 mr-1 text-gray-500" />
                            {formatLocalTime(appt.appointmentTime)} • {appt.appointmentType}
                          </div>
                          
                          {/* Payment */}
                          <div className="mt-2 flex items-center text-sm text-gray-600">
                            <FaMoneyBill className="w-4 h-4 mr-2 text-gray-400" />
                            <span>
                              <span className="font-medium">{appt.charges} PKR</span>
                              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                appt.isPaid 
                                  ? "bg-green-100 text-green-700" 
                                  : "bg-yellow-100 text-yellow-700"
                              }`}>
                                {appt.isPaid ? "Paid ✓" : "Pending"}
                              </span>
                            </span>
                          </div>

                          {/* Show completed/cancelled date for past appointments */}
                          {(appt.status === "Completed" || appt.status === "Cancelled") && appt.updatedAt && (
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <FaClock className="w-3 h-3 mr-1" />
                              {appt.status === "Completed" ? "Completed" : "Cancelled"} on {moment(appt.updatedAt).format("MMM D, YYYY")}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Doctor & Owner Info */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <FaStethoscope className="w-4 h-4 mr-2" />
                            Doctor
                          </div>
                          <div className="font-medium text-gray-900 truncate">
                            {appt.doctorId?.fullName || "Unassigned"}
                          </div>
                          {appt.doctorId?.specialization && (
                            <div className="text-xs text-gray-500 mt-1">
                              {appt.doctorId.specialization}
                            </div>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <FaUser className="w-4 h-4 mr-2" />
                            Owner
                          </div>
                          <div className="font-medium text-gray-900 truncate">
                            {appt.ownerId?.fullName || "Unknown"}
                          </div>
                          {appt.ownerId?.phone && (
                            <div className="text-xs text-gray-500 mt-1">
                              {appt.ownerId.phone}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                        <Link
                          to={`/admin/${appt._id}/appointment-details`}
                          className="flex-1 min-w-[120px] px-4 py-2 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors flex items-center justify-center"
                        >
                          <FaEye className="mr-2" />
                          View Details
                        </Link>
                        
                        {appt.status !== "Completed" && appt.status !== "Cancelled" && (
                          <>
                            <button
                              onClick={() => {
                                // Implement resend notification logic
                                alert(`Resending notification for appointment ${appt._id}`);
                              }}
                              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                            >
                              <FaBell className="mr-2" />
                              Notify
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Summary */}
            {filteredAndSortedAppointments.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <FaCalendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-xl font-semibold">{appointments.length}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-green-600 font-bold">✓</span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Completed</div>
                      <div className="text-xl font-semibold">
                        {appointments.filter(a => a.status === "Completed").length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <FaMoneyBill className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Paid</div>
                      <div className="text-xl font-semibold">
                        {appointments.filter(a => a.isPaid).length}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <FaClock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Overdue</div>
                      <div className="text-xl font-semibold">
                        {appointments.filter(a => 
                          moment(a.appointmentDate).isBefore(moment(), 'day') &&
                          !["Completed", "Cancelled"].includes(a.status)
                        ).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <AdminMenu />
            
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Today's</span>
                  <span className="font-semibold">
                    {appointments.filter(a => 
                      moment(a.appointmentDate).isSame(moment(), 'day') &&
                      !["Completed", "Cancelled"].includes(a.status)
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tomorrow</span>
                  <span className="font-semibold">
                    {appointments.filter(a => 
                      moment(a.appointmentDate).isSame(moment().add(1, 'day'), 'day') &&
                      !["Completed", "Cancelled"].includes(a.status)
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Overdue</span>
                  <span className="font-semibold">
                    {appointments.filter(a => 
                      moment(a.appointmentDate).isBefore(moment(), 'day') &&
                      !["Completed", "Cancelled"].includes(a.status)
                    ).length}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600">Pending Action</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === "Scheduled").length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-600">Cancelled</span>
                  <span className="font-semibold">
                    {appointments.filter(a => a.status === "Cancelled").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-600">Rescheduled</span>
                  <span className="font-semibold">
                    {appointments.filter(a => a.status === "Rescheduled").length}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-600">Video Calls</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.appointmentType === "Video Call").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Clinic Visits</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.appointmentType === "On Clinic").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Home Visits</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.appointmentType === "Home Visit").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/admin/appointments/create"
                  className="block w-full px-4 py-3 bg-navigray text-white rounded-lg hover:bg-navigray-dark transition-colors text-center font-medium"
                >
                  Create Appointment
                </Link>
                <button
                  onClick={() => {
                    // Implement bulk notification
                    alert("Send bulk notifications to all upcoming appointments");
                  }}
                  className="block w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-center"
                >
                  Bulk Notify
                </button>
                <button
                  onClick={() => window.print()}
                  className="block w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Export List
                </button>
              </div>
            </div>

            {/* Recent Activity - FIXED */}
            {filteredAndSortedAppointments.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {filteredAndSortedAppointments.slice(0, 3).map((appt) => (
                    <div key={appt._id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center">
                        <FaPaw className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {appt.petId?.petName || "Pet"}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                            appt.status === "Completed" ? "bg-green-400" :
                            appt.status === "Cancelled" ? "bg-red-400" :
                            appt.status === "Scheduled" ? "bg-purple-400" :
                            "bg-blue-400"
                          }`}></span>
                          {appt.status} • {moment(appt.updatedAt || appt.createdAt).fromNow()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAllAppointments;
