import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { localeFromPath, localizedPath, stripLocalePrefix, type Locale } from "../content/locales";

export interface RouteState {
  pathname: string;
  search: string;
  locale: Locale;
  publicPath: string;
  isAdmin: boolean;
}

function currentRoute(): RouteState {
  const pathname = window.location.pathname || "/";
  return {
    pathname,
    search: window.location.search,
    locale: localeFromPath(pathname),
    publicPath: stripLocalePrefix(pathname),
    isAdmin: pathname === "/admin" || pathname.startsWith("/admin/"),
  };
}

export function navigate(to: string, replace = false): void {
  if (/^(https?:)?\/\//.test(to)) {
    window.location.href = to;
    return;
  }
  if (replace) history.replaceState({}, "", to);
  else history.pushState({}, "", to);
  window.dispatchEvent(new Event("jinbiz:navigate"));
  window.scrollTo({ top: 0, behavior: "auto" });
}

export function useRoute(): RouteState {
  const [route, setRoute] = useState<RouteState>(() => currentRoute());
  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("popstate", onChange);
    window.addEventListener("jinbiz:navigate", onChange);
    return () => {
      window.removeEventListener("popstate", onChange);
      window.removeEventListener("jinbiz:navigate", onChange);
    };
  }, []);
  return route;
}

export function AppLink({ href, children, className, ariaLabel, onClick }: { href: string; children: ReactNode; className?: string; ariaLabel?: string; onClick?: () => void }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    event.preventDefault();
    onClick?.();
    navigate(href);
  }
  return <a href={href} className={className} aria-label={ariaLabel} onClick={handleClick}>{children}</a>;
}

export function publicRoute(locale: Locale, path: string): string {
  return localizedPath(locale, path);
}
