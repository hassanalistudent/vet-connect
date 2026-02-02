// src/pages/admin/AllDoctorAppointments.jsx
import { Link } from "react-router-dom";
import moment from "moment";
import {
  useGetOwnerAppointmentsQuery,
} from "../../redux/api/appointmentApiSlice";
import AdminMenu from "../../components/AdminMenu";
import Loader from "../../components/Loader";

const PetOwnerAppointments = () => {
  // Optional: pass status filter if you want, e.g. { status: "Scheduled" }
  const {
    data,
    isLoading,
    isError,
  } = useGetOwnerAppointmentsQuery();

  // If your endpoint returns { success, count, appointments }
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
            My Appointments ({appointments.length})
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {appointments.map((appt) => (
              <div
                key={appt._id}
                className="flex border rounded-lg p-4 shadow-sm"
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

                {/* Right: details */}
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

                  <p className="text-sm text-gray-700 mt-1 mb-1">
                    Charges:{" "}
                    <span className="font-semibold">
                      {appt.charges ? `${appt.charges} PKR` : "N/A"}
                    </span>{" "}
                    | Paid:{" "}
                    <span className="font-semibold">
                      {appt.isPaid ? "Yes" : "No"}
                    </span>
                  </p>


                  <div className="flex gap-2 flex-wrap">
                    {/* View appointment details page (if you create it) */}
                    <Link
                      to={`/petowner/${appt._id}/owner-response`}
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

                    {/* Example buttons for future actions */}
                    {/* <button className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                      Update Status
                    </button> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin / Doctor side menu */}
        <div className="md:w-1/4 p-3 mt-2">
          <AdminMenu />
        </div>
      </div>
    </div>
  );
};

export default PetOwnerAppointments;
