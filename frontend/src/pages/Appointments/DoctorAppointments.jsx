import { Link } from "react-router-dom";
import moment from "moment";
import { useState, useMemo } from "react";
import { useGetDoctorAppointmentsQuery } from "../../redux/api/appointmentApiSlice";
import Loader from "../../components/Loader";

const AllDoctorAppointments = () => {
  const { data, isLoading, isError } = useGetDoctorAppointmentsQuery();
  const appointments = data?.appointments || [];
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("urgent"); // urgent, oldest, newest
  
  // Get unique statuses for filter dropdown
  const statuses = useMemo(() => {
    const statusSet = new Set(appointments.map(app => app.status));
    return ["all", ...Array.from(statusSet)];
  }, [appointments]);

  // Filter and sort appointments
  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = [...appointments];
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
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
  }, [appointments, statusFilter, sortOrder]);

  if (isLoading) return <Loader />;

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
            <p className="text-red-600 mt-2">Failed to load appointments</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "Accepted": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Rescheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Scheduled": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
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
      return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Overdue</span>;
    } else if (diffDays === 0) {
      return <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Today</span>;
    } else if (diffDays === 1) {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Tomorrow</span>;
    } else if (diffDays <= 3) {
      return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">This week</span>;
    }
    return null;
  };

  // Format time to local 12-hour format
  const formatLocalTime = (timeString) => {
    if (!timeString) return "";
    
    // Assuming timeString is in HH:mm format (24-hour)
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                <p className="text-gray-600">
                  Total: <span className="font-semibold">{filteredAndSortedAppointments.length} appointments</span>
                  {appointments.length !== filteredAndSortedAppointments.length && (
                    <span className="text-sm text-gray-500 ml-2">
                      (filtered from {appointments.length})
                    </span>
                  )}
                </p>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Status Filter */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Filter:</span>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navigray focus:border-navigray bg-white"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status === "all" ? "All Statuses" : status}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Sort Order */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                    <select 
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navigray focus:border-navigray bg-white"
                    >
                      <option value="urgent">Urgent First</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointment Cards */}
            {filteredAndSortedAppointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">
                  {statusFilter !== "all" 
                    ? `No appointments with status "${statusFilter}"` 
                    : "You don't have any appointments scheduled yet."}
                </p>
                {statusFilter !== "all" && (
                  <button
                    onClick={() => setStatusFilter("all")}
                    className="mt-4 text-navigray hover:text-navigray-dark font-medium"
                  >
                    Clear filters
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
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(appt.status)}`}>
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
                      <div className="flex items-start space-x-4">
                        {/* Pet Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={appt.petId?.petImages || "/images/default-pet.png"}
                            alt={appt.petId?.petName || "Pet"}
                            className="w-20 h-20 rounded-xl object-cover border border-gray-200"
                          />
                        </div>

                        {/* Pet & Owner Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {appt.petId?.petName || "Unnamed Pet"}
                              </h3>
                              {/* Appointment Date & Time - Prominently Displayed */}
                              <div className="mt-1 flex items-center text-sm font-medium text-navigray">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {moment(appt.appointmentDate).format("dddd, MMMM Do YYYY")}
                              </div>
                              <div className="mt-1 flex items-center text-sm text-gray-700">
                                <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatLocalTime(appt.appointmentTime)} • {appt.appointmentType}
                              </div>
                            </div>
                          </div>
                          
                          {/* Pet Details */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              <span>{appt.petId?.petType || "Unknown"} • {appt.petId?.breed || "Mixed"}</span>
                            </div>
                            
                            {/* Payment & Charges */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
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
                            
                            {/* Owner Info */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{appt.ownerId?.fullName || "Unknown Owner"}</span>
                            </div>
                            
                            {/* Show completed/cancelled date for past appointments */}
                            {(appt.status === "Completed" || appt.status === "Cancelled") && appt.updatedAt && (
                              <div className="flex items-center text-xs text-gray-500 mt-1">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {appt.status === "Completed" ? "Completed" : "Cancelled"} on {moment(appt.updatedAt).format("MMM D, YYYY")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer with Action Button */}
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <Link
                          to={`/doctor/${appt._id}/doctor-response`}
                          className="w-full bg-navigray hover:bg-navigray-dark text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details & Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">

            
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                
                {/* Status Breakdown */}
                {statuses.filter(s => s !== "all").map(status => {
                  const count = appointments.filter(a => a.status === status).length;
                  if (count === 0) return null;
                  
                  let colorClass = "";
                  switch (status) {
                    case "Completed": colorClass = "text-green-600"; break;
                    case "Cancelled": colorClass = "text-red-600"; break;
                    case "Accepted": colorClass = "text-blue-600"; break;
                    case "Rescheduled": colorClass = "text-yellow-600"; break;
                    case "Scheduled": colorClass = "text-purple-600"; break;
                    default: colorClass = "text-gray-600";
                  }
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <span className={`text-sm ${colorClass}`}>{status}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600">Pending Action</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === "Scheduled").length}
                    </span>
                  </div>
                </div>
                
                {/* Today's Appointments (excluding completed/cancelled) */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-600">Today</span>
                    <span className="font-semibold">
                      {appointments.filter(a => 
                        moment(a.appointmentDate).isSame(moment(), 'day') &&
                        !["Completed", "Cancelled"].includes(a.status)
                      ).length}
                    </span>
                  </div>
                </div>
                
                {/* Tomorrow's Appointments (excluding completed/cancelled) */}
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">Tomorrow</span>
                    <span className="font-semibold">
                      {appointments.filter(a => 
                        moment(a.appointmentDate).isSame(moment().add(1, 'day'), 'day') &&
                        !["Completed", "Cancelled"].includes(a.status)
                      ).length}
                    </span>
                  </div>
                </div>
                
                {/* Overdue Appointments */}
                <div className="pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Overdue</span>
                    <span className="font-semibold">
                      {appointments.filter(a => 
                        moment(a.appointmentDate).isBefore(moment(), 'day') &&
                        !["Completed", "Cancelled"].includes(a.status)
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllDoctorAppointments;