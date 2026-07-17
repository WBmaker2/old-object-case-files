"use client";

import { type RefObject, useState } from "react";
import { getRevealedClues } from "../lib/domain";
import type { CaseFile, HypothesisVersion, RevisionAction } from "../content/types";
import { EvidenceLabel } from "./EvidenceLabel";

const actions: { id: RevisionAction; label: string; hint: string }[] = [
  { id: "keep", label: "그대로 두기", hint: "새 자료가 내 생각과 이어져요." },
  { id: "refine", label: "조금 고치기", hint: "생각의 범위를 더 조심스럽게 고칠래요." },
  { id: "replace", label: "바꾸기", hint: "새 단서에 맞춰 다른 가설로 바꿀래요." },
  { id: "defer", label: "아직 결정하지 않기", hint: "지금은 더 단정하지 않을래요. (판단 보류)" },
];

interface RevisionFormProps {
  caseFile: CaseFile;
  previous: HypothesisVersion;
  stage: 2 | 3;
  heading: string;
  studentHeading: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onSave: (action: RevisionAction, hypothesisId: string, evidenceIds: string[]) => string | null;
}

export function RevisionForm({ caseFile, previous, stage, heading, studentHeading, headingRef, onSave }: RevisionFormProps) {
  const [action, setAction] = useState<RevisionAction>("keep");
  const [hypothesisId, setHypothesisId] = useState(previous.hypothesisId);
  const [evidenceIds, setEvidenceIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const clues = getRevealedClues(caseFile, stage);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = onSave(action, hypothesisId, evidenceIds);
    setMessage(error ?? "");
  }

  function toggleEvidence(id: string) {
    setEvidenceIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <form className="case-step" onSubmit={submit}>
      <h2 ref={headingRef} tabIndex={-1}>{studentHeading}</h2>
      <p className="technical-note">{heading}</p>
      <fieldset>
        <legend>새 자료를 보고 내 생각을 어떻게 할까요?</legend>
        <div className="choice-grid">
          {actions.map((item) => (
            <label className="choice-card" key={item.id}>
              <input checked={action === item.id} name={`action-${stage}`} onChange={() => {
                setAction(item.id);
                if (item.id === "defer") setHypothesisId("defer");
              }} type="radio" value={item.id} />
              <span><strong>{item.label}</strong><small>{item.hint}</small></span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>지금 가장 잘 맞는 생각을 고르세요</legend>
        <div className="option-list">
          {caseFile.hypotheses.map((hypothesis) => (
            <label key={hypothesis.id}>
              <input checked={hypothesisId === hypothesis.id} name={`hypothesis-${stage}`} onChange={() => setHypothesisId(hypothesis.id)} type="radio" value={hypothesis.id} />
              {hypothesis.text}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>내 생각에 영향을 준 자료를 하나 이상 고르세요</legend>
        <div className="evidence-options">
          {clues.map((clue) => (
            <label key={clue.id}>
              <input checked={evidenceIds.includes(clue.id)} onChange={() => toggleEvidence(clue.id)} type="checkbox" value={clue.id} />
              <EvidenceLabel status={clue.status} /> {clue.title}
            </label>
          ))}
        </div>
      </fieldset>
      {evidenceIds.length === 0 && <p className="selection-guide">자료를 하나 이상 고르면 기록할 수 있어요.</p>}
      <p aria-live="polite" className="form-message">{message}</p>
      <button className="button" disabled={evidenceIds.length === 0} type="submit">{stage === 2 ? "생각 2 기록하기" : "마지막 생각 기록하기"}</button>
    </form>
  );
}
