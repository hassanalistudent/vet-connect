import { Link } from "react-router-dom";
import moment from "moment";
import { useGetDoctorAppointmentsQuery } from "../../redux/api/appointmentApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";

const AllDoctorAppointments = () => {
  const { data, isLoading, isError } = useGetDoctorAppointmentsQuery();
  const appointments = data?.appointments || [];

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
      case "Completed": return "bg-green-100 text-green-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      case "Accepted": return "bg-blue-100 text-blue-800";
      case "Rescheduled": return "bg-yellow-100 text-yellow-800";
      case "Scheduled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-gray-600">
                  Total: <span className="font-semibold">{appointments.length} appointments</span>
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Filter by status:</span>
                  <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-navigray focus:border-navigray">
                    <option value="all">All Statuses</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Appointment Cards */}
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">You don't have any appointments scheduled yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((appt) => (
                  <div key={appt._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header with Status */}
                    <div className={`px-6 py-4 border-b ${getStatusColor(appt.status).split(' ')[0]}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(appt.status)}`}>
                          {appt.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {moment(appt.appointmentDate).format("MMM D, YYYY")}
                        </span>
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
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {appt.petId?.petName || "Unnamed Pet"}
                          </h3>
                          
                          {/* Pet Details */}
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              <span>{appt.petId?.petType || "Unknown"} • {appt.petId?.breed || "Mixed"}</span>
                            </div>
                            
                            {/* Appointment Details */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{appt.appointmentTime} • {appt.appointmentType}</span>
                            </div>
                            
                            {/* Payment & Charges */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              <span>{appt.charges} PKR • {appt.isPaid ? "Paid ✓" : "Pending"}</span>
                            </div>
                            
                            {/* Owner Info */}
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>{appt.ownerId?.fullName || "Unknown Owner"}</span>
                            </div>
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
            <AdminMenu />
            
            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Appointment Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="font-semibold">{appointments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600">Completed</span>
                  <span className="font-semibold">
                    {appointments.filter(a => a.status === "Completed").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600">Upcoming</span>
                  <span className="font-semibold">
                    {appointments.filter(a => ["Scheduled", "Accepted"].includes(a.status)).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-600">Rescheduled</span>
                  <span className="font-semibold">
                    {appointments.filter(a => a.status === "Rescheduled").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-600">Pending Action</span>
                  <span className="font-semibold">
                    {appointments.filter(a => a.status === "Scheduled").length}
                  </span>
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