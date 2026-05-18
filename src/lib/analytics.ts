import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_ID = "G-R5MGTXGXW3";

export function useGAPageviews() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    const page_path = location.pathname + location.search;
    window.gtag("event", "page_view", {
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);
}
