import { useRef } from "react";

const IframeWrapper = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const token = localStorage.getItem("token");

    const handleLoad = () => {
        const iframe = iframeRef.current;

        if (!iframe) return;

        try {
            const doc =
                iframe.contentDocument ||
                iframe.contentWindow?.document;

            if (!doc) return;

            const element = doc.getElementById("KERAKLI_ID");

            if (element) {
                element.style.display = "none";
            }
        } catch (error) {
            console.error("Iframe DOM'iga kirib bo'lmadi:", error);
        }
    };

    return (
        <iframe
            ref={iframeRef}
            src={"http://45.9.231.133:5679/?from=2026-08-01&to=2026-08-31#h2&token=" + {token}}
            title="Dalban"
            onLoad={handleLoad}
            style={{
                width: "100%",
                height: "100%",
                border: "none",
            }}
        />
    );
};

export default IframeWrapper;