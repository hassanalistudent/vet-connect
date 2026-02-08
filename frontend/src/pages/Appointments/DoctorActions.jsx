import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const DoctorActions = ({ appointment, appointmentId, doctorResponse, completeAppointment, refetch }) => {
  const [doctorForm, setDoctorForm] = useState({
    status: "Scheduled",
    appointmentDate: "",
    appointmentTime: "",
  });

  const isVideoCall = appointment?.appointmentType === "Video Call";
  const canDoctorQuickAct = appointment?.status === "Scheduled";
  const canDoctorComplete = appointment?.status === "Accepted" && appointment?.isPaid;
  const isCompleted = appointment?.status === "Completed";
  const showVideoCallButton = isVideoCall && appointment?.isPaid && appointment?.status === "Accepted";

  useEffect(() => {
    if (appointment) {
      setDoctorForm({
        status: appointment.status || "Scheduled",
        appointmentDate: appointment.appointmentDate 
          ? new Date(appointment.appointmentDate).toISOString().split('T')[0] 
          : "",
        appointmentTime: appointment.appointmentTime || "",
      });
    }
  }, [appointment]);

  const handleDoctorResponse = async (e) => {
    e.preventDefault();
    
    if (appointment?.status !== "Scheduled") {
      toast.error("Can only update Scheduled appointments");
      return;
    }

    try {
      await doctorResponse({
        appointmentId,
        status: doctorForm.status,
        ...(doctorForm.status === "Rescheduled" && {
          appointmentDate: doctorForm.appointmentDate,
          appointmentTime: doctorForm.appointmentTime,
        }),
      }).unwrap();
      
      toast.success(`Appointment ${doctorForm.status.toLowerCase()} successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const renderActionButtons = () => {
    if (isCompleted) {
      return (
        <div className="w-full bg-gray-50 rounded-xl p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">Appointment Completed</h3>
          <p className="text-gray-600 text-center">Medical record has been created</p>
        </div>
      );
    }

    // Video Call Section (when applicable)
    if (showVideoCallButton) {
      return (
        <div className="w-full space-y-6">
          {/* Video Call Card */}
          <div className="w-full bg-purple-50 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-purple-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Consultation
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                READY
              </span>
            </div>
            <p className="text-purple-600 mb-4">
              {appointment.petId?.petName || 'Pet'} - {appointment.appointmentDate} at {appointment.appointmentTime}
            </p>
            <Link
              to={`/${appointmentId}/video`}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Video Call
            </Link>
          </div>

          {/* Complete Appointment Card */}
          <div className="w-full bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Appointment
            </h4>
            <Link
              to={`/doctor/${appointmentId}/complete`}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Appointment & Add Records
            </Link>
            <p className="text-sm text-green-600 mt-3 text-center">
              Create medical record after consultation
            </p>
          </div>
        </div>
      );
    }

    // Ready to Complete Section
    if (canDoctorComplete) {
      return (
        <div className="w-full space-y-6">
          {/* Payment Status */}
          <div className="w-full bg-green-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-green-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Status
              </h4>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                PAID
              </span>
            </div>
            <p className="text-green-600 text-center">Payment has been confirmed</p>
          </div>

          {/* Complete Action */}
          <div className="w-full bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Appointment
            </h4>
            <Link
              to={`/doctor/${appointmentId}/complete`}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Complete Appointment & Add Records
            </Link>
            <p className="text-sm text-green-600 mt-3 text-center">
              Create medical record after consultation
            </p>
          </div>
        </div>
      );
    }

    // Waiting Status (when not scheduled)
    if (!canDoctorQuickAct) {
      return (
        <div className="w-full space-y-6">
          {/* Payment Status */}
          <div className="w-full bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-yellow-700 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Payment Status
              </h4>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                appointment?.isPaid ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}>
                {appointment?.isPaid ? "PAID" : "PENDING"}
              </span>
            </div>
            <p className="text-yellow-600 text-center">
              {appointment?.isPaid ? 'Payment received' : 'Waiting for payment'}
            </p>
          </div>

          {/* Status Card */}
          <div className="w-full bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Current Status
            </h4>
            <div className="text-center">
              <span className="text-xl font-bold text-blue-800">{appointment?.status}</span>
              <p className="text-sm text-blue-600 mt-2">
                {appointment?.status === "Rescheduled" 
                  ? "Waiting for owner to accept new time" 
                  : "Waiting for owner action"}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Quick Action Form (for Scheduled appointments) - Full width dropdown form
    return (
      <div className="w-full space-y-6">
        {/* Status Information */}
        <div className="w-full bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quick Actions
          </h4>
          <p className="text-blue-600 mb-4">
            Update appointment status and time (if rescheduling)
          </p>
        </div>

        {/* Quick Action Form */}
        <form onSubmit={handleDoctorResponse} className="w-full bg-white rounded-xl p-6 border border-gray-200 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Appointment Action
            </label>
            <select
              value={doctorForm.status}
              onChange={(e) => setDoctorForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
            >
              <option value="Scheduled">Keep as Scheduled</option>
              <option value="Rescheduled">Reschedule</option>
              <option value="Accepted">Accept</option>
              <option value="Cancelled">Cancel</option>
            </select>
          </div>

          {/* Reschedule Fields (Conditional) */}
          {doctorForm.status === "Rescheduled" && (
            <div className="w-full space-y-4 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-700">New Appointment Details</h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                  <input
                    type="date"
                    value={doctorForm.appointmentDate}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                  <input
                    type="time"
                    value={doctorForm.appointmentTime}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navigray focus:border-navigray"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-navigray hover:bg-navigray-dark text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Update Appointment Status
          </button>
        </form>

        {/* Note */}
        <div className="w-full bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-sm text-yellow-700 text-center">
            Note: Quick actions are only available for "Scheduled" appointments
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <svg className="w-6 h-6 mr-2 text-navigray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Actions
      </h3>
      {renderActionButtons()}
    </div>
  );
};

export default DoctorActions;