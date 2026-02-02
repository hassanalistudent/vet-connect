// src/pages/VideoSession.jsx
import React from "react";
import VideoCall from "../../components/videoCall"; // ✅ make sure file name matches

const VideoSession = () => {
  const channel = "vetconnect"; // example channel name
  const uid = String(Math.floor(Math.random() * 10000)); // random UID for demo

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* ✅ Only pass channel + uid now */}
      <VideoCall channel={channel} uid={uid} />
    </div>
  );
};

export default VideoSession;