// import { useEffect } from "react";
//
// export default function LibraryAgent() {
//     useEffect(() => {
//         const script = document.createElement("script");
//
//         script.type = "module";
//         script.src = "https://agent.d-id.com/v2/index.js";
//
//         script.setAttribute("data-mode", "fabio");
//         script.setAttribute(
//             "data-client-key",
//             "ck_VsbSP1hzkB5v9LJFdaPQv"
//         );
//         script.setAttribute(
//             "data-agent-id",
//             "v2_agt_Dz4C5pV3"
//         );
//         script.setAttribute("data-name", "did-agent");
//         script.setAttribute("data-monitor", "true");
//         script.setAttribute("data-orientation", "horizontal");
//         script.setAttribute("data-position", "right");
//         script.setAttribute("data-open-mode", "expanded");
//
//         document.body.appendChild(script);
//
//         return () => {
//             script.remove();
//         };
//     }, []);
//
//     return null;
// }

import { useEffect } from "react";

export default function LibraryAgent() {
  useEffect(() => {
    const script = document.createElement("script");

    script.type = "module";
    script.src = "https://agent.d-id.com/v2/index.js";

    script.setAttribute("data-mode", "fabio");
    script.setAttribute(
      "data-client-key",
      "ck_skA6kEfUqv4WyYYrQBRo6"
    );
    script.setAttribute(
      "data-agent-id",
      "v2_agt_GM0Xe1Xs"
    );  
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
