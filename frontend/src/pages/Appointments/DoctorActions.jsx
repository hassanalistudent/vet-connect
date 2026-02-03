// src/pages/DoctorActions.jsx - ✅ VIDEO CALL + ACCEPTED/PAID LOGIC
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const DoctorActions = ({ appointment, appointmentId, doctorResponse, refetch }) => {
  const [doctorForm, setDoctorForm] = useState({
    status: "Scheduled",
    appointmentDate: "",
    appointmentTime: "",
  });

  // ✅ Updated logic: Video call + Accepted + Paid only
  const isVideoCall = appointment?.appointmentType?.toLowerCase().includes("video");
  const canDoctorQuickAct = appointment?.status === "Scheduled";
  const canDoctorComplete = appointment?.status === "Accepted" && appointment?.isPaid;
  const isCompleted = appointment?.status === "Completed";

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
    // ✅ COMPLETED STATE
    if (isCompleted) {
      return (
        <div className="col-span-full p-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border-2 border-gray-200 text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">Appointment Completed</h3>
          <p className="text-gray-600 text-lg">Medical record has been created</p>
        </div>
      );
    }

    // ✅ VIDEO CALL → REDIRECT TO VIDEO
    if (isVideoCall && canDoctorComplete) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left: Video Call Info */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-3xl shadow-2xl border-2 border-purple-200 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-6">📹</div>
            <h3 className="text-3xl font-bold text-purple-700 mb-4">Video Consultation</h3>
            <p className="text-xl text-purple-600 mb-6">{appointment.petId.petName || 'Pet'}</p>
            <div className="text-2xl font-bold text-gray-700">
              {appointment?.appointmentDate} at {appointment?.appointmentTime}
            </div>
          </div>

          {/* Right: Video Call Button */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-purple-300 flex flex-col justify-center">
            <h4 className="text-2xl font-bold text-purple-700 mb-8 flex items-center gap-4 text-center">
              🎥 Start Video Call
            </h4>
            <Link
              to={`/${appointmentId}/video`}
              className="w-full block bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xl font-bold py-8 px-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4 justify-center text-decoration-none mx-auto max-w-md"
            >
              📱 Join Video Consultation
            </Link>
            <p className="text-sm text-purple-700 mt-6 text-center">
              Click to start video call with pet owner
            </p>
          </div>
        </div>
      );
    }

    // ✅ ACCEPTED + PAID → COMPLETE APPOINTMENT
    if (canDoctorComplete) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Left: Status Info */}
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-12 rounded-3xl shadow-2xl border-2 border-emerald-200 flex flex-col items-center justify-center text-center">
            <div className="text-5xl mb-6">✅</div>
            <h3 className="text-3xl font-bold text-emerald-700 mb-4">Ready to Complete</h3>
            <p className="text-xl text-emerald-600 mb-6">
              ✓ Accepted <br />
              ✓ Paid ✅
            </p>
            <div className="text-2xl font-bold text-gray-700">
              {appointment?.appointmentDate} at {appointment?.appointmentTime}
            </div>
          </div>

          {/* Right: Complete Button */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-emerald-300 flex flex-col justify-center">
            <h4 className="text-2xl font-bold text-emerald-700 mb-8 flex items-center gap-4 text-center">
              🏥 Complete Consultation
            </h4>
            <Link
              to={`/doctor/appointments/${appointmentId}/complete`}
              className="w-full block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xl font-bold py-8 px-12 rounded-3xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4 justify-center text-decoration-none mx-auto max-w-md"
            >
              ✅ Complete & Create Medical Record
            </Link>
            <p className="text-sm text-emerald-700 mt-6 text-center">
              Mark consultation as done
            </p>
          </div>
        </div>
      );
    }

    // ✅ NOT ACTIONABLE
    if (!canDoctorQuickAct && !canDoctorComplete ) {
      return (
        <div className="col-span-full p-12 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-3xl border-2 border-yellow-200 text-center flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-2xl font-bold text-yellow-700 mb-2">
            Status: {appointment?.status} {appointment?.isPaid ? '(Paid)' : '(Pending Payment)'}
          </h3>
          <p className="text-gray-600 text-lg">Waiting for action</p>
        </div>
      );
    }

    // ✅ SCHEDULED → QUICK ACTIONS (REMOVED Complete button)
    return (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        {/* Quick Actions Form ONLY */}
        <form onSubmit={handleDoctorResponse} className="bg-white p-8 rounded-2xl shadow-xl border border-pink-200">
          <h4 className="text-xl font-bold text-pink-600 mb-6 flex items-center gap-3">
            🩺 Quick Actions
          </h4>
          
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-4">
              Action <span className="text-pink-500">*</span>
            </label>
            <select
              value={doctorForm.status}
              onChange={(e) => setDoctorForm(prev => ({ ...prev, status: e.target.value }))}
              className="w-full p-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-400 focus:border-pink-500 transition-all bg-gradient-to-r from-pink-50 to-indigo-50"
            >
              <option value="Scheduled">Keep Scheduled 🔄</option>
              <option value="Rescheduled">Reschedule 📅</option>
              <option value="Accepted">Accept & Confirm ✅</option>
              <option value="Cancelled">Cancel ❌</option>
            </select>
          </div>

          {doctorForm.status === "Rescheduled" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-blue-50 rounded-xl">
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">New Date</label>
                <input
                  type="date"
                  value={doctorForm.appointmentDate}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">New Time</label>
                <input
                  type="time"
                  value={doctorForm.appointmentTime}
                  onChange={(e) => setDoctorForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full p-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all"
          >
            {doctorForm.status === "Accepted" ? "Accept Appointment" : 
             doctorForm.status === "Cancelled" ? "Cancel Appointment" : 
             "Update Status"}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="mb-12 p-8 bg-gradient-to-br from-indigo-50 via-white to-pink-50 border-4 border-dashed border-pink-300 rounded-3xl shadow-2xl">
      <h3 className="text-3xl font-bold text-pink-700 mb-8 flex items-center gap-4">
        🩺 Doctor Control Panel
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          appointment?.status === "Scheduled" ? "bg-yellow-100 text-yellow-800" :
          appointment?.status === "Accepted" ? "bg-emerald-100 text-emerald-800" :
          appointment?.status === "Completed" ? "bg-green-100 text-green-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          {appointment?.status || "Scheduled"} {appointment?.isPaid && "💰"}
        </span>
      </h3>
      
      <div className="grid">
        {renderActionButtons()}
      </div>
    </div>
  );
};

export default DoctorActions;
