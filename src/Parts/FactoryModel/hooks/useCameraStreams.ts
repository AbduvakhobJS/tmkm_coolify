import { useEffect, useState } from "react";
import { CAMERA_API_URL, TARGET_CAMERA_UUIDS } from "../constants";
import type { CameraStream } from "../types";

interface ApiCamera {
    id: number;
    stream_uuid: string;
    webrtc_server: string;
    model?: string;
    modelUz?: string;
    has_ptz?: boolean;
}

interface ApiResponse {
    factories: { cameras: ApiCamera[] }[];
}

function buildStreamUrl(cam: ApiCamera): string {
    return `${cam.webrtc_server}/stream/${cam.stream_uuid}/channel/1/webrtc?uuid=${cam.stream_uuid}&channel=1`;
}

/**
 * Fetches the 4 fixed CCTV feeds (in {@link TARGET_CAMERA_UUIDS} order) from the
 * backend and returns them as ready-to-play {@link CameraStream}s.
 *
 * `streams` stays empty until all 4 are resolved so consumers can render a
 * deterministic loading state.
 */
export function useCameraStreams(): { streams: CameraStream[]; loading: boolean } {
    const [streams, setStreams] = useState<CameraStream[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        fetch(CAMERA_API_URL)
            .then((r) => r.json())
            .then((data: ApiResponse) => {
                if (!alive) return;

                const all = data.factories.flatMap((f) => f.cameras);
                const resolved = TARGET_CAMERA_UUIDS.map((uuid, i) => {
                    const cam = all.find((c) => c.stream_uuid === uuid);
                    if (!cam) return null;
                    return {
                        id: cam.stream_uuid,
                        cameraId: cam.id,
                        label: cam.modelUz || cam.model || `Camera ${i + 1}`,
                        streamUrl: buildStreamUrl(cam),
                        hasPtz: Boolean(cam.has_ptz),
                    } satisfies CameraStream;
                }).filter((c): c is CameraStream => c !== null);

                if (resolved.length === TARGET_CAMERA_UUIDS.length) {
                    setStreams(resolved);
                }
                setLoading(false);
            })
            .catch((err) => {
                if (!alive) return;
                console.error("[FactoryModel] Camera API error:", err);
                setLoading(false);
            });

        return () => {
            alive = false;
        };
    }, []);

    return { streams, loading };
}
