import React, { useEffect, useRef, useCallback, useState } from "react";
import useAgora from "../hooks/useAgora";

const CHANNEL_NAME = "vetconnect";

export default function VideoCall({ uid }) {
  const localVideoRef = useRef(null);
  const remoteTracksRef = useRef({});
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [reconnectKey, setReconnectKey] = useState(0); // force remount

  const { localTracks, remoteUsers, client } = useAgora(CHANNEL_NAME, uid, reconnectKey);

  // Play local video
  useEffect(() => {
    const videoTrack = localTracks[1];
    if (localVideoRef.current && videoTrack) {
      videoTrack.play(localVideoRef.current);
      return () => videoTrack.stop();
    }
  }, [localTracks]);

  // Play remote videos
  useEffect(() => {
    remoteUsers.forEach((user) => {
      if (user.videoTrack && !remoteTracksRef.current[user.uid]) {
        remoteTracksRef.current[user.uid] = user.videoTrack;
        const element = document.querySelector(`[data-remote-uid="${user.uid}"]`);
        if (element && !element.hasChildNodes()) {
          user.videoTrack.play(element);
        }
      }
    });
  }, [remoteUsers]);

  const getRemoteVideoRef = useCallback(
    (remoteUid) => (el) => {
      if (el) {
        el.dataset.remoteUid = remoteUid;
        const track = remoteTracksRef.current[remoteUid];
        if (track) {
          el.innerHTML = "";
          track.play(el);
        }
      }
    },
    []
  );

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

  const reconnect = () => {
    setReconnectKey((prev) => prev + 1);
  };

  const otherUsers = remoteUsers.filter((user) => user.uid !== uid);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">VetConnect Video Session</h1>

      <div className="flex flex-wrap gap-6 mb-6">
        {/* Local video */}
        <div className="w-80 h-60 bg-gray-800 rounded-lg overflow-hidden relative">
          <span className="absolute top-2 left-2 text-xs bg-black bg-opacity-80 px-2 py-1 rounded">
            Me (UID {uid})
          </span>
          <div ref={localVideoRef} className="w-full h-full object-cover" />
        </div>

        {/* Remote videos */}
        {otherUsers.map((user) => (
          <div key={user.uid} className="w-80 h-60 bg-gray-800 rounded-lg overflow-hidden relative">
            <span className="absolute top-2 left-2 text-xs bg-black bg-opacity-80 px-2 py-1 rounded">
              User {user.uid} {user.videoTrack ? "📹 LIVE" : "🔇"}
            </span>
            <div
              ref={getRemoteVideoRef(user.uid)}
              className="w-full h-full object-cover"
              data-remote-uid={user.uid}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={toggleMic}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
        >
          {micOn ? "Mute Mic" : "Unmute Mic"}
        </button>
        <button
          onClick={toggleCam}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
        >
          {camOn ? "Turn Off Camera" : "Turn On Camera"}
        </button>
        <button
          onClick={reconnect}
          className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm"
        >
          Reconnect
        </button>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-800 p-4 rounded-lg text-sm space-y-1">
        <p><strong>Local UID:</strong> {uid}</p>
        <p><strong>Total remoteUsers:</strong> {remoteUsers.length}</p>
        <p><strong>Other users (filtered):</strong> {otherUsers.length}</p>
        <p><strong>Status:</strong> {client?.connectionState || "Disconnected"}</p>
        <p><strong>Local tracks:</strong> {localTracks.length}</p>
      </div>
    </div>
  );
}