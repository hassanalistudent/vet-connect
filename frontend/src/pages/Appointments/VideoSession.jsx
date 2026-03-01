// src/pages/VideoSession.jsx - Full Screen UI
import React, { useState, useEffect } from "react";
import VideoCall from "../../components/VideoCall";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAppointmentDetailsQuery } from "../../redux/api/appointmentApiSlice";
import Loader from "../../components/Loader";
import moment from "moment";
import { 
  FaArrowLeft, 
  FaShieldAlt, 
  FaQuestionCircle,
  FaUserMd,
  FaPaw,
  FaVideo,
  FaCalendarAlt,
  FaClock,
  FaHashtag,
  FaCheckCircle,
  FaLock
} from 'react-icons/fa';

const VideoSession = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [uid] = useState(() => `VC${Date.now().toString().slice(-6)}`);
  const [showInfo, setShowInfo] = useState(false);
  
  // Fetch appointment details
  const { data, isLoading } = useGetAppointmentDetailsQuery(appointmentId);
  const appointment = data?.appointment || data?.data?.appointment || null;

  // Format time for display
  const formatTime = (timeString) => {
    return moment(`1970-01-01T${timeString}`).format("hh:mm A");
  };

  const handleHelp = () => {
    setShowInfo(!showInfo);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-navigray-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-navigray border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-2xl font-semibold text-white mb-2">Loading Video Session</h3>
          <p className="text-gray-400">Preparing your secure consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 to-navigray-dark overflow-hidden">
      {/* Compact Header - Fixed at top */}
      <div className="flex-shrink-0 bg-gray-900/95 backdrop-blur-xl border-b border-white/10 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-105"
              title="Go back"
            >
              <FaArrowLeft className="text-white text-sm" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-navigray to-navigray-dark rounded-full flex items-center justify-center shadow-lg">
                <FaVideo className="text-white text-sm" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">
                  {appointment?.petId?.petName || "Video Consultation"}
                </h1>
                <div className="flex items-center space-x-2 text-xs text-white/50">
                  <span>#{appointmentId?.slice(-6) || "N/A"}</span>
                  <span>•</span>
                  <span>{appointment?.appointmentType || "Video Call"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Compact info */}
          <div className="flex items-center space-x-2">
            {/* Connection Status - Dot only */}
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>

            {/* Quick pet info - Icon only on mobile, text on desktop */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-white/5 rounded-full">
              <FaPaw className="text-white/70 text-xs" />
              <span className="text-xs text-white/90">
                {appointment?.petId?.petName || "Pet"}
              </span>
            </div>

            {/* Security badge - Icon only */}
            <div className="hidden md:flex items-center space-x-1 px-2 py-1 bg-green-500/10 rounded-full">
              <FaLock className="text-green-400 text-xs" />
              <span className="text-xs text-green-400">Encrypted</span>
            </div>

            {/* Help button */}
            <button 
              onClick={handleHelp}
              className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              title="Session info"
            >
              <FaQuestionCircle className="text-white text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Call Component - Takes remaining space */}
      <div className="flex-1 relative">
        <VideoCall appointmentId={appointmentId} uid={uid} />
      </div>

      {/* Info Overlay - Toggle with help button */}
      {showInfo && (
        <div className="absolute top-16 right-4 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white flex items-center">
              <FaShieldAlt className="mr-2 text-navigray-light" />
              Session Information
            </h3>
            <button 
              onClick={() => setShowInfo(false)}
              className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs">✕</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Appointment Details */}
            <div className="bg-white/5 rounded-xl p-3">
              <h4 className="text-xs font-medium text-white/50 mb-2">APPOINTMENT DETAILS</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/70 text-xs">
                    <FaCalendarAlt className="mr-2 text-navigray-light" />
                    Date
                  </div>
                  <span className="text-white text-xs font-medium">
                    {appointment?.appointmentDate 
                      ? moment(appointment.appointmentDate).format("MMM D, YYYY")
                      : "Today"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/70 text-xs">
                    <FaClock className="mr-2 text-navigray-light" />
                    Time
                  </div>
                  <span className="text-white text-xs font-medium">
                    {appointment?.appointmentTime 
                      ? formatTime(appointment.appointmentTime)
                      : "Scheduled"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/70 text-xs">
                    <FaHashtag className="mr-2 text-navigray-light" />
                    Session ID
                  </div>
                  <span className="text-white text-xs font-mono">{appointmentId?.slice(-8)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/70 text-xs">
                    <FaUserMd className="mr-2 text-navigray-light" />
                    Doctor
                  </div>
                  <span className="text-white text-xs font-medium">
                    {appointment?.doctorId?.fullName || "Dr. Available"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-white/70 text-xs">
                    <FaPaw className="mr-2 text-navigray-light" />
                    Pet
                  </div>
                  <span className="text-white text-xs font-medium">
                    {appointment?.petId?.petName || "Unknown"} 
                    {appointment?.petId?.petType && ` (${appointment.petId.petType})`}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection Info */}
            <div className="bg-white/5 rounded-xl p-3">
              <h4 className="text-xs font-medium text-white/50 mb-2">CONNECTION</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs">Your UID</span>
                  <span className="text-white text-xs font-mono bg-white/10 px-2 py-1 rounded">{uid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs">Status</span>
                  <span className="flex items-center text-green-400 text-xs">
                    <FaCheckCircle className="mr-1 text-xs" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-xs">Encryption</span>
                  <span className="text-green-400 text-xs">End-to-end encrypted</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => window.open('mailto:support@vetconnect.com')}
                className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-medium transition-colors"
              >
                Contact Support
              </button>
              <button
                onClick={() => setShowInfo(false)}
                className="flex-1 px-3 py-2 bg-navigray hover:bg-navigray-dark rounded-xl text-white text-xs font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Very subtle status bar at bottom - only visible on hover */}
      <div className="flex-shrink-0 h-1 bg-gradient-to-r from-navigray/0 via-navigray to-navigray/0 opacity-0 hover:opacity-100 transition-opacity"></div>
    </div>
  );
};

export default VideoSession;