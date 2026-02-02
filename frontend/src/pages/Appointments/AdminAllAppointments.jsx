// src/pages/admin/AdminAllAppointments.jsx
import { Link } from "react-router-dom";
import moment from "moment";
import {
  useGetAppointmentsQuery, // New query for ALL appointments
} from "../../redux/api/appointmentApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";

const AdminAllAppointments = () => {
  const {
    data,
    isLoading,
    isError,
  } = useGetAppointmentsQuery(); // Admin sees ALL appointments

  const appointments = data?.appointments || [];

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error loading appointments</div>;
  }

  return (
    <div className="container mx-[9rem]">
      <div className="flex flex-col md:flex-row">
        {/* Left: content */}
        <div className="p-3 md:w-3/4">
          <div className="ml-[2rem] text-xl font-bold h-12">
            All Appointments ({appointments.length})
          </div>

          {/* Grid layout - UI EXACTLY SAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left side: pet image (if exists) */}
                <img
                  src={
                    appt.petId?.petImages
                      ? appt.petId.petImages
                      : "/images/default-pet.png"
                  }
                  alt={appt.petId?.petType || "Pet"}
                  className="w-32 h-32 object-cover rounded-md mr-4"
                />

                {/* Right: details - UI EXACTLY SAME */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-center">
                    <h5 className="text-lg font-semibold">
                      {appt.petId?.petType || "Pet"}{" "}
                      {appt.petId?.breed ? `- ${appt.petId.breed}` : ""}
                    </h5>
                    <p className="text-gray-400 text-sm">
                      {appt.appointmentDate
                        ? moment(appt.appointmentDate).format("MMMM Do YYYY")
                        : ""}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">
                    Time:{" "}
                    <span className="font-semibold">
                      {appt.appointmentTime || "N/A"}
                    </span>{" "}
                    | Status:{" "}
                    <span
                      className={`font-semibold ${
                        appt.status === "Cancelled"
                          ? "text-red-600"
                          : appt.status === "Completed"
                          ? "text-green-600"
                          : "text-blue-600"
                      }`}
                    >
                      {appt.status}
                    </span>{" "}
                    | Type:{" "}
                    <span className="font-semibold">
                      {appt.appointmentType || "N/A"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-700 mt-1">
                    Charges:{" "}
                    <span className="font-semibold">
                      {appt.charges ? `${appt.charges} PKR` : "N/A"}
                    </span>{" "}
                    | Paid:{" "}
                    <span className="font-semibold">
                      {appt.isPaid ? "Yes" : "No"}
                    </span>
                  </p>

                  {/* ✅ ADMIN SHOWS BOTH Doctor & Owner */}
                  <div className="space-y-1">
                    <p className="text-gray-600 text-sm">
                      Doctor:{" "}
                      <span className="font-semibold">
                        {appt.doctorId?.fullName || "Unassigned"}
                      </span>
                    </p>
                    <p className="text-gray-600 text-sm -mt-1">
                      Owner:{" "}
                      <span className="font-semibold">
                        {appt.ownerId?.fullName || "Unknown"}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap mt-2">
                    {/* ✅ ADMIN LINK - View full details */}
                    <Link
                      to={`/admin/appointment/${appt._id}`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300"
                    >
                      View Details
                      <svg
                        className="w-3.5 h-3.5 ml-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M1 5h12m0 0l-4-4m4 4l-4 4"
                        />
                      </svg>
                    </Link>

                    {/* ✅ ADMIN QUICK ACTIONS */}
                    {appt.status !== "Completed" && (
                      <>
                        <Link
                          to={`/admin/appointment/${appt._id}/edit`}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                          Edit
                        </Link>
                        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                          Resend Notification
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Menu */}
        <div className="md:w-1/4 p-3 mt-2">
          <AdminMenu />
        </div>
      </div>
    </div>
  );
};

export default AdminAllAppointments;
