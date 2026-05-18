import en from "./en.json";
import bn from "./bn.json";

type Dict = Record<string, string>;
const dicts: Record<string, Dict> = { en: en as Dict, bn: bn as Dict };

let currentLocale: "en" | "bn" =
  (typeof window !== "undefined" && (localStorage.getItem("locale") as "en" | "bn")) || "en";

export function setLocale(loc: "en" | "bn") {
  currentLocale = loc;
  if (typeof window !== "undefined") localStorage.setItem("locale", loc);
}
export function getLocale() { return currentLocale; }
export function t(key: string, fallback?: string): string {
  return dicts[currentLocale]?.[key] ?? dicts.en[key] ?? fallback ?? key;
}
