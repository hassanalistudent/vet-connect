// src/pages/AppointmentDetails.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  useGetAppointmentDetailsQuery,
  useDoctorResponseMutation,
  useOwnerResponseMutation,
  useMarkAppointmentPaidMutation,
  useCompleteAppointmentMutation,
} from "../../redux/api/appointmentApiSlice";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import moment from "moment";
import DoctorActions from "./DoctorActions";

const DoctorResponse = () => {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetAppointmentDetailsQuery(id);
  
  // ✅ Safely extract appointment object
  const appointment = data?.appointment || data?.data?.appointment || null;
  
  // Mutations - pass to child components
  const [doctorResponse] = useDoctorResponseMutation();
  const [ownerResponse] = useOwnerResponseMutation();
  const [markPaid] = useMarkAppointmentPaidMutation();
  const [completeAppointment] = useCompleteAppointmentMutation();

  const currentUserId = useSelector((state) => state.auth.userInfo?._id);
  const currentUserRole = useSelector((state) => state.auth.userInfo?.role);

  // Role checking
  const isDoctor = appointment?.doctorId?._id && currentUserId
    ? appointment.doctorId._id.toString() === currentUserId.toString()
    : false;

  const isOwner = appointment?.ownerId?._id && currentUserId
    ? appointment.ownerId._id.toString() === currentUserId.toString()
    : false;

  const isAdmin = currentUserRole === "Admin";

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-xl rounded-3xl p-8">
        {/* Header - UI EXACTLY SAME */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
            Appointment Details
          </h1>
          <Link
            to="/doctor/doctor-appointments"
            className="px-6 py-3 bg-pink-100 hover:bg-pink-200 text-pink-700 font-semibold rounded-xl transition-all duration-300 flex items-center gap-2"
          >
            ← Back to Appointments
          </Link>
        </div>

        {/* Main Info Cards - UI EXACTLY SAME */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="relative">
            <div className="w-full aspect-square max-w-md mx-auto bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 border-8 border-pink-100 shadow-2xl flex items-center justify-center">
              {appointment.petId?.petImages ? (
                <img
                  src={appointment.petId.petImages}
                  alt={appointment.petId.petType}
                  className="w-full h-full object-cover rounded-2xl shadow-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">🐕</div>
                  <p className="text-gray-500 font-medium text-lg">No Pet Image</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-blue-400">
                <span className="text-sm text-gray-500 font-medium">Date</span>
                <p className="text-2xl font-bold text-gray-900">
                  {moment(appointment.appointmentDate).format("MMMM Do, YYYY")}
                </p>
              </div>
              <div className="space-y-3 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-l-4 border-green-400">
                <span className="text-sm text-gray-500 font-medium">Time</span>
                <p className="text-2xl font-bold text-gray-900">{appointment.appointmentTime}</p>
              </div>
              <div className="space-y-3 p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border-l-4 border-purple-400">
                <span className="text-sm text-gray-500 font-medium">Status</span>
                <span className={`inline-block px-6 py-3 rounded-full text-lg font-bold ${
                  appointment.status === "Cancelled" 
                    ? "bg-red-100 text-red-800 border-2 border-red-200" 
                    : appointment.status === "Completed" 
                    ? "bg-green-100 text-green-800 border-2 border-green-200" 
                    : "bg-blue-100 text-blue-800 border-2 border-blue-200"
                }`}>
                  {appointment.status}
                </span>
              </div>
              <div className="space-y-3 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-l-4 border-pink-400">
                <span className="text-sm text-gray-500 font-medium">Charges</span>
                <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-pink-700 bg-clip-text text-transparent">
                  {appointment.charges} PKR
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ SEPARATED: Doctor Actions */}
        {isDoctor && appointment.status !== "Cancelled" && appointment.status !== "Completed" &&  (
          <DoctorActions
            appointment={appointment}
            appointmentId={id}
            doctorResponse={doctorResponse}
            completeAppointment={completeAppointment}
            refetch={refetch}
          />
        )}

        {/* Participants Grid - UI EXACTLY SAME */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl shadow-xl border border-pink-200">
            <h4 className="text-xl font-bold text-pink-700 mb-4">👨‍⚕️ Doctor</h4>
            {appointment.doctorId ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">{appointment.doctorId.fullName}</p>
                <p className="text-lg text-gray-600">{appointment.doctorId.email}</p>
                {appointment.doctorId.phone && (
                  <p className="text-lg text-gray-500 mt-1">{appointment.doctorId.phone}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-lg">Doctor data loading...</p>
            )}
          </div>

          <div className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl shadow-xl border border-blue-200">
            <h4 className="text-xl font-bold text-blue-700 mb-4">👩‍🦰 Pet Owner</h4>
            {appointment.ownerId ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">{appointment.ownerId.fullName}</p>
                <p className="text-lg text-gray-600">{appointment.ownerId.email}</p>
                {appointment.ownerId.phone && (
                  <p className="text-lg text-gray-500 mt-1">{appointment.ownerId.phone}</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-lg">Owner data loading...</p>
            )}
          </div>

          <div className="p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl shadow-xl border border-emerald-200">
            <h4 className="text-xl font-bold text-emerald-700 mb-4">🐶 Pet</h4>
            {appointment.petId ? (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">{appointment.petId.petType}</p>
                {appointment.petId.breed && (
                  <p className="text-lg text-gray-600">{appointment.petId.breed}</p>
                )}
                {appointment.petId.age && (
                  <p className="text-lg text-gray-500">{appointment.petId.age} years</p>
                )}
              </>
            ) : (
              <p className="text-gray-500 text-lg">Pet data loading...</p>
            )}
          </div>

          <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl border border-gray-200">
            <h4 className="text-xl font-bold text-gray-700 mb-4">📅 Timeline</h4>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Created:</span> {moment(appointment.createdAt).format("MMM DD, YYYY h:mm A")}</p>
              <p><span className="font-semibold">Updated:</span> {moment(appointment.updatedAt).format("MMM DD, YYYY h:mm A")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorResponse;
