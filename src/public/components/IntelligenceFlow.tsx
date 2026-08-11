export function IntelligenceFlow({ steps }: { steps: string[] }) {
  return <div className="intelligence-flow" aria-label="JINBIZ Intelligence Flow">
    {steps.map((step, index) => <div className="flow-step" key={step} style={{ "--step": index } as React.CSSProperties}>
      <span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < steps.length - 1 ? <i aria-hidden="true" /> : null}
    </div>)}
  </div>;
}
