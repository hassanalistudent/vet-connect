// ✅ FIXED useAgora - Proper cleanup + refresh handling
import { useEffect, useState, useCallback, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useAgora(channelName, uid) {
  const [client, setClient] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);
  
  // ✅ REF for cleanup
  const mountedRef = useRef(true);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);

  const createClient = useCallback(() => {
    return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false; // ✅ Mark unmounted on refresh
    };
  }, []);

  useEffect(() => {
    if (!uid || !APP_ID || !channelName) return;

    const newClient = createClient();
    clientRef.current = newClient;
    setClient(newClient);

    let cleanupFuncs = [];

    async function initAndJoin() {
      try {
        console.log("🔗 Requesting token for channel:", channelName, "UID:", uid);

        const response = await fetch(
          `${API_BASE_URL}/api/video/token?channelName=${channelName}&uid=${uid}`
        );
        
        if (!response.ok) throw new Error(`Token fetch failed: ${response.status}`);
        const { token } = await response.json();

        // ✅ Join channel
        await newClient.join(APP_ID, channelName, token, uid);
        console.log("✅ Joined channel:", uid);

        // ✅ Create local tracks
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const camTrack = await AgoraRTC.createCameraVideoTrack();
        
        localTracksRef.current = [micTrack, camTrack];
        if (mountedRef.current) {
          setLocalTracks([micTrack, camTrack]);
        }

        // ✅ Publish tracks
        await newClient.publish([micTrack, camTrack]);
        console.log("📤 Published tracks");

        // ✅ Event handlers
        const handleUserPublished = async (user, mediaType) => {
          if (!mountedRef.current) return;
          
          console.log("📹 User published:", user.uid, mediaType);
          await newClient.subscribe(user, mediaType);

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          if (mediaType === "video") {
            const remoteEl = document.getElementById(`remote-video-${user.uid}`);
            if (remoteEl) {
              user.videoTrack?.play(remoteEl);
            }
          }

          if (mountedRef.current) {
            setRemoteUsers((prev) => {
              const exists = prev.find((u) => u.uid === user.uid);
              if (exists) {
                return prev.map((u) => (u.uid === user.uid ? user : u));
              }
              return [...prev, user];
            });
          }
        };

        const handleUserUnpublished = (user) => {
          console.log("🔇 User unpublished:", user.uid);
          if (mountedRef.current) {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
        };

        const handleUserLeft = (user) => {
          console.log("👋 User left:", user.uid);
          if (mountedRef.current) {
            setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
          }
        };

        // ✅ Store cleanup functions
        cleanupFuncs = [
          () => newClient.off("user-published", handleUserPublished),
          () => newClient.off("user-unpublished", handleUserUnpublished),
          () => newClient.off("user-left", handleUserLeft)
        ];

        newClient.on("user-published", handleUserPublished);
        newClient.on("user-unpublished", handleUserUnpublished);
        newClient.on("user-left", handleUserLeft);

      } catch (err) {
        console.error("❌ Agora error:", err);
      }
    }

    initAndJoin();

    // ✅ Cleanup on unmount/refresh
    return () => {
      console.log("🧹 Cleaning up Agora client...");
      mountedRef.current = false;
      
      if (clientRef.current) {
        cleanupFuncs.forEach(cleanup => cleanup());
        
        clientRef.current.leave().then(() => {
          console.log("✅ Left channel");
        }).catch(console.error);
      }
      
      // ✅ Close ALL tracks
      localTracksRef.current.forEach(track => {
        try {
          track.close();
        } catch (e) {
          console.log("Track already closed");
        }
      });
      localTracksRef.current = [];
      
      setLocalTracks([]);
      setRemoteUsers([]);
      setClient(null);
    };
  }, [APP_ID, API_BASE_URL, channelName, uid, createClient]);

  return { client, localTracks, remoteUsers };
}
