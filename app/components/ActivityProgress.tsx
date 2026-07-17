type Phase = "start" | "primer" | "case-intro" | "case" | "compare" | "result";
type CaseStep = "observe" | "initial" | "catalog" | "revision" | "context" | "final" | "summary";

const activityLabels = ["준비", "사건 1", "사건 2", "사건 3", "비교", "기록표"];
const caseStepLabels: Record<CaseStep, string> = {
  observe: "사진 보기",
  initial: "첫 생각",
  catalog: "박물관 기록",
  revision: "생각 고치기",
  context: "새 비교 단서",
  final: "마지막 생각",
  summary: "정리",
};

const caseStepTasks: Record<CaseStep, string> = {
  observe: "사진을 보고 보이는 특징 두 개를 고르세요.",
  initial: "사진과 가장 잘 맞는 생각 하나를 고르세요.",
  catalog: "박물관에 적힌 내용을 읽어 보세요.",
  revision: "새 자료를 보고 생각을 그대로 둘지 고쳐 볼지 정하세요.",
  context: "다른 자료를 읽고 마지막 생각을 준비하세요.",
  final: "지금까지 자료를 보고 마지막 생각을 고르세요.",
  summary: "내가 고른 생각과 아직 모르는 점을 살펴보세요.",
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
      <p className="case-progress-summary"><strong>지금 할 일</strong> · {caseStepTasks[step]} <span className="technical-stage">현재 단계 {current + 1}/7 · {caseStepLabels[step]}</span></p>
      <progress aria-label={`현재 사건 진행 ${current + 1}/7`} className="case-progress-track" max={7} value={current + 1}>{current + 1}/7</progress>
      <ol>
        {Object.entries(caseStepLabels).map(([id, label], index) => <li aria-current={index === current ? "step" : undefined} className={index <= current ? "is-reached" : ""} key={id}>{label}</li>)}
      </ol>
    </nav>
  );
}
