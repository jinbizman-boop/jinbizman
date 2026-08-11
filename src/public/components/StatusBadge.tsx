import type { ProjectStatus } from "../../content/public";

const labels: Record<ProjectStatus, string> = { development: "DEVELOPMENT", planning: "PLANNING", validation: "VALIDATION" };
export function StatusBadge({ status, value }: { status?: ProjectStatus | string; value?: string }) { const raw = String(value ?? status ?? ""); const label = raw in labels ? labels[raw as ProjectStatus] : raw.replaceAll("_", " ").toUpperCase(); return <span className={`status-badge status-${raw}`}>{label}</span>; }
