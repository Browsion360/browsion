// Shared diagnostics + purge for Adsterra-style in-page push / social bar scripts.
// Used by AdSocialBar runtime cleanup and the admin diagnostics panel.

export const PUSH_SELECTORS = [
  "#ads-social-bar",
  '[id^="adsterra"]',
  '[class*="adsterra"]',
  '[id^="container-"]',
  'div[class*="in-page-push"]',
  'div[class*="social-bar"]',
  'iframe[src*="profitabledisplaynetwork"]',
  'iframe[src*="highperformanceformat"]',
  'iframe[src*="topcreativeformat"]',
  'iframe[src*="adsterra"]',
  'script[src*="profitabledisplaynetwork"]',
  'script[src*="highperformanceformat"]',
  'script[src*="topcreativeformat"]',
];

export type ScanResult = {
  total: number;
  bySelector: Array<{ selector: string; count: number }>;
  titleHijacked: boolean;
  expectedTitle: string;
  currentTitle: string;
};

export function scanForAdArtifacts(expectedTitle?: string): ScanResult {
  const bySelector: Array<{ selector: string; count: number }> = [];
  let total = 0;
  PUSH_SELECTORS.forEach((sel) => {
    let count = 0;
    try { count = document.querySelectorAll(sel).length; } catch {}
    if (count > 0) {
      bySelector.push({ selector: sel, count });
      total += count;
    }
  });
  const expected = expectedTitle ?? document.title;
  return {
    total,
    bySelector,
    titleHijacked: !!expectedTitle && document.title !== expectedTitle,
    expectedTitle: expected,
    currentTitle: document.title,
  };
}

export function purgeAdArtifacts(): number {
  let removed = 0;
  PUSH_SELECTORS.forEach((sel) => {
    try {
      document.querySelectorAll(sel).forEach((el) => {
        try { el.remove(); removed += 1; } catch {}
      });
    } catch {}
  });
  return removed;
}
