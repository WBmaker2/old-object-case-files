import type { CaseFile, HypothesisVersion } from "../content/types";
import { CollapsibleSection } from "./CollapsibleSection";
import { EvidenceLabel } from "./EvidenceLabel";

const actionLabels = {
  keep: "그대로 두기",
  refine: "조금 고치기",
  replace: "바꾸기",
  defer: "아직 결정하지 않기",
};

export function HypothesisHistory({ caseFile, versions }: { caseFile: CaseFile; versions: readonly HypothesisVersion[] }) {
  if (versions.length === 0) return null;
  return (
    <CollapsibleSection className="history" label="내 생각 기록">
      <h3>생각이 어떻게 달라졌는지</h3>
      <ol>
        {versions.map((version) => (
          <li key={version.version}>
            <strong>가설 {version.version}</strong>
            <span>{version.statement}</span>
            <small>{version.version === 1 ? "첫 생각" : actionLabels[version.action]}</small>
            <EvidenceSummary caseFile={caseFile} version={version} />
          </li>
        ))}
      </ol>
    </CollapsibleSection>
  );
}

export function EvidenceSummary({ caseFile, version }: { caseFile: CaseFile; version: HypothesisVersion }) {
  const evidence = version.evidenceIds.flatMap((id) => {
    const observation = caseFile.observations.find((item) => item.id === id);
    if (observation) return [{ id, status: "observed" as const, title: "사진 관찰", text: observation.text }];
    const clue = caseFile.clues.find((item) => item.id === id);
    return clue ? [{ id, status: clue.status, title: clue.title, text: clue.text }] : [];
  });
  if (evidence.length === 0) return null;
  return (
    <div className="evidence-summary">
      <strong>고른 근거</strong>
      <ul>
        {evidence.map((item) => <li key={item.id}><EvidenceLabel status={item.status} /> <b>{item.title}</b> · {item.text}</li>)}
      </ul>
    </div>
  );
}
