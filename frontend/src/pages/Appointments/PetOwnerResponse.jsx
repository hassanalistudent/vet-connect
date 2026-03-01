// src/pages/AppointmentDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetAppointmentDetailsQuery,
  useOwnerResponseMutation,
  useMarkAppointmentPaidMutation,
} from "../../redux/api/appointmentApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import OwnerActions from "./OwnerActions";
import { useCreateReviewMutation } from "../../redux/api/platformreviewApiSlice";
import { useAddDoctorReviewMutation } from "../../redux/api/userApiSlice";

const PetOwnerResponse = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetAppointmentDetailsQuery(id);
  
  // ✅ Safely extract appointment object
  const appointment = data?.appointment || data?.data?.appointment || null;
  
  // Mutations
  const [ownerResponse] = useOwnerResponseMutation();
  const [markPaid] = useMarkAppointmentPaidMutation();
  const [addDoctorReview] = useAddDoctorReviewMutation();
  const [createPlatformReview] = useCreateReviewMutation();

  // Review state
  const [showDoctorReviewForm, setShowDoctorReviewForm] = useState(false);
  const [showPlatformReviewForm, setShowPlatformReviewForm] = useState(false);
  const [doctorReviewRating, setDoctorReviewRating] = useState(5);
  const [doctorReviewComment, setDoctorReviewComment] = useState("");
  const [platformReviewRating, setPlatformReviewRating] = useState(5);
  const [platformReviewComment, setPlatformReviewComment] = useState("");
  const [isSubmittingDoctorReview, setIsSubmittingDoctorReview] = useState(false);
  const [isSubmittingPlatformReview, setIsSubmittingPlatformReview] = useState(false);
  const [hoverDoctorRating, setHoverDoctorRating] = useState(0);
  const [hoverPlatformRating, setHoverPlatformRating] = useState(0);
  const [doctorReviewSubmitted, setDoctorReviewSubmitted] = useState(false);
  const [platformReviewSubmitted, setPlatformReviewSubmitted] = useState(false);

  const currentUserId = useSelector((state) => state.auth.userInfo?._id);
  const currentUserRole = useSelector((state) => state.auth.userInfo?.role);

  // Role check
  const isOwner = appointment?.ownerId?._id && currentUserId
    ? appointment.ownerId._id.toString() === currentUserId.toString()
    : false;

  // Check if user has already reviewed this doctor
  const hasAlreadyReviewedDoctor = appointment?.doctorId?.reviews?.some(
    review => review.user?.toString() === currentUserId?.toString()
  );

  // Check if user has already submitted a platform review for this appointment
  const hasAlreadySubmittedPlatformReview = appointment?.hasPlatformReview || false;

  // Check if can review doctor (appointment completed and not already reviewed)
  const canReviewDoctor = appointment?.status === "Completed" && 
                          !hasAlreadyReviewedDoctor && 
                          !doctorReviewSubmitted &&
                          isOwner;

  // Check if can submit platform review (appointment completed and not already submitted)
  const canSubmitPlatformReview = appointment?.status === "Completed" && 
                                  !hasAlreadySubmittedPlatformReview && 
                                  !platformReviewSubmitted &&
                                  isOwner;

  // Handle doctor review submission
  const handleSubmitDoctorReview = async (e) => {
    e.preventDefault();
    
    if (!doctorReviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setIsSubmittingDoctorReview(true);

    try {
      const reviewData = {
        rating: doctorReviewRating,
        comment: doctorReviewComment.trim()
      };

      const response = await addDoctorReview({
        id: appointment._id,
        data: reviewData
      }).unwrap();

      toast.success("Doctor review submitted successfully!");
      setShowDoctorReviewForm(false);
      setDoctorReviewSubmitted(true);
      setDoctorReviewRating(5);
      setDoctorReviewComment("");
      refetch();
    } catch (error) {
      // Show the exact error message from backend
      const errorMessage = error?.data?.error || error?.data?.message || "Failed to submit review";
      toast.error(errorMessage);
      console.error("Doctor review error:", error);
    } finally {
      setIsSubmittingDoctorReview(false);
    }
  };

  // Handle platform review submission - SHOW EXACT BACKEND ERROR
  const handleSubmitPlatformReview = async (e) => {
    e.preventDefault();
    
    if (!platformReviewComment.trim()) {
      toast.error("Please enter a review comment");
      return;
    }

    setIsSubmittingPlatformReview(true);

    try {
      const reviewData = {
        appointmentId: appointment._id,
        doctorId: appointment.doctorId?._id,
        rating: platformReviewRating,
        comment: platformReviewComment.trim()
      };

      const response = await createPlatformReview(reviewData).unwrap();

      toast.success("Platform review submitted successfully! Thank you for your feedback.");
      setShowPlatformReviewForm(false);
      setPlatformReviewSubmitted(true);
      setPlatformReviewRating(5);
      setPlatformReviewComment("");
      refetch();
    } catch (error) {
      // Show the exact error message from backend - no custom messages
      const errorMessage = error?.data?.error || error?.data?.message || "Failed to submit platform review";
      toast.error(errorMessage);
      console.error("Platform review error:", error);
      
      // Don't close the form on error - let user try again or see the error
      // Only close if it's a duplicate review error from backend
      if (errorMessage.includes("already reviewed")) {
        setShowPlatformReviewForm(false);
        setPlatformReviewSubmitted(true);
      }
    } finally {
      setIsSubmittingPlatformReview(false);
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRatingChange, hoverRating, onHoverChange, readOnly = false, size = "text-2xl" }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readOnly && onRatingChange(star)}
            onMouseEnter={() => !readOnly && onHoverChange(star)}
            onMouseLeave={() => !readOnly && onHoverChange(0)}
            disabled={readOnly}
            className={`${size} transition-transform hover:scale-110 ${
              readOnly ? "cursor-default" : "cursor-pointer"
            }`}
          >
            {star <= (hoverRating || rating) ? (
              <span className="text-yellow-500">★</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) return <Loader />;
  if (error) {
    return (
      <div className="p-8">
        <Message variant="danger">
          {error?.data?.message || error.error || "Failed to load appointment"}
        </Message>
      </div>
    );
  }
  if (!appointment) {
    return (
      <div className="p-8 text-center">
        <Message variant="warning">Appointment not found</Message>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
            <p className="mt-2 text-gray-600">
              ID: {appointment._id}
            </p>
          </div>
          
          <Link
            to="/petowner/owner-appointments"
            className="mt-4 md:mt-0 flex items-center text-navigray hover:text-navigray-dark font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Appointments
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Appointment Status Banner */}
            <div className={`mb-8 p-4 rounded-xl ${
              appointment.status === "Completed" 
                ? "bg-green-50 border border-green-200" 
                : appointment.status === "Cancelled"
                ? "bg-red-50 border border-red-200"
                : appointment.status === "Confirmed"
                ? "bg-blue-50 border border-blue-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    appointment.status === "Completed" 
                      ? "bg-green-500" 
                      : appointment.status === "Cancelled"
                      ? "bg-red-500"
                      : appointment.status === "Confirmed"
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}></div>
                  <span className={`text-lg font-medium ${
                    appointment.status === "Completed" 
                      ? "text-green-800" 
                      : appointment.status === "Cancelled"
                      ? "text-red-800"
                      : appointment.status === "Confirmed"
                      ? "text-blue-800"
                      : "text-yellow-800"
                  }`}>
                    Status: {appointment.status}
                  </span>
                </div>
                <div className="text-gray-600">
                  {moment(appointment.createdAt).format("MMM DD, YYYY")}
                </div>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Pet & Appointment Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Pet Details Card */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Pet Information
                  </h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      {appointment.petId?.petImages ? (
                        <img
                          src={appointment.petId.petImages}
                          alt={appointment.petId.petType}
                          className="w-32 h-32 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Pet Name</p>
                          <p className="font-medium">{appointment.petId?.petName || "Not named"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Type</p>
                          <p className="font-medium">{appointment.petId?.petType || "—"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Breed</p>
                          <p className="font-medium">{appointment.petId?.breed || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age</p>
                          <p className="font-medium">{appointment.petId?.age || "—"} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appointment Details Card */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Appointment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Date</p>
                      <p className="text-xl font-bold text-gray-900">
                        {moment(appointment.appointmentDate).format("MMMM Do, YYYY")}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Time</p>
                      <p className="text-xl font-bold text-gray-900">{appointment.appointmentTime}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Type</p>
                      <p className="text-xl font-bold text-gray-900">{appointment.appointmentType}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-2">Charges</p>
                      <p className="text-xl font-bold text-navigray">{appointment.charges} PKR</p>
                    </div>
                  </div>
                </div>

                {/* Medical Records (Only for Completed Appointments) */}
                {appointment.status === "Completed" && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Medical Records
                    </h3>
                    <div className="space-y-6">
                      {appointment.diagnosis && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Diagnosis</p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-900">{appointment.diagnosis}</p>
                          </div>
                        </div>
                      )}
                      {appointment.treatment && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Treatment</p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-900">{appointment.treatment}</p>
                          </div>
                        </div>
                      )}
                      {appointment.prescriptions && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Prescriptions</p>
                          <div className="bg-white rounded-lg p-4">
                            <p className="text-gray-900">{appointment.prescriptions}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Actions & Participants */}
              <div className="space-y-8">
                {/* Owner Actions */}
                {isOwner && appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <OwnerActions
                      appointment={appointment}
                      appointmentId={id}
                      ownerResponse={ownerResponse}
                      markPaid={markPaid}
                      refetch={refetch}
                    />
                  </div>
                )}

                {/* Doctor Information Card */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Veterinarian
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-lg">{appointment.doctorId?.fullName || "—"}</p>
                    </div>

                    {/* Doctor Rating (Display only) */}
                    {appointment.doctorId?.rating > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Rating</p>
                        <div className="flex items-center">
                          <StarRating 
                            rating={appointment.doctorId.rating} 
                            readOnly={true}
                            onRatingChange={() => {}}
                            onHoverChange={() => {}}
                          />
                          <span className="ml-2 text-gray-700 font-medium">
                            {appointment.doctorId.rating.toFixed(1)} 
                            <span className="text-gray-500 text-sm ml-1">
                              ({appointment.doctorId.numReviews || 0} reviews)
                            </span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Doctor Review Button (Only for completed appointments) */}
                    {canReviewDoctor && (
                      <div className="pt-4 border-t border-gray-200">
                        {!showDoctorReviewForm ? (
                          <button
                            onClick={() => setShowDoctorReviewForm(true)}
                            className="w-full px-4 py-3 bg-navigray hover:bg-navigray-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            Rate & Review This Doctor
                          </button>
                        ) : (
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h5 className="font-medium text-gray-900 mb-3">Write a Doctor Review</h5>
                            <form onSubmit={handleSubmitDoctorReview}>
                              {/* Star Rating */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Your Rating
                                </label>
                                <StarRating
                                  rating={doctorReviewRating}
                                  onRatingChange={setDoctorReviewRating}
                                  hoverRating={hoverDoctorRating}
                                  onHoverChange={setHoverDoctorRating}
                                />
                                <div className="mt-1 text-sm text-gray-500">
                                  {doctorReviewRating} star{doctorReviewRating !== 1 ? 's' : ''}
                                </div>
                              </div>

                              {/* Comment */}
                              <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Your Review
                                </label>
                                <textarea
                                  value={doctorReviewComment}
                                  onChange={(e) => setDoctorReviewComment(e.target.value)}
                                  placeholder="Share your experience with this doctor..."
                                  rows="4"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                                  required
                                />
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={isSubmittingDoctorReview}
                                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                  {isSubmittingDoctorReview ? (
                                    <>
                                      <Loader small />
                                      <span className="ml-2">Submitting...</span>
                                    </>
                                  ) : (
                                    'Submit Review'
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowDoctorReviewForm(false);
                                    setDoctorReviewComment("");
                                    setDoctorReviewRating(5);
                                  }}
                                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    )}

                    {hasAlreadyReviewedDoctor && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          You have already reviewed this doctor
                        </p>
                      </div>
                    )}

                    {doctorReviewSubmitted && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-700 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Doctor review submitted successfully! Thank you for your feedback.
                        </p>
                      </div>
                    )}

                    <Link
                      to={`/${appointment.doctorId?._id}`}
                      className="inline-flex items-center text-navigray hover:text-navigray-dark font-medium pt-2"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      View Doctor Profile
                    </Link>
                  </div>
                </div>

                {/* Platform Review Section */}
                {canSubmitPlatformReview && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Platform Review
                    </h3>

                    {!showPlatformReviewForm ? (
                      <button
                        onClick={() => setShowPlatformReviewForm(true)}
                        className="w-full px-4 py-3 bg-navigray hover:bg-navigray-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Rate Your Experience
                      </button>
                    ) : (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h5 className="font-medium text-gray-900 mb-3">Share Your Feedback</h5>
                        <form onSubmit={handleSubmitPlatformReview}>
                          {/* Star Rating */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Rating
                            </label>
                            <StarRating
                              rating={platformReviewRating}
                              onRatingChange={setPlatformReviewRating}
                              hoverRating={hoverPlatformRating}
                              onHoverChange={setHoverPlatformRating}
                            />
                            <div className="mt-1 text-sm text-gray-500">
                              {platformReviewRating} star{platformReviewRating !== 1 ? 's' : ''}
                            </div>
                          </div>

                          {/* Comment */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Your Review
                            </label>
                            <textarea
                              value={platformReviewComment}
                              onChange={(e) => setPlatformReviewComment(e.target.value)}
                              placeholder="Tell us about your overall experience with VettKoneckt..."
                              rows="4"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                              required
                            />
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isSubmittingPlatformReview}
                              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                              {isSubmittingPlatformReview ? (
                                <>
                                  <Loader small />
                                  <span className="ml-2">Submitting...</span>
                                </>
                              ) : (
                                'Submit Review'
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPlatformReviewForm(false);
                                setPlatformReviewComment("");
                                setPlatformReviewRating(5);
                              }}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {platformReviewSubmitted && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-green-800">Thank You!</h3>
                        <p className="mt-2 text-sm text-green-700">
                          Your platform review has been submitted successfully. 
                          We appreciate your feedback!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {hasAlreadySubmittedPlatformReview && !platformReviewSubmitted && (
                  <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-green-800">Thank You!</h3>
                        <p className="mt-2 text-sm text-green-700">
                          {typeof hasAlreadySubmittedPlatformReview === 'string' 
                            ? hasAlreadySubmittedPlatformReview 
                            : "You have already submitted a platform review for this appointment. We appreciate your feedback!"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Owner Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Your Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-lg">{appointment.ownerId?.fullName || "—"}</p>
                    </div>
                    {appointment.status === "Completed" && appointment.ownerId?.phone && (
                      <div>
                        <p className="text-sm text-gray-600">Contact</p>
                        <p className="font-medium">{appointment.ownerId.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Timeline
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">{moment(appointment.createdAt).format("MMM DD, YYYY")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Updated</span>
                      <span className="text-sm font-medium">{moment(appointment.updatedAt).format("MMM DD, YYYY")}</span>
                    </div>
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

export default PetOwnerResponse;