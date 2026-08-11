import type { CSSProperties } from "react";

export function ResponsiveMedia({ src, alt, eager = false, className = "", style }: { src: string; alt: string; eager?: boolean; className?: string; style?: CSSProperties }) {
  return <img src={src} alt={alt} className={className} style={style} loading={eager ? "eager" : "lazy"} decoding="async" fetchPriority={eager ? "high" : "auto"} />;
}
