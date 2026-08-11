import type { ReactNode } from "react";
export function StatePanel({ kind, title, description, children, action }: { kind: "loading"|"empty"|"error"|"forbidden"; title: string; description?: string; children?: ReactNode; action?: ReactNode }) {
  return <div className={`admin-state state-${kind}`}><span>{kind.toUpperCase()}</span><h2>{title}</h2>{description ? <p>{description}</p> : null}{children ? <div>{children}</div> : null}{action}</div>;
}
