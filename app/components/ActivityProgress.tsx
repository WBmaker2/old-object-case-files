type Phase = "start" | "primer" | "case-intro" | "case" | "compare" | "result";
type CaseStep = "observe" | "initial" | "catalog" | "revision" | "context" | "final" | "summary";

const activityLabels = ["준비", "사건 1", "사건 2", "사건 3", "비교", "기록표"];
const caseStepLabels: Record<CaseStep, string> = {
  observe: "사진 관찰",
  initial: "가설 1",
  catalog: "목록 단서",
  revision: "가설 2",
  context: "맥락 단서",
  final: "가설 3",
  summary: "사건 정리",
};

function activityIndex(phase: Phase, caseIndex: number) {
  if (phase === "start" || phase === "primer") return 0;
  if (phase === "case-intro" || phase === "case") return caseIndex + 1;
  return phase === "compare" ? 4 : 5;
}

export function ActivityProgress({ phase, caseIndex }: { phase: Phase; caseIndex: number }) {
  const current = activityIndex(phase, caseIndex);
  return (
    <nav aria-label="전체 활동 진행" className="activity-progress">
      <ol>
        {activityLabels.map((label, index) => <li aria-current={index === current ? "step" : undefined} className={index <= current ? "is-reached" : ""} key={label}>
          <span>{label}</span>
        </li>)}
      </ol>
    </nav>
  );
}

export function CaseProgress({ step }: { step: CaseStep }) {
  const current = Object.keys(caseStepLabels).indexOf(step);
  return (
    <nav aria-label="현재 사건 진행" className="case-progress">
      <p className="case-progress-summary">현재 단계 {current + 1}/7 · {caseStepLabels[step]}</p>
      <ol>
        {Object.entries(caseStepLabels).map(([id, label], index) => <li aria-current={index === current ? "step" : undefined} className={index <= current ? "is-reached" : ""} key={id}>{label}</li>)}
      </ol>
    </nav>
  );
}
