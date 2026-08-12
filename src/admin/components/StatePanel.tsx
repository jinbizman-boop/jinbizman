import type { ReactNode } from "react";
export function StatePanel({ kind, title, description, children, action }: { kind: "loading"|"empty"|"error"|"forbidden"; title: string; description?: string; children?: ReactNode; action?: ReactNode }) {
  const role = kind === "error" || kind === "forbidden" ? "alert" : "status";
  return <div className={`admin-state state-${kind}`} role={role} aria-live={kind === "loading" ? "polite" : undefined}><span>{kind.toUpperCase()}</span><h2>{title}</h2>{description ? <p>{description}</p> : null}{children ? <div>{children}</div> : null}{action}</div>;
}
