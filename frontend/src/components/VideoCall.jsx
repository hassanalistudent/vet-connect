import React, { useEffect, useRef, useState } from "react";
import useAgora from "../hooks/useAgora";

const CHANNEL_NAME = "vetconnect";

export default function VideoCall({ uid }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showParticipants, setShowParticipants] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);

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
      window.location.href = "/doctor/doctor-appointments";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantName = (userUid) => {
    return userUid === uid ? "You" : `Veterinarian ${userUid}`;
  };

  const remoteUser = remoteUsers[0];

  return (
    <div className="min-h-screen bg-[#0C1317]">
      {/* Main Video Container */}
      <div className={`relative ${isMinimized ? 'h-64' : 'h-screen'}`}>
        {/* Remote Video - Full Screen */}
        {remoteUser?.videoTrack ? (
          <div 
            ref={remoteVideoRef} 
            className={`absolute inset-0 bg-black ${isMinimized ? 'rounded-2xl' : ''}`}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br from-[#128C7E] to-[#075E54] flex items-center justify-center ${isMinimized ? 'rounded-2xl' : ''}`}>
            <div className="text-center">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">🐾</span>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Waiting for veterinarian...</h2>
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
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-lg">
                  {isMinimized ? "↗" : "↙"}
                </span>
              </button>
              
              {(isConnecting || isReconnecting) ? (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping mr-2"></div>
                  <span className="text-white font-medium">
                    {isReconnecting ? "Reconnecting..." : "Connecting..."}
                  </span>
                </div>
              ) : (
                <div className="text-white">
                  <div className="font-medium">{remoteUser ? "Veterinary Consultation" : "Waiting..."}</div>
                  <div className="text-sm text-white/70">{formatTime(callDuration)}</div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowParticipants(!showParticipants)}
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <span className="text-white text-lg">👥</span>
              </button>
              
              {/* Network Indicator */}
              <div className="px-3 py-1 bg-white/10 rounded-full text-sm text-white">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Excellent
              </div>
            </div>
          </div>
        </div>

        {/* Local Video - PiP */}
        {camOn && (
          <div className={`absolute ${isMinimized ? 'bottom-4 right-4 w-40 h-60' : 'bottom-24 right-6 w-48 h-64'} bg-black rounded-2xl overflow-hidden border-2 border-white/20 transition-all duration-300`}>
            <div className="absolute top-2 left-2 z-10 text-xs bg-black/50 text-white px-2 py-1 rounded">
              You
            </div>
            <div ref={localVideoRef} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Connection Status Overlay */}
        {(isConnecting || isReconnecting) && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {isReconnecting ? "Reconnecting to call..." : "Connecting to call..."}
              </h3>
              <p className="text-white/70">This may take a few moments</p>
              {isReconnecting && (
                <div className="mt-4">
                  <div className="w-64 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 animate-pulse rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Control Bar */}
        <div className={`absolute ${isMinimized ? 'bottom-4 left-1/2 transform -translate-x-1/2' : 'bottom-6 left-1/2 transform -translate-x-1/2'} flex items-center space-x-4 bg-black/50 backdrop-blur-lg rounded-full px-6 py-3`}>
          {/* Microphone */}
          <button
            onClick={toggleMic}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              micOn 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <span className="text-2xl">
              {micOn ? "🎤" : "🎤❌"}
            </span>
          </button>

          {/* Camera */}
          <button
            onClick={toggleCam}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              camOn 
                ? 'bg-white/10 hover:bg-white/20' 
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            <span className="text-2xl">
              {camOn ? "📹" : "📹❌"}
            </span>
          </button>

          {/* Reconnect */}
          <button
            onClick={handleReconnect}
            className="w-14 h-14 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-all"
            title="Reconnect call"
          >
            <span className="text-2xl">🔄</span>
          </button>

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all transform hover:scale-105"
          >
            <span className="text-2xl">📞</span>
          </button>
        </div>

        {/* Participants List Modal */}
        {showParticipants && (
          <div className="absolute top-20 right-6 w-80 bg-[#202C33] rounded-xl shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Participants ({remoteUsers.length + 1})</h3>
              <button 
                onClick={() => setShowParticipants(false)}
                className="text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Local User */}
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white">Y</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-white">You</div>
                  <div className="text-sm text-white/50">Host</div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <div className={`w-2 h-2 rounded-full ${camOn ? 'bg-green-400' : 'bg-red-400'}`}></div>
                </div>
              </div>

              {/* Remote Users */}
              {remoteUsers.map((user) => (
                <div key={user.uid} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white">V</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{getParticipantName(user.uid)}</div>
                    <div className="text-sm text-white/50">Veterinarian</div>
                  </div>
                  <div className="text-sm text-white/70">
                    {user.videoTrack ? "📹 Live" : "🔇"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Minimized View */}
      {isMinimized && (
        <div className="fixed bottom-4 left-4 bg-[#202C33] rounded-xl shadow-2xl p-4 w-96">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white">VC</span>
              </div>
              <div>
                <div className="font-semibold text-white">Video Consultation</div>
                <div className="text-sm text-white/50">{formatTime(callDuration)} • {remoteUsers.length + 1} participants</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsMinimized(false)}
                className="text-white hover:text-white/70"
              >
                ↗
              </button>
              <button 
                onClick={handleReconnect}
                className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center"
                title="Reconnect"
              >
                <span className="text-sm">🔄</span>
              </button>
              <button 
                onClick={endCall}
                className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
              >
                <span className="text-sm">📞</span>
              </button>
            </div>
          </div>
          
          {/* Mini Video Preview */}
          <div className="relative h-32 bg-black rounded-lg overflow-hidden">
            {remoteUser?.videoTrack ? (
              <div className="w-full h-full" ref={remoteVideoRef} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#128C7E] to-[#075E54] flex items-center justify-center">
                <span className="text-3xl">🐾</span>
              </div>
            )}
            
            {camOn && (
              <div className="absolute bottom-2 right-2 w-16 h-16 rounded-lg overflow-hidden border border-white/30">
                <div ref={localVideoRef} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}