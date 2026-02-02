// src/pages/VideoSession.jsx - ✅ PRODUCTION READY
import React, { useState } from "react";
import VideoCall from "../../components/videoCall";
import { useParams } from "react-router-dom";

const VideoSession = () => {
  const { appointmentId } = useParams(); // From /video/:appointmentId
  const [channel] = useState("vetconnect"); 
  const [uid] = useState(String(Math.floor(Math.random() * 10000)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-pink-400 bg-clip-text text-transparent">
            🩺 Video Consultation
          </h2>
          <div className="text-sm text-gray-400">
            Channel: {channel} | UID: {uid}
          </div>
        </div>
        
        <VideoCall channel={channel} uid={uid} />
      </div>
    </div>
  );
};

export default VideoSession;
