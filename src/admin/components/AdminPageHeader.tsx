import type { ReactNode } from "react";
export function AdminPageHeader({ eyebrow, title, body, description, actions }: { eyebrow: string; title: string; body?: string; description?: string; actions?: ReactNode }) {
  const text = description ?? body;
  return <header className="admin-page-header"><div><span>{eyebrow}</span><h1>{title}</h1>{text ? <p>{text}</p> : null}</div>{actions ? <div className="admin-page-actions">{actions}</div> : null}</header>;
}
