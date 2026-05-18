import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Scrolls window to top on route change for PUSH/REPLACE navigation.
 * Skips on POP (back/forward) so browser restores previous scroll,
 * and skips when a hash is present so anchor links keep working.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === "POP") return;
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash, navType]);

  return null;
}
