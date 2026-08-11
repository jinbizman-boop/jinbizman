export function SectionTitle({ eyebrow, title, body, dark = false }: { eyebrow: string; title: string; body?: string; dark?: boolean }) {
  return <header className={`section-title${dark ? " on-dark" : ""}`}>
    <span>{eyebrow}</span><h2>{title}</h2>{body ? <p>{body}</p> : null}
  </header>;
}
