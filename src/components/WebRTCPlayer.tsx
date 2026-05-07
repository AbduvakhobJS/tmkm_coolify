import React, {useEffect, useRef, useState} from "react";

interface WebRTCPlayerProps {
    url: string;
}

const WebRTCPlayer: React.FC<WebRTCPlayerProps> = ({url}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const peerRef = useRef<RTCPeerConnection | null>(null);
    const [isOffline, setIsOffline] = useState<boolean>(false);
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

                // pc.onconnectionstatechange = () => {
                //     console.log("STATE:", pc.connectionState);
                //
                //     if (
                //         pc.connectionState === "failed" ||
                //         pc.connectionState === "disconnected" ||
                //         pc.connectionState === "closed"
                //     ) {
                //         reconnect();
                //     }
                // };
                pc.onconnectionstatechange = () => {
                    console.log("STATE:", pc.connectionState);
                    switch (pc.connectionState) {
                        case "connected":
                            setIsOffline(false);
                            break;
                        case "failed":
                        case "disconnected":
                        case "closed":
                            setIsOffline(true);
                            reconnect();
                            break;
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

    return (<div style={{width: "100%", height: "100%", position: "relative", background: "#000",}}>
        <video ref={videoRef} autoPlay muted playsInline controls={false}
               style={{width: "100%", height: "100%", objectFit: "cover", background: "#000",}}/>
        {isOffline && (<div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            zIndex: 10,
            gap: 10,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: 0.5,
        }}>
    <div className="d-flex" style={{alignItems: "center"}}>
        <div style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "red",
            animation: "blink 1s infinite",
            marginRight: "10px"
        }}/>
        <span>Signal yo‘q</span>
    </div>
            <span style={{fontSize: 11, opacity: 0.7,}}> Qayta ulanmoqda... </span>
        </div>)}
    </div>);
};

export default WebRTCPlayer;
