import React, { useEffect, useRef, useState } from "react";

interface WebRTCPlayerProps {
    url: string;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({ url }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);

    const [reconnectKey, setReconnectKey] = useState(0);

    useEffect(() => {
        let mounted = true;

        let mediaStream = new MediaStream();

        const start = async () => {
            try {
                if (!videoRef.current) return;

                videoRef.current.srcObject = mediaStream;

const pc = new RTCPeerConnection({
    iceServers: [
        {
            urls: ["stun:stun.l.google.com:19302"],
        },
    ],
});


                peerRef.current = pc;

                pc.ontrack = (event) => {
                    console.log("TRACK:", event.track.kind);

                    mediaStream.addTrack(event.track);
                };

                pc.onconnectionstatechange = () => {
                    console.log("STATE:", pc.connectionState);

                    if (
                        pc.connectionState === "failed" ||
                        pc.connectionState === "disconnected" ||
                        pc.connectionState === "closed"
                    ) {
                        reconnect();
                    }
                };

                const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                });

                await pc.setLocalDescription(offer);

                const formData = new FormData();

                formData.append(
                    "data",
                    btoa(pc.localDescription?.sdp || "")
                );

                const response = await fetch(url, {
                    method: "POST",
                    body: formData,
                });

                const answer = await response.text();

                if (!mounted) return;

                await pc.setRemoteDescription(
                    new RTCSessionDescription({
                        type: "answer",
                        sdp: atob(answer),
                    })
                );

                videoRef.current
                    .play()
                    .catch((err) => console.log(err));
            } catch (err) {
                console.error("WEBRTC ERROR:", err);

                reconnect();
            }
        };

        const reconnect = () => {
            console.log("RECONNECTING...");

            peerRef.current?.close();

            setTimeout(() => {
                setReconnectKey((p) => p + 1);
            }, 3000);
        };

        start();

        return () => {
            mounted = false;

            peerRef.current?.close();

            mediaStream.getTracks().forEach((t) => t.stop());
        };
    }, [url, reconnectKey]);

    return (
        <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                background: "#000",
            }}
        />
    );
};

export default WebRTCPlayer;
