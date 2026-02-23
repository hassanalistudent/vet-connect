import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";

const UserDetails = () => {
  // ALL HOOKS AT TOP
  const { id } = useParams();
  const { data: user, isLoading, error, refetch } = useGetUserDetailsQuery(id);
  const [updateUser, { isLoading: updatingStatus }] = useUpdateUserMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo?.role === "Admin";
  const [tempStatus, setTempStatus] = useState("Pending");

 const doctor = user?.doctorProfile;
const petOwner = user?.petOwnerProfile;
const isDoctor = !!doctor;
const isPetOwner = !!petOwner;
const verificationStatus = doctor?.verificationUploads?.status || "Pending";
const availabilityStatus = doctor?.availableNow === true; 

  // Sync tempStatus with verificationStatus
  useEffect(() => {
    setTempStatus(verificationStatus);
  }, [verificationStatus]);

  if (isLoading) return <Loader />;
  if (error)
    return (
      <Message variant="danger">
        {error?.data?.message || error.message}
      </Message>
    );

  const handleConfirmStatus = async () => {
    if (tempStatus === verificationStatus) return;

    try {
      await updateUser({ userId: user._id, status: tempStatus }).unwrap();
      toast.success(`Doctor status updated to ${tempStatus} successfully!`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to update doctor status");
    }
  };

  const handleDropdownChange = (e) => {
    setTempStatus(e.target.value);
  };

  const renderAvailabilityBadge = (availableNow) => {
    if (availableNow) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          Available
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Unavailable
      </span>
    );
  };

  const renderVerificationBadge = (status) => {
    if (status === "Approved") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879A1 1 0 003.293 9.293l4 4a1 1 0 001.414 0l8-8z" clipRule="evenodd" />
          </svg>
          Verified
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
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
        <svg className="w-3 h-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4a.75.75 0 00-1.5 0v4c0 .199.079.39.22.53l2.5 2.5a.75.75 0 101.06-1.06L10.75 9.44V6z" />
        </svg>
        Pending
      </span>
    );
  };

  // Star Rating Component
  const StarRating = ({ rating }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star) => (
          <span key={star} className="text-lg">
            {star <= rating ? (
              <span className="text-yellow-500">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </span>
        ))}
      </div>
    );
  };

  // Reviews Section Component
  const ReviewsSection = ({ reviews, doctorId, doctorName }) => {
    if (!reviews || reviews.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">No reviews yet for this doctor</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {reviews.map((review, index) => (
            <div key={review._id || index} className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-gray-900">{review.name}</p>
                  <StarRating rating={review.rating} />
                </div>
                <span className="text-xs text-gray-500">
                  {moment(review.createdAt).fromNow()}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen mt-5 bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user?.fullName || "User"}'s Profile</h1>
            <p className="mt-2 text-gray-600">
              Viewing profile details for {user?.fullName || "User"}
            </p>
          </div>
          
          {/* Back Button */}
          <Link
            to={isAdmin ? "/admin/userslist" : "/petowner/vets"}
            className="mt-4 md:mt-0 inline-flex items-center text-navigray hover:text-navigray-dark font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to {isAdmin ? "Users List" : "Doctors"}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Admin Menu */}
      

          {/* Main Content */}
          <div className={`${isAdmin ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-navigray to-navigray-dark px-8 py-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Profile Image */}
                  <div className="relative">
                    {isDoctor && doctor?.image ? (
                      <img
                        src={doctor.image}
                        alt={user.fullName}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-white text-4xl font-bold">
                        {user?.fullName?.charAt(0) || "U"}
                      </div>
                    )}
                    {/* Availability Badge - Always visible for doctors */}
                    {isDoctor && (
                      <div className="absolute -bottom-2 -right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                        {renderAvailabilityBadge(availabilityStatus)}
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {user?.fullName || "User"}
                    </h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/90">
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        {user?.email || "—"}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {user?.role || "—"}
                      </span>
                      {user?.phone && (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {user.phone}
                        </span>
                      )}
                    </div>
                    
                    {/* Doctor Rating Display */}
                    {isDoctor && doctor?.rating > 0 && (
                      <div className="mt-3 flex items-center justify-center md:justify-start bg-white/20 rounded-lg px-4 py-2 inline-flex">
                        <StarRating rating={doctor.rating} />
                        <span className="ml-2 text-white font-medium">
                          {doctor.rating.toFixed(1)} 
                          <span className="text-white/80 ml-1">
                            ({doctor.numReviews || 0} {doctor.numReviews === 1 ? 'review' : 'reviews'})
                          </span>
                        </span>
                      </div>
                    )}

                    {isDoctor && doctor?.degreeName && (
                      <p className="mt-4 text-white/80 text-lg">
                        {doctor.degreeName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-8">
                {/* Admin Doctor Verification Control - Only visible to admins */}
                {isAdmin && isDoctor && (
                  <div className="mb-8 p-6 bg-gray-50 rounded-xl border-l-4 border-navigray">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Verification</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Update Verification Status
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <select
                            value={tempStatus}
                            onChange={handleDropdownChange}
                            disabled={updatingStatus}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray bg-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button
                            onClick={handleConfirmStatus}
                            disabled={tempStatus === verificationStatus || updatingStatus}
                            className="px-6 py-3 bg-navigray text-white rounded-lg font-medium hover:bg-navigray-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navigray disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {updatingStatus ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Updating...
                              </>
                            ) : "Confirm Update"}
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Current status: <span className="font-medium">{verificationStatus}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Appointment Section */}
                {isDoctor && userInfo && userInfo._id !== user._id && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-navigray/5 to-navigray-dark/5 rounded-xl border border-navigray/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Schedule Appointment</h3>
                        <p className="text-gray-600">
                          Book a consultation with {user.fullName} for your pet's healthcare needs
                        </p>
                      </div>
                      <Link
                        to={`/${user._id}/newappointment`}
                        className="bg-navigray text-white font-bold py-3 px-8 rounded-lg hover:bg-navigray-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center whitespace-nowrap"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Book Appointment
                      </Link>
                    </div>
                  </div>
                )}

                {/* Doctor Professional Details */}
                {isDoctor && (
                  <div className="space-y-8">
                    {/* Professional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Professional Details
                        </h3>
                        <div className="space-y-3">
                          {doctor.specialization && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Specialization</span>
                              <span className="font-medium">{doctor.specialization}</span>
                            </div>
                          )}
                          {doctor.yearsOfExperience && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Experience</span>
                              <span className="font-medium">{doctor.yearsOfExperience} years</span>
                            </div>
                          )}
                          {doctor.pvmcRegistrationNumber && (
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">PVMC Registration</span>
                              <span className="font-medium">{doctor.pvmcRegistrationNumber}</span>
                            </div>
                          )}
                          {doctor.degreeName && (
                            <div className="flex justify-between py-2">
                              <span className="text-gray-600">Degree</span>
                              <span className="font-medium">{doctor.degreeName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Services Offered */}
                      {doctor?.servicesOffered && (
                        <div className="bg-gray-50 rounded-xl p-6">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Services Offered
                          </h3>
                          <div className="space-y-3">
                            {Object.entries(doctor.servicesOffered).map(([key, service]) => (
                              <div
                                key={key}
                                className={`p-3 rounded-lg ${
                                  service.available ? 'bg-green-50' : 'bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${
                                      service.available ? 'bg-green-500' : 'bg-gray-400'
                                    }`} />
                                    <span className="font-medium capitalize">
                                      {key.replace(/([A-Z])/g, ' $1')}
                                    </span>
                                  </div>
                                  {service.available && service.charges > 0 && (
                                    <span className="text-green-700 font-semibold text-sm">
                                      PKR {service.charges}
                                    </span>
                                  )}
                                </div>
                                {service.available && service.description && (
                                  <p className="text-sm text-gray-600 mt-1 ml-4">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Clinic Details */}
                    {doctor?.clinicDetails && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          Clinic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            {doctor.clinicDetails.clinicName && (
                              <div>
                                <p className="text-sm text-gray-600">Clinic Name</p>
                                <p className="font-medium">{doctor.clinicDetails.clinicName}</p>
                              </div>
                            )}
                            {(doctor.clinicDetails.clinicCity || doctor.clinicDetails.clinicDistrict) && (
                              <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-medium">
                                  {doctor.clinicDetails.clinicCity}
                                  {doctor.clinicDetails.clinicDistrict && `, ${doctor.clinicDetails.clinicDistrict}`}
                                </p>
                              </div>
                            )}
                            {doctor.clinicDetails.clinicStreet && (
                              <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="font-medium">{doctor.clinicDetails.clinicStreet}</p>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            {(doctor.clinicDetails.startTime && doctor.clinicDetails.endTime) && (
                              <div>
                                <p className="text-sm text-gray-600">Working Hours</p>
                                <p className="font-medium">{doctor.clinicDetails.startTime} – {doctor.clinicDetails.endTime}</p>
                              </div>
                            )}
                            {doctor.clinicDetails.googleMapLocation && (
                              <div>
                                <p className="text-sm text-gray-600 mb-2">Location Map</p>
                                <a
                                  href={doctor.clinicDetails.googleMapLocation}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-navigray hover:text-navigray-dark font-medium flex items-center"
                                >
                                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  View on Google Maps
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Home Visit Details */}
                    {doctor?.homeVisitDetails && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Home Visit Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {doctor.homeVisitDetails.areasCovered && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Areas Covered</p>
                              <div className="flex flex-wrap gap-2">
                                {Array.isArray(doctor.homeVisitDetails.areasCovered) 
                                  ? doctor.homeVisitDetails.areasCovered.map((area, index) => (
                                      <span
                                        key={index}
                                        className="px-3 py-1 bg-navigray/10 text-navigray rounded-full text-sm"
                                      >
                                        {area}
                                      </span>
                                    ))
                                  : <span className="font-medium">{doctor.homeVisitDetails.areasCovered}</span>
                                }
                              </div>
                            </div>
                          )}
                          {doctor.homeVisitDetails.charges && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Charges</p>
                              <p className="text-lg font-bold text-gray-900">PKR {doctor.homeVisitDetails.charges}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Reviews Section */}
                    {doctor?.reviews && doctor.reviews.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          Patient Reviews
                          <span className="ml-3 text-sm font-normal text-gray-600">
                            ({doctor.numReviews || 0} total)
                          </span>
                        </h3>
                        
                        <ReviewsSection 
                          reviews={doctor.reviews} 
                          doctorId={doctor._id}
                          doctorName={user.fullName}
                        />
                      </div>
                    )}

                    {/* Verification Documents - Only visible to admins */}
                    {isAdmin && doctor?.verificationUploads?.veterinaryLicense && (
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Verification Documents
                          <span className="ml-3">
                            {renderVerificationBadge(verificationStatus)}
                          </span>
                        </h3>
                        <div className="flex items-center gap-4">
                          <img
                            src={doctor.verificationUploads.veterinaryLicense}
                            alt="Veterinary License"
                            className="w-40 h-40 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="text-sm text-gray-600">Veterinary License</p>
                            <p className="text-sm text-gray-500">Uploaded for verification</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Pet Owner Details */}
                {isPetOwner && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Pet Owner Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {petOwner.address?.city && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">City</p>
                          <p className="font-medium">{petOwner.address.city}</p>
                        </div>
                      )}
                      {petOwner.address?.district && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">District/Area</p>
                          <p className="font-medium">{petOwner.address.district}</p>
                        </div>
                      )}
                      {petOwner.address?.street && (
                        <div className="bg-white rounded-lg p-4">
                          <p className="text-sm text-gray-600">Street Address</p>
                          <p className="font-medium">{petOwner.address.street}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Profile Message */}
                {!isDoctor && !isPetOwner && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Profile Details</h4>
                    <p className="text-gray-600">
                      This user hasn't completed their profile yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;