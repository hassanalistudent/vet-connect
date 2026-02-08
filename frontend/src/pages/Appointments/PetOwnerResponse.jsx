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

const PetOwnerResponse = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetAppointmentDetailsQuery(id);
  
  // ✅ Safely extract appointment object
  const appointment = data?.appointment || data?.data?.appointment || null;
  
  // Mutations - pass to child components
  const [ownerResponse] = useOwnerResponseMutation();
  const [markPaid] = useMarkAppointmentPaidMutation();

  const currentUserId = useSelector((state) => state.auth.userInfo?._id);
  const currentUserRole = useSelector((state) => state.auth.userInfo?.role);

  // Role check
  const isOwner = appointment?.ownerId?._id && currentUserId
    ? appointment.ownerId._id.toString() === currentUserId.toString()
    : false;
    
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

                {/* Doctor Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
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
                    <Link
                      to={`/${appointment.doctorId?._id}`}
                      className="inline-flex items-center text-navigray hover:text-navigray-dark font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      View Doctor Profile
                    </Link>
                  </div>
                </div>

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