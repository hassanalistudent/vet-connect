import React, { useEffect, useRef, useState } from "react";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import useAgora from "../hooks/useAgora";
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash,
  FaPhone,
  FaSyncAlt,
  FaUsers,
  FaCompress,
  FaExpand,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

export default function VideoCall({ appointmentId, uid }) {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const isDoctor = userInfo?.role === 'Doctor';
  const isPetOwner = userInfo?.role === 'PetOwner';
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [networkQuality, setNetworkQuality] = useState('Excellent');

  // ✅ Dynamic channel name using appointmentId
  const CHANNEL_NAME = appointmentId || "vetconnect-default";

  const { localTracks, remoteUsers, client } = useAgora(CHANNEL_NAME, uid);

  // Timer for call duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle local video
  useEffect(() => {
    const videoTrack = localTracks[1];
    if (localVideoRef.current && videoTrack) {
      videoTrack.play(localVideoRef.current);
      return () => videoTrack.stop();
    }
  }, [localTracks]);

  // Handle remote video
  useEffect(() => {
    if (remoteUsers.length > 0 && remoteUsers[0].videoTrack && remoteVideoRef.current) {
      remoteUsers[0].videoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUsers]);

  // Update connection status
  useEffect(() => {
    if (client) {
      setIsConnecting(false);
      setIsReconnecting(false);
      
      // Simulate network quality changes (you can replace with actual Agora network quality events)
      const interval = setInterval(() => {
        const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
        const randomIndex = Math.floor(Math.random() * 4);
        setNetworkQuality(qualities[randomIndex]);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [client]);

  const toggleMic = () => {
    const micTrack = localTracks[0];
    if (micTrack) {
      micOn ? micTrack.setEnabled(false) : micTrack.setEnabled(true);
      setMicOn(!micOn);
    }
  };

  const toggleCam = () => {
    const camTrack = localTracks[1];
    if (camTrack) {
      camOn ? camTrack.setEnabled(false) : camTrack.setEnabled(true);
      setCamOn(!camOn);
    }
  };

  const handleReconnect = () => {
    setIsReconnecting(true);
    window.location.reload();
  };

  const endCall = async () => {
    if (client) {
      await client.leave();
      localTracks.forEach((track) => track.close());
      
      // Role-based redirection
      if (isDoctor) {
        window.location.href = "/doctor/doctor-appointments";
      } else if (isPetOwner) {
        window.location.href = "/petowner/owner-appointments";
      } else {
        window.location.href = "/";
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantName = (userUid) => {
    if (userUid === uid) return "You";
    return isDoctor ? "Pet Owner" : "Veterinarian";
  };

  const getNetworkQualityColor = () => {
    switch(networkQuality) {
      case 'Excellent': return 'bg-green-500';
      case 'Good': return 'bg-blue-500';
      case 'Fair': return 'bg-yellow-500';
      case 'Poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const remoteUser = remoteUsers[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-navigray-dark">
      {/* Main Video Container */}
      <div className={`relative ${isMinimized ? 'h-64' : 'h-screen'}`}>
        {/* Remote Video - Full Screen */}
        {remoteUser?.videoTrack ? (
          <div 
            ref={remoteVideoRef} 
            className={`absolute inset-0 bg-black ${isMinimized ? 'rounded-2xl' : ''}`}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br from-navigray to-navigray-dark flex items-center justify-center ${isMinimized ? 'rounded-2xl' : ''}`}>
            <div className="text-center">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white/20">
                <span className="text-6xl">🐾</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isDoctor ? "Waiting for pet owner..." : "Waiting for veterinarian..."}
              </h2>
              <p className="text-white/70">Please wait while we connect you</p>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                {isMinimized ? (
                  <FaExpand className="text-white text-lg" />
                ) : (
                  <FaCompress className="text-white text-lg" />
                )}
              </button>
              
              {(isConnecting || isReconnecting) ? (
                <div className="flex items-center bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping mr-2"></div>
                  <span className="text-white font-medium">
                    {isReconnecting ? "Reconnecting..." : "Connecting..."}
                  </span>
                </div>
              ) : (
                <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                  <div className="font-medium text-white">{remoteUser ? "Consultation in Progress" : "Waiting..."}</div>
                  <div className="text-sm text-white/70 flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                    {formatTime(callDuration)}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowParticipants(!showParticipants)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-sm border border-white/10"
              >
                <FaUsers className="text-white text-lg" />
              </button>
              
              {/* Network Indicator */}
              <div className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-sm text-white flex items-center border border-white/10">
                <span className={`inline-block w-2 h-2 ${getNetworkQualityColor()} rounded-full mr-2 animate-pulse`}></span>
                {networkQuality}
              </div>
            </div>
          </div>
        </div>

        {/* Local Video - PiP */}
        {camOn && (
          <div className={`absolute ${isMinimized ? 'bottom-4 right-4 w-40 h-60' : 'bottom-24 right-6 w-48 h-64'} bg-black rounded-2xl overflow-hidden border-4 border-navigray/30 shadow-2xl transition-all duration-300`}>
            <div className="absolute top-2 left-2 z-10 text-xs bg-navigray/90 text-white px-2 py-1 rounded-full backdrop-blur-sm">
              You
            </div>
            <div ref={localVideoRef} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Connection Status Overlay */}
        {(isConnecting || isReconnecting) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center max-w-md mx-auto p-8 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-20 h-20 border-4 border-navigray/30 border-t-navigray rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isReconnecting ? "Reconnecting to call..." : "Connecting to call..."}
              </h3>
              <p className="text-white/70">This may take a few moments</p>
              {isReconnecting && (
                <div className="mt-4">
                  <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-navigray animate-pulse rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Control Bar */}
        <div className={`absolute ${isMinimized ? 'bottom-4 left-1/2 transform -translate-x-1/2' : 'bottom-6 left-1/2 transform -translate-x-1/2'} flex items-center space-x-4 bg-black/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/10 shadow-2xl`}>
          {/* Microphone */}
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
              micOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={micOn ? "Mute microphone" : "Unmute microphone"}
          >
            {micOn ? <FaMicrophone className="text-2xl" /> : <FaMicrophoneSlash className="text-2xl" />}
          </button>

          {/* Camera */}
          <button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-110 ${
              camOn 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={camOn ? "Turn off camera" : "Turn on camera"}
          >
            {camOn ? <FaVideo className="text-2xl" /> : <FaVideoSlash className="text-2xl" />}
          </button>

          {/* Reconnect */}
          <button
            onClick={handleReconnect}
            className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 hover:rotate-180 duration-500"
            title="Reconnect call"
          >
            <FaSyncAlt className="text-2xl text-white" />
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-110 shadow-xl hover:shadow-2xl"
            title="End call"
          >
            <FaPhone className="text-2xl text-white rotate-135" />
          </button>
        </div>

        {/* Participants List Modal */}
        {showParticipants && (
          <div className="absolute top-20 right-6 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white flex items-center">
                <FaUsers className="mr-2 text-navigray-light" />
                Participants ({remoteUsers.length + 1})
              </h3>
              <button 
                onClick={() => setShowParticipants(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <FaTimesCircle className="text-white/70 hover:text-white" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Local User */}
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="w-10 h-10 bg-gradient-to-r from-navigray to-navigray-dark rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">Y</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">You</div>
                  <div className="text-sm text-white/50">{isDoctor ? 'Veterinarian' : 'Pet Owner'}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} title={micOn ? 'Mic on' : 'Mic off'}></div>
                  <div className={`w-2 h-2 rounded-full ${camOn ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} title={camOn ? 'Camera on' : 'Camera off'}></div>
                </div>
              </div>

              {/* Remote Users */}
              {remoteUsers.map((user) => (
                <div key={user.uid} className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-800 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {isDoctor ? 'P' : 'V'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{getParticipantName(user.uid)}</div>
                    <div className="text-sm text-white/50">
                      {isDoctor ? 'Pet Owner' : 'Veterinarian'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.videoTrack ? (
                      <FaVideo className="text-green-400 text-sm" title="Video on" />
                    ) : (
                      <FaVideoSlash className="text-red-400 text-sm" title="Video off" />
                    )}
                    {user.audioTrack ? (
                      <FaMicrophone className="text-green-400 text-sm" title="Audio on" />
                    ) : (
                      <FaMicrophoneSlash className="text-red-400 text-sm" title="Audio off" />
                    )}
                  </div>
                </div>
              ))}

              {remoteUsers.length === 0 && (
                <div className="text-center py-6 text-white/50">
                  No other participants
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Minimized View */}
      {isMinimized && (
        <div className="fixed bottom-4 left-4 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-4 w-96 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-navigray to-navigray-dark rounded-full flex items-center justify-center">
                <span className="text-white font-bold">VC</span>
              </div>
              <div>
                <div className="font-semibold text-white">Video Consultation</div>
                <div className="text-sm text-white/50 flex items-center">
                  <span className={`inline-block w-2 h-2 ${getNetworkQualityColor()} rounded-full mr-2`}></span>
                  {formatTime(callDuration)} • {remoteUsers.length + 1} participant{remoteUsers.length !== 0 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMinimized(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                title="Expand"
              >
                <FaExpand className="text-white text-sm" />
              </button>
              <button 
                onClick={handleReconnect}
                className="w-8 h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors"
                title="Reconnect"
              >
                <FaSyncAlt className="text-white text-sm" />
              </button>
              <button 
                onClick={endCall}
                className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                title="End call"
              >
                <FaPhone className="text-white text-sm rotate-135" />
              </button>
            </div>
          </div>
          
          {/* Mini Video Preview */}
          <div className="relative h-32 bg-black rounded-xl overflow-hidden border-2 border-white/10">
            {remoteUser?.videoTrack ? (
              <div className="w-full h-full" ref={remoteVideoRef} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-navigray to-navigray-dark flex items-center justify-center">
                <span className="text-3xl">🐾</span>
              </div>
            )}
            
            {camOn && (
              <div className="absolute bottom-2 right-2 w-16 h-16 rounded-lg overflow-hidden border-2 border-white/30 shadow-lg">
                <div ref={localVideoRef} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}