export const SUPPORTED_LOCALES = ["ko", "en", "ja", "fr", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ko";

export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  fr: "Français",
  es: "Español",
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  return isLocale(first) && first !== "ko" ? first : "ko";
}

export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && isLocale(parts[0]) && parts[0] !== "ko") parts.shift();
  return `/${parts.join("/")}`.replace(/\/$/, "") || "/";
}

export function localizedPath(locale: Locale, path: string): string {
  const normalized = path === "/" ? "" : `/${path.replace(/^\/+/, "")}`;
  return locale === "ko" ? normalized || "/" : `/${locale}${normalized}`;
}
