import { useState } from "react";

export type WorkflowStatus = "draft" | "review" | "published" | "archived";
const transitions: Record<WorkflowStatus, readonly { label: string; next: WorkflowStatus }[]> = {
  draft: [{ label: "검수 요청", next: "review" }],
  review: [{ label: "발행", next: "published" }, { label: "수정 요청", next: "draft" }],
  published: [{ label: "보관", next: "archived" }, { label: "발행 해제", next: "review" }],
  archived: [{ label: "초안으로 복원", next: "draft" }],
};
export function WorkflowPanel({ initialStatus = "draft", onTransition }: { initialStatus?: WorkflowStatus; onTransition?: (status: WorkflowStatus) => Promise<void> | void }) {
  const [status, setStatus] = useState<WorkflowStatus>(initialStatus);
  const [busy, setBusy] = useState(false);
  async function move(next: WorkflowStatus) {
    setBusy(true);
    try { await onTransition?.(next); setStatus(next); } finally { setBusy(false); }
  }
  return <aside className="workflow-panel" aria-label="콘텐츠 발행 워크플로">
    <div><span className="eyebrow">EDITORIAL WORKFLOW</span><h3>Publication gate</h3><b className={`admin-status status-${status}`}>{status}</b></div>
    <ol><li><strong>Source</strong><span>근거·소유권 확인</span></li><li><strong>Review</strong><span>정확성·권리·접근성·SEO 검수</span></li><li><strong>Publish</strong><span>권한 보유자의 공개 발행</span></li><li><strong>Archive</strong><span>버전 이력을 남긴 보관</span></li></ol>
    <div className="workflow-actions">{transitions[status].map((a)=><button type="button" disabled={busy} key={a.label} className={a.next === "published" ? "button primary" : "button"} onClick={()=>void move(a.next)}>{a.label}</button>)}</div>
  </aside>;
}
