"use client";
/* eslint-disable @next/next/no-img-element -- verified museum JPEGs stay as unmodified local static files. */

import { useEffect, useMemo, useRef, useState } from "react";
import { findAsset, findHypothesis } from "../content/caseBank";
import type { CaseFile, HypothesisVersion, RevisionAction } from "../content/types";
import { createVersion, getRevealedClues, saveRevision as buildRevision } from "../lib/domain";
import { EvidenceLabel } from "./EvidenceLabel";
import { CaseProgress } from "./ActivityProgress";
import { HypothesisHistory } from "./HypothesisHistory";
import { RevisionForm } from "./RevisionForm";

type Step = "observe" | "initial" | "catalog" | "revision" | "context" | "final" | "summary";

const supportText = {
  "best-supported": "현재 공개된 단서에서 가장 잘 뒷받침돼요.",
  "plausible-limited": "가능하지만, 더 필요한 근거가 있어요.",
  "conflicts-with-clue": "새 단서와 잘 맞지 않는 부분이 있어요.",
  "responsible-defer": "지금은 판단 보류를 해도 괜찮아요.",
};

export function CasePanel({ caseFile, onComplete }: { caseFile: CaseFile; onComplete: (versions: HypothesisVersion[]) => void }) {
  const [step, setStep] = useState<Step>("observe");
  const [observations, setObservations] = useState<string[]>([]);
  const [initialHypothesis, setInitialHypothesis] = useState("");
  const [versions, setVersions] = useState<HypothesisVersion[]>([]);
  const [message, setMessage] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const asset = useMemo(() => findAsset(caseFile.assetId), [caseFile.assetId]);

  useEffect(() => {
    if (step !== "observe") headingRef.current?.focus();
  }, [step]);

  if (!asset) return <p role="alert">검수된 사진 기록을 찾지 못했습니다. 시작 화면으로 돌아가 다시 시도해 주세요.</p>;

  function toggleObservation(id: string) {
    setObservations((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 2 ? [...current, id] : current);
  }

  function saveInitial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const version = createVersion(caseFile, 1, initialHypothesis, observations, initialHypothesis === "defer" ? "defer" : "keep");
      setVersions([version]);
      setMessage("가설 1을 기록했어요. 다음에는 박물관 목록 단서를 읽습니다.");
      setStep("catalog");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "기록을 다시 확인해 주세요.");
    }
  }

  function recordRevision(stage: 2 | 3, action: RevisionAction, hypothesisId: string, evidenceIds: string[]) {
    try {
      const version = buildRevision(caseFile, versions.at(-1)!, stage, action, hypothesisId, evidenceIds);
      setVersions((current) => [...current, version]);
      setMessage(`가설 ${stage}을 기록했어요. 앞의 기록은 그대로 남아 있어요.`);
      setStep(stage === 2 ? "context" : "summary");
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "기록을 다시 확인해 주세요.";
    }
  }

  function clueCard(stage: 2 | 3) {
    return getRevealedClues(caseFile, stage).filter((clue) => clue.stage === stage).map((clue) => (
      <article className="clue-card" key={clue.id}>
        <EvidenceLabel status={clue.status} />
        <h3>{clue.title}</h3>
        <p>{clue.text}</p>
        <a href={clue.sourceUrl} rel="noreferrer" target="_blank">공식 기록 보기</a>
      </article>
    ));
  }

  const finalVersion = versions.at(-1);
  const finalHypothesis = finalVersion && findHypothesis(caseFile, finalVersion.hypothesisId);
  const limitedHypothesis = caseFile.hypotheses.find((item) => item.supportByStage[3] === "plausible-limited");
  return (
    <section aria-labelledby="case-title" className="case-panel">
      <CaseProgress step={step} />
      <div className="case-banner"><span>실제 박물관 소장품 사진</span><span>{caseFile.artifact.institution}</span></div>
      <h1 id="case-title">{caseFile.caseTitle}</h1>
      <p className="case-question">{caseFile.question}</p>
      <p aria-live="polite" className="status-line">{message}</p>

      {step === "observe" && <div className="case-step">
        <figure className="artifact-figure">
          <img alt={caseFile.imageAlt} src={asset.localPath} />
          <figcaption>사진 출처: {asset.institution} · 공공누리 제1유형 · 자세한 기록은 자료와 이미지 출처에서 확인할 수 있어요.</figcaption>
        </figure>
        <fieldset>
          <legend>사진에서 직접 보이는 특징을 정확히 2개 고르세요 ({observations.length}/2)</legend>
          <div className="option-list observation-list">
            {caseFile.observations.map((observation) => <label key={observation.id}>
              <input checked={observations.includes(observation.id)} disabled={!observations.includes(observation.id) && observations.length === 2} onChange={() => toggleObservation(observation.id)} type="checkbox" value={observation.id} />
              {observation.text}
            </label>)}
          </div>
        </fieldset>
        <button className="button" disabled={observations.length !== 2} onClick={() => setStep("initial")} type="button">관찰 기록을 바탕으로 가설 세우기</button>
      </div>}

      {step === "initial" && <form className="case-step" onSubmit={saveInitial}>
        <h2 ref={headingRef} tabIndex={-1}>가설 1 · 지금의 생각</h2>
        <fieldset>
          <legend>현재 사진으로 가장 설명력이 있다고 생각하는 가설을 고르세요</legend>
          <div className="option-list">
            {caseFile.hypotheses.map((hypothesis) => <label key={hypothesis.id}>
              <input checked={initialHypothesis === hypothesis.id} name="initial-hypothesis" onChange={() => setInitialHypothesis(hypothesis.id)} type="radio" value={hypothesis.id} />
              {hypothesis.text}
            </label>)}
          </div>
        </fieldset>
        <p className="gentle-note">처음 생각을 바꾸어도 감점이나 실패가 없어요.</p>
        {!initialHypothesis && <p className="selection-guide">가설 하나를 고르면 기록할 수 있어요.</p>}
        <button className="button" disabled={!initialHypothesis} type="submit">가설 1 기록하기</button>
      </form>}

      {step === "catalog" && <div className="case-step">
        <h2 ref={headingRef} tabIndex={-1}>목록 단서가 열렸어요</h2>
        {clueCard(2)}
        <button className="button" onClick={() => setStep("revision")} type="button">새 단서로 가설 다시 살피기</button>
      </div>}

      {step === "revision" && <RevisionForm caseFile={caseFile} heading="가설 2 · 목록 단서 뒤의 생각" headingRef={headingRef} onSave={(action, hypothesis, evidence) => recordRevision(2, action, hypothesis, evidence)} previous={versions[0]} stage={2} />}

      {step === "context" && <div className="case-step">
        <h2 ref={headingRef} tabIndex={-1}>맥락과 비교 단서가 열렸어요</h2>
        {clueCard(3)}
        <button className="button" onClick={() => setStep("final")} type="button">마지막 가설 기록하기</button>
      </div>}

      {step === "final" && <RevisionForm caseFile={caseFile} heading="가설 3 · 지금의 가장 조심스러운 설명" headingRef={headingRef} onSave={(action, hypothesis, evidence) => recordRevision(3, action, hypothesis, evidence)} previous={versions[1]} stage={3} />}

      {step === "summary" && <div className="case-step">
        <h2 ref={headingRef} tabIndex={-1}>사건 정리</h2>
        <div className="summary-grid">
          <article><h3>가장 잘 뒷받침됨</h3><p>{caseFile.hypotheses.find((item) => item.supportByStage[3] === "best-supported")?.text}</p></article>
          <article><h3>가능하지만 근거 부족</h3><p>{limitedHypothesis?.text ?? "해당 없음 — 현재 자료에서는 별도의 제한적 가능성을 남기지 않았어요."}</p></article>
          <article><h3>새 단서와 잘 맞지 않음</h3><p>{caseFile.hypotheses.find((item) => item.supportByStage[3] === "conflicts-with-clue")?.text ?? "이번 자료에서는 해당하지 않아요."}</p></article>
          <article><h3>현재는 알 수 없음</h3><p>{caseFile.unknownText}</p></article>
        </div>
        <p className="final-reading"><strong>내 마지막 가설:</strong> {finalVersion?.statement} <br />{finalHypothesis && supportText[finalHypothesis.supportByStage[3]]} {finalVersion?.action === "refine" ? "" : finalHypothesis?.scopeLimit}</p>
        <button className="button" onClick={() => onComplete(versions)} type="button">이 사건 기록을 닫고 다음으로</button>
      </div>}
      <HypothesisHistory caseFile={caseFile} versions={versions} />
    </section>
  );
}
