import { useEffect, useState, useCallback, useRef } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function useAgora(channelName, uid, reconnectKey = 0) {
  const [client, setClient] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);

  const mountedRef = useRef(true);
  const clientRef = useRef(null);
  const localTracksRef = useRef([]);

  const createClient = useCallback(() => {
    return AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!uid || !APP_ID || !channelName) return;

    const newClient = createClient();
    clientRef.current = newClient;
    setClient(newClient);

    let cleanupFuncs = [];

    async function initAndJoin() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/video/token?channelName=${channelName}&uid=${uid}`
        );
        const { token } = await response.json();

        // ✅ Attach listeners BEFORE join
        const handleUserPublished = async (user, mediaType) => {
          await newClient.subscribe(user, mediaType);

          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
          if (mediaType === "video") {
            const remoteEl = document.getElementById(`remote-video-${user.uid}`);
            if (remoteEl) {
              user.videoTrack?.play(remoteEl);
            } else {
              // retry if element not yet rendered
              setTimeout(() => {
                const retryEl = document.getElementById(`remote-video-${user.uid}`);
                if (retryEl) user.videoTrack?.play(retryEl);
              }, 300);
            }
          }

          setRemoteUsers((prev) => {
            const exists = prev.find((u) => u.uid === user.uid);
            return exists ? prev.map((u) => (u.uid === user.uid ? user : u)) : [...prev, user];
          });
        };

        const handleUserUnpublished = (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        };

        const handleUserLeft = (user) => {
          setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
        };

        newClient.on("user-published", handleUserPublished);
        newClient.on("user-unpublished", handleUserUnpublished);
        newClient.on("user-left", handleUserLeft);

        cleanupFuncs = [
          () => newClient.off("user-published", handleUserPublished),
          () => newClient.off("user-unpublished", handleUserUnpublished),
          () => newClient.off("user-left", handleUserLeft),
        ];

        // ✅ Join channel
        await newClient.join(APP_ID, channelName, token, uid);
        setRemoteUsers(newClient.remoteUsers); // ✅ ensures already-connected peers are visible

        // ✅ Local tracks
        const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const camTrack = await AgoraRTC.createCameraVideoTrack();
        localTracksRef.current = [micTrack, camTrack];
        setLocalTracks([micTrack, camTrack]);

        await newClient.publish([micTrack, camTrack]);
      } catch (err) {
        console.error("❌ Agora error:", err);
      }
    }

    initAndJoin();

    return () => {
      mountedRef.current = false;
      if (clientRef.current) {
        cleanupFuncs.forEach((fn) => fn());
        clientRef.current.leave().catch(console.error);
      }
      localTracksRef.current.forEach((track) => track.close());
      localTracksRef.current = [];
      setLocalTracks([]);
      setRemoteUsers([]);
      setClient(null);
    };
  }, [APP_ID, API_BASE_URL, channelName, uid, createClient, reconnectKey]);

  return { client, localTracks, remoteUsers };
}