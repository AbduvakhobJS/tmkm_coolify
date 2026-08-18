import { useEffect } from "react";

const CLIENT_KEY = "ck_VsbSP1hzkB5v9LJFdaPQv";
const AGENT_ID = "v2_agt_Dz4C5pV3";

export default function LibraryAgent() {
    useEffect(() => {
        // Script allaqachon qo'shilgan bo'lsa, qayta qo'shmaymiz
        if (document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]')) {
            return;
        }

        const script = document.createElement("script");

        script.type = "module";
        script.src = "https://agent.d-id.com/v2/index.js";

        script.setAttribute("data-mode", "fabio");
        script.setAttribute("data-client-key", CLIENT_KEY);
        script.setAttribute("data-agent-id", AGENT_ID);
        script.setAttribute("data-name", "did-agent");
        script.setAttribute("data-monitor", "true");
        script.setAttribute("data-orientation", "horizontal");
        script.setAttribute("data-position", "right");
        script.setAttribute("data-open-mode", "expanded");

        document.body.appendChild(script);

        return () => {
            script.remove();
        };
    }, []);

    return null;
}