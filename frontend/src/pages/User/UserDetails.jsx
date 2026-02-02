import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import AdminMenu from "../../components/AdminMenu";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const UserDetails = () => {
  // ALL HOOKS AT TOP
  const { id } = useParams();
  const { data: user, isLoading, error } = useGetUserDetailsQuery(id);
  const [updateUser, { isLoading: updatingStatus }] = useUpdateUserMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo?.role === "Admin";
  const [tempStatus, setTempStatus] = useState("Pending");

  const doctor = user?.doctorProfile;
  const petOwner = user?.petOwnerProfile;
  const petProfile = user?.petProfile;
  const isDoctor = !!doctor;
  const isPetOwner = !!petOwner;
  const currentStatus = doctor?.verificationUploads?.status || "Pending";

  // Sync tempStatus with currentStatus
  useEffect(() => {
    setTempStatus(currentStatus);
  }, [currentStatus]);

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.message}
      </Message>
    );

  const handleConfirmStatus = async () => {
    if (tempStatus === currentStatus) return;

    try {
      await updateUser({ userId: user._id, status: tempStatus }).unwrap();
      toast.success(`Doctor status updated to ${tempStatus} successfully!`);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update doctor status");
    }
  };

  const handleDropdownChange = (e) => {
    setTempStatus(e.target.value);
  };

  const renderDoctorStatusBadge = (status) => {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
          </svg>
          Approved
        </span>
      );
    }
    if (status === "Rejected") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 8.586L4.293 2.879A1 1 0 102.879 4.293L8.586 10l-5.707 5.707a1 1 0 101.414 1.414L10 11.414l5.707 5.707a1 1 0 001.414-1.414L11.414 10l5.707-5.707A1 1 0 0015.707 2.88L10 8.586z" clipRule="evenodd" />
          </svg>
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-300">
        <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06L10.75 9.44V6z" />
        </svg>
        Pending
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row p-4">
      {isAdmin && <AdminMenu />}
      <main className="flex-1 md:ml-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            User Profile Details
          </h2>

          {/* Basic User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Doctor Image */}
            {isDoctor && doctor?.image && (
              <div className="flex items-center justify-left">
                <div className="w-full max-w-sm aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
                  <img
                    src={doctor.image}
                    alt={user.fullName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="flex items-stretch">
              <div className="w-full rounded-lg p-4 space-y-3 text-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-pink-600">User Information</h3>
                  {isDoctor && renderDoctorStatusBadge(currentStatus)}
                </div>

                <p><strong>Name:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || "—"}</p>
                <p><strong>Role:</strong> {user.role}</p>

                {isDoctor && doctor?.specialization && (
                  <p><strong>Specialization:</strong> {doctor.specialization}</p>
                )}
                {isDoctor && doctor?.yearsOfExperience && (
                  <p><strong>Experience:</strong> {doctor.yearsOfExperience} years</p>
                )}
                {isDoctor && doctor?.pvmcRegistrationNumber && (
                  <p><strong>PVMC Reg:</strong> {doctor.pvmcRegistrationNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ ADMIN DOCTOR STATUS CONTROL WITH CONFIRM BUTTON */}
          {isAdmin && isDoctor && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4 border-pink-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <label className="text-sm font-medium text-gray-600">Doctor Verification Status:</label>
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={tempStatus}
                    onChange={handleDropdownChange}
                    disabled={updatingStatus}
                    className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white shadow-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleConfirmStatus}
                    disabled={tempStatus === currentStatus || updatingStatus}
                    className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-pink-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {updatingStatus ? "Updating..." : "Confirm"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ NEW: Book Appointment Button - Show for Doctors only, for PetOwners/Admins */}
          {isDoctor && userInfo && userInfo._id !== user._id && (
            <div className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-indigo-50 rounded-2xl border-2 border-pink-200 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-pink-600 mb-1">Book Appointment</h3>
                  <p className="text-gray-600">
                    Schedule a visit with {user.fullName} for your pet
                  </p>
                </div>
                <Link
                  to={`/${user._id}/newappointment`}
                  className="bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-lg whitespace-nowrap"
                >
                  📅 Book Now
                </Link>
              </div>
            </div>
          )}

          {/* Doctor Clinic Details */}
          {isDoctor && doctor?.clinicDetails && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-pink-600 mb-2">Clinic Details</h3>
                {doctor.clinicDetails.clinicName && (
                  <p><strong>Name:</strong> {doctor.clinicDetails.clinicName}</p>
                )}
                {(doctor.clinicDetails.clinicCity || doctor.clinicDetails.clinicDistrict) && (
                  <p><strong>Location:</strong> {doctor.clinicDetails.clinicCity}, {doctor.clinicDetails.clinicDistrict}</p>
                )}
                {doctor.clinicDetails.clinicStreet && (
                  <p><strong>Address:</strong> {doctor.clinicDetails.clinicStreet}</p>
                )}
                {(doctor.clinicDetails.startTime && doctor.clinicDetails.endTime) && (
                  <p><strong>Timings:</strong> {doctor.clinicDetails.startTime} – {doctor.clinicDetails.endTime}</p>
                )}
              </div>
            </div>
          )}

          {/* Doctor Services */}
          {isDoctor && doctor?.servicesOffered && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-pink-600 mb-2">Services</h3>
                {doctor.servicesOffered.videoConsultation !== undefined && (
                  <p><strong>Video Consult:</strong> {doctor.servicesOffered.videoConsultation ? "Yes" : "No"}</p>
                )}
                {doctor.servicesOffered.clinicConsultation !== undefined && (
                  <p><strong>Clinic Visit:</strong> {doctor.servicesOffered.clinicConsultation ? "Yes" : "No"}</p>
                )}
                {doctor.servicesOffered.homeVisit !== undefined && (
                  <p><strong>Home Visit:</strong> {doctor.servicesOffered.homeVisit ? "Yes" : "No"}</p>
                )}
              </div>
            </div>
          )}

          {/* Doctor Home Visit */}
          {isDoctor && doctor?.homeVisitDetails && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-pink-600 mb-2">Home Visit</h3>
                {doctor.homeVisitDetails.areasCovered && (
                  <p><strong>Areas:</strong> {Array.isArray(doctor.homeVisitDetails.areasCovered) 
                    ? doctor.homeVisitDetails.areasCovered.join(", ") 
                    : doctor.homeVisitDetails.areasCovered}</p>
                )}
                {doctor.homeVisitDetails.charges && (
                  <p><strong>Charges:</strong> {doctor.homeVisitDetails.charges}</p>
                )}
              </div>
            </div>
          )}

          {/* Pet Owner Profile */}
          {isPetOwner && (
            <div className="mt-6 space-y-4 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-pink-600 mb-4">Pet Owner Profile Details</h2>
              {petOwner.address && (
                <>
                  <p><strong>City:</strong> {petOwner.address.city || "—"}</p>
                  <p><strong>District:</strong> {petOwner.address.district || "—"}</p>
                  <p><strong>Street:</strong> {petOwner.address.street || "—"}</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDetails;
