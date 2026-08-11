export function RevisionDiff({ before, after }: { before: string; after: string }) {
  return <div className="revision-diff" aria-label="변경 전후 비교">
    <section><span>BEFORE</span><pre>{before || "이전 값 없음"}</pre></section>
    <section><span>AFTER</span><pre>{after || "새 값 없음"}</pre></section>
  </div>;
}
