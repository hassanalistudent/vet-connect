// src/pages/VideoSession.jsx - Updated WhatsApp Style
import React, { useState, useEffect } from "react";
import VideoCall from "../../components/videoCall";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAppointmentDetailsQuery } from "../../redux/api/appointmentApiSlice";
import Loader from "../../components/Loader";
import moment from "moment";

const VideoSession = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [uid] = useState(() => `VC${Date.now().toString().slice(-6)}`);
  
  // Fetch appointment details
  const { data, isLoading } = useGetAppointmentDetailsQuery(appointmentId);
  const appointment = data?.appointment || data?.data?.appointment || null;

  // Format time for display
  const formatTime = (timeString) => {
    return moment(`1970-01-01T${timeString}`).format("hh:mm A");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0C1317] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#128C7E] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-white mb-2">Loading Video Session</h3>
          <p className="text-gray-400">Preparing your consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C1317] mt-5">
      {/* WhatsApp-like Header */}
      <div className="bg-[#202C33] border-b border-[#2A3942]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side: Back button and Appointment Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-[#2A3942] hover:bg-[#37434A] rounded-full flex items-center justify-center transition-colors"
                title="Go back"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#128C7E] to-[#075E54] rounded-full flex items-center justify-center">
                  <span className="text-2xl">🐾</span>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">
                    {appointment?.petId?.petName || "Veterinary Consultation"}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-[#8696A0]">
                      {appointment?.appointmentDate 
                        ? moment(appointment.appointmentDate).format("MMM D, YYYY")
                        : "Today"}
                    </span>
                    <span className="text-[#8696A0]">•</span>
                    <span className="text-[#8696A0]">
                      {appointment?.appointmentTime 
                        ? formatTime(appointment.appointmentTime)
                        : "Scheduled"}
                    </span>
                    <span className="text-[#8696A0]">•</span>
                    <span className="text-[#8696A0]">
                      Appointment #{appointmentId?.slice(-8) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Status and Connection Info */}
            <div className="flex items-center space-x-6">
              {/* Pet Info Badge */}
              {appointment?.petId && (
                <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-[#2A3942] rounded-lg">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    {appointment.petId?.petImages ? (
                      <img 
                        src={appointment.petId.petImages} 
                        alt={appointment.petId.petName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#128C7E] flex items-center justify-center">
                        <span className="text-white text-sm">🐕</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {appointment.petId.petName || "Pet"}
                    </div>
                    <div className="text-xs text-[#8696A0]">
                      {appointment.petId.petType || "Animal"}
                    </div>
                  </div>
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-400">Connected</span>
              </div>

              {/* UID Display */}
              <div className="hidden lg:flex items-center space-x-2 px-3 py-2 bg-[#2A3942] rounded-lg">
                <span className="text-sm text-[#8696A0]">UID:</span>
                <span className="text-sm font-mono text-white font-medium">{uid}</span>
              </div>

              {/* Help Button */}
              <button 
                onClick={() => {
                  // Open help modal or redirect to help page
                  alert("Need help? Contact support at support@vetconnect.com");
                }}
                className="w-10 h-10 bg-[#2A3942] hover:bg-[#37434A] rounded-full flex items-center justify-center transition-colors"
                title="Get help"
              >
                <span className="text-lg">❓</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Call Component */}
      <VideoCall uid={uid} />

      {/* Footer Info */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0C1317]/90 backdrop-blur-sm border-t border-[#2A3942] p-4 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Security Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-white">🔒 End-to-end encrypted</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-[#8696A0]">•</span>
                <span className="text-sm text-[#8696A0]">Your consultation is private and secure</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-[#8696A0">Appointment Type:</span>
                <span className="text-white font-medium">{appointment?.appointmentType || "Video Call"}</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <span className="text-[#8696A0">Doctor:</span>
                <span className="text-white font-medium">{appointment?.doctorId?.fullName || "Dr. Available"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[#8696A0">Status:</span>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  appointment?.status === "Accepted" ? "bg-green-500/20 text-green-400" : 
                  appointment?.status === "Scheduled" ? "bg-blue-500/20 text-blue-400" : 
                  "bg-yellow-500/20 text-yellow-400"
                }`}>
                  {appointment?.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSession;