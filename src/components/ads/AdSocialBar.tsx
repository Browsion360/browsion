import { useEffect } from "react";
import { PUSH_SELECTORS, purgeAdArtifacts } from "@/lib/adCleanup";

const BLOCKER_STYLE_ID = "ads-social-bar-permanent-blocker";

function installPermanentBlocker() {
  if (typeof document === "undefined" || document.getElementById(BLOCKER_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = BLOCKER_STYLE_ID;
  style.textContent = `${PUSH_SELECTORS.join(",")} { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }`;
  document.head.appendChild(style);
}

export function AdSocialBar() {
  useEffect(() => {
    installPermanentBlocker();
    purgeAdArtifacts();

    const observer = new MutationObserver(() => purgeAdArtifacts());
    observer.observe(document.documentElement, { childList: true, subtree: true });
    const sweeper = window.setInterval(() => purgeAdArtifacts(), 750);

    return () => {
      observer.disconnect();
      window.clearInterval(sweeper);
    };
  }, []);

  return null;
}
